import { useState } from "react";
import { useDeliveryBags, useCreateDeliveryBag, useParties } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function DeliveryBag() {
  const { isAdmin } = useAuth();
  const { data: records, isLoading } = useDeliveryBags();
  const { data: parties } = useParties();
  const createMutation = useCreateDeliveryBag();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({ partyId: "", bagType: "", numberOfBags: "", weightPerBag: "" });

  const totalWeight = (Number(formData.numberOfBags || 0) * Number(formData.weightPerBag || 0)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      partyId: Number(formData.partyId),
      bagType: formData.bagType,
      numberOfBags: Number(formData.numberOfBags),
      weightPerBag: Number(formData.weightPerBag),
      totalWeight: Number(totalWeight),
    });
    setOpen(false);
    setFormData({ partyId: "", bagType: "", numberOfBags: "", weightPerBag: "" });
  };

  const getPartyName = (id: number) => parties?.find(p => p.id === id)?.partyName || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Bag Deliveries</h2>
          <p className="text-sm text-muted-foreground">Log of yarn bags delivered to parties.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-primary shadow-sm">+ Add Bag Delivery</Button>
            </DialogTrigger>
            <DialogContent className="rounded-none border-t-4 border-t-primary">
              <DialogHeader>
                <DialogTitle>Add Bag Delivery</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Party Name</Label>
                  <Select value={formData.partyId} onValueChange={(v) => setFormData({...formData, partyId: v})} required>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select Party" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      {parties?.map(p => <SelectItem key={p.id} value={p.id.toString()} className="capitalize">{p.partyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bag Type</Label>
                  <Select value={formData.bagType} onValueChange={(v) => setFormData({...formData, bagType: v})} required>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="20s">20s</SelectItem>
                      <SelectItem value="30s">30s</SelectItem>
                      <SelectItem value="40s">40s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Bags</Label>
                    <Input type="number" required value={formData.numberOfBags} onChange={e => setFormData({...formData, numberOfBags: e.target.value})} className="rounded-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight Per Bag (kg)</Label>
                    <Input type="number" step="0.01" required value={formData.weightPerBag} onChange={e => setFormData({...formData, weightPerBag: e.target.value})} className="rounded-none" />
                  </div>
                </div>
                <div className="p-3 bg-muted border font-mono text-sm flex justify-between">
                  <span>Auto Calc Total Weight:</span>
                  <span className="font-bold">{totalWeight} kg</span>
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-none">
                  {createMutation.isPending ? "Saving..." : "Save Delivery"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ERPTable headers={["Date", "Party", "Type", "Bags", "Wt/Bag", "Total Weight"]}>
        {isLoading ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
        ) : records?.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8">No records found.</TableCell></TableRow>
        ) : (
          records?.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/50">
              <TableCell>{format(new Date(r.createdAt), 'dd-MMM-yyyy')}</TableCell>
              <TableCell className="font-bold capitalize">{getPartyName(r.partyId)}</TableCell>
              <TableCell>{r.bagType}</TableCell>
              <TableCell>{r.numberOfBags}</TableCell>
              <TableCell>{r.weightPerBag} kg</TableCell>
              <TableCell className="text-primary font-bold">{r.totalWeight} kg</TableCell>
            </TableRow>
          ))
        )}
      </ERPTable>
    </div>
  );
}
