import { useState } from "react";
import { useNotes, useCreateNote, useParties } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { format } from "date-fns";
import { Paperclip } from "lucide-react";

export default function Notes() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect href="/" />;

  const { data: notes, isLoading } = useNotes();
  const { data: parties } = useParties();
  const createMutation = useCreateNote();

  const [formData, setFormData] = useState({ partyId: "general", note: "", attachment: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      partyId: formData.partyId === "general" ? null : Number(formData.partyId),
      note: formData.note,
      attachment: formData.attachment || null,
    });
    setFormData({ partyId: "general", note: "", attachment: "" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="rounded-none border-t-4 border-t-primary shadow-sm h-fit sticky top-6">
          <CardHeader className="bg-muted/50 border-b pb-4">
            <CardTitle>Add Admin Note</CardTitle>
            <CardDescription>Record internal remarks or attach links.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Related To</Label>
                <Select value={formData.partyId} onValueChange={(v) => setFormData({...formData, partyId: v})}>
                  <SelectTrigger className="rounded-none bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="general">General (No Party)</SelectItem>
                    {parties?.map(p => <SelectItem key={p.id} value={p.id.toString()} className="capitalize">{p.partyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note Content</Label>
                <Textarea 
                  required 
                  rows={4}
                  value={formData.note} 
                  onChange={e => setFormData({...formData, note: e.target.value})} 
                  className="rounded-none resize-none" 
                  placeholder="Enter remarks..."
                />
              </div>
              <div className="space-y-2">
                <Label>Attachment Link (Optional)</Label>
                <div className="flex">
                  <div className="bg-muted border border-r-0 border-border px-3 flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    value={formData.attachment} 
                    onChange={e => setFormData({...formData, attachment: e.target.value})} 
                    className="rounded-none" 
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-none">
                {createMutation.isPending ? "Saving..." : "Save Note"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-4">
        <h2 className="text-xl font-bold bg-card p-4 border shadow-sm">Recent Notes</h2>
        {isLoading ? (
          <div className="animate-pulse text-muted-foreground text-center py-8">Loading notes...</div>
        ) : notes?.length === 0 ? (
          <div className="text-center py-12 bg-card border border-dashed text-muted-foreground">No notes recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {notes?.map(n => (
              <div key={n.id} className="bg-card border p-4 shadow-sm relative pl-12">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted flex items-center justify-center border-r">
                  <StickyNoteIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    {n.partyId ? (
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold capitalize mb-1">
                        Party: {parties?.find(p => p.id === n.partyId)?.partyName || "Unknown"}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs font-bold mb-1">General</span>
                    )}
                    <p className="text-sm font-mono text-muted-foreground">{format(new Date(n.createdAt), 'dd-MMM-yyyy hh:mm a')}</p>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{n.note}</p>
                {n.attachment && (
                  <div className="mt-3 pt-3 border-t">
                    <a href={n.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <Paperclip className="h-3 w-3" /> View Attachment
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StickyNoteIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>;
}
