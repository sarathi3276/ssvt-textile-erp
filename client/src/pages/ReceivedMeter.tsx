import { useState } from "react";
import { useReceivedMeters, useCreateReceivedMeter, useParties } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function ReceivedMeter() {
  const { isAdmin } = useAuth();
  const { data: meters, isLoading } = useReceivedMeters();
  const { data: parties } = useParties();
  const createMutation = useCreateReceivedMeter();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({ partyId: "", meter: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      partyId: Number(formData.partyId),
      meter: Number(formData.meter),
    });
    setOpen(false);
    setFormData({ partyId: "", meter: "" });
  };

  const getPartyName = (id: number) => parties?.find(p => p.id === id)?.partyName || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Received Meters</h2>
          <p className="text-sm text-muted-foreground">Log of all cloth meters received from parties.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-primary shadow-sm">+ Add Received Meter</Button>
            </DialogTrigger>
            <DialogContent className="rounded-none border-t-4 border-t-primary">
              <DialogHeader>
                <DialogTitle>Add Received Meter</DialogTitle>
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
                <div className="space-y-2">
                  <Label>Received Meter</Label>
                  <Input type="number" step="0.01" required value={formData.meter} onChange={e => setFormData({...formData, meter: e.target.value})} className="rounded-none" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-none">
                  {createMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ERPTable headers={["Date", "Time", "Party", "Meter"]}>
        {isLoading ? (
          <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
        ) : meters?.length === 0 ? (
          <TableRow><TableCell colSpan={4} className="text-center py-8">No records found.</TableCell></TableRow>
        ) : (
          meters?.map((m) => (
            <TableRow key={m.id} className="hover:bg-muted/50">
              <TableCell>{format(new Date(m.createdAt), 'dd-MMM-yyyy')}</TableCell>
              <TableCell>{format(new Date(m.createdAt), 'hh:mm a')}</TableCell>
              <TableCell className="font-bold capitalize">{getPartyName(m.partyId)}</TableCell>
              <TableCell className="text-primary font-bold">{m.meter} Mtr</TableCell>
            </TableRow>
          ))
        )}
      </ERPTable>
    </div>
  );
}
