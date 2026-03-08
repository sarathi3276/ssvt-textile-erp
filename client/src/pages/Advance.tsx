import { useState } from "react";
import { useAdvances, useCreateAdvance, useParties } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function Advance() {
  const { isAdmin } = useAuth();
  const { data: records, isLoading } = useAdvances();
  const { data: parties } = useParties();
  const createMutation = useCreateAdvance();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({ partyId: "", amount: "", reason: "" });

  const selectedParty = parties?.find(p => p.id.toString() === formData.partyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      partyId: Number(formData.partyId),
      amount: Number(formData.amount),
      reason: formData.reason,
    });
    setOpen(false);
    setFormData({ partyId: "", amount: "", reason: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Cash Advances</h2>
          <p className="text-sm text-muted-foreground">Direct cash advances given to parties.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-primary shadow-sm">+ Issue Advance</Button>
            </DialogTrigger>
            <DialogContent className="rounded-none border-t-4 border-t-primary">
              <DialogHeader>
                <DialogTitle>Issue Cash Advance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Party</Label>
                  <Select value={formData.partyId} onValueChange={(v) => setFormData({...formData, partyId: v})} required>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select Party" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      {parties?.map(p => <SelectItem key={p.id} value={p.id.toString()} className="capitalize">{p.partyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedParty && (
                  <div className="p-2 bg-red-50 border border-red-100 text-sm">
                    <span className="text-red-800 font-medium">Current Balance: ₹{Number(selectedParty.advanceBalance).toLocaleString()}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="rounded-none" />
                </div>
                <div className="space-y-2">
                  <Label>Reason / Note</Label>
                  <Input required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="rounded-none" placeholder="e.g. Festival Advance" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-none">
                  {createMutation.isPending ? "Saving..." : "Issue Advance"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ERPTable headers={["Date", "Time", "Party", "Reason", "Amount", "Bal After"]}>
        {isLoading ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
        ) : records?.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8">No records found.</TableCell></TableRow>
        ) : (
          records?.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/50">
              <TableCell>{format(new Date(r.createdAt), 'dd-MMM-yyyy')}</TableCell>
              <TableCell>{format(new Date(r.createdAt), 'hh:mm a')}</TableCell>
              <TableCell className="font-bold capitalize">{parties?.find(p => p.id === r.partyId)?.partyName}</TableCell>
              <TableCell className="text-muted-foreground">{r.reason}</TableCell>
              <TableCell className="text-destructive font-bold">₹{Number(r.amount).toLocaleString()}</TableCell>
              <TableCell className="font-mono bg-muted/30">₹{Number(r.balance).toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </ERPTable>
    </div>
  );
}
