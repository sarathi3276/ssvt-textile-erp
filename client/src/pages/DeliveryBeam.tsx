import { useState } from "react";
import { useDeliveryBeams, useCreateDeliveryBeam, useParties } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function DeliveryBeam() {
  const { isAdmin } = useAuth();
  const { data: records, isLoading } = useDeliveryBeams();
  const { data: parties } = useParties();
  const createMutation = useCreateDeliveryBeam();
  const [open, setOpen] = useState(false);

const [formData, setFormData] = useState({
  partyId: "",
  beamType: "",
  beamCount: "",
  totalMeter: "",
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
  partyId: Number(formData.partyId),
  beamType: formData.beamType,
  beamCount: Number(formData.beamCount),
  totalMeter: Number(formData.totalMeter),
});
    setOpen(false);
setFormData({
  partyId: "",
  beamType: "",
  beamCount: "",
  totalMeter: "",
});  };

  const getPartyName = (id: number) => parties?.find(p => p.id === id)?.partyName || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Beam Deliveries</h2>
          <p className="text-sm text-muted-foreground">Log of prepared beams sent to parties.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-primary shadow-sm">+ Add Beam Delivery</Button>
            </DialogTrigger>
            <DialogContent className="rounded-none border-t-4 border-t-primary">
              <DialogHeader>
                <DialogTitle>Add Beam Delivery</DialogTitle>
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
  <Label>Beam Type</Label>
  <Select
    value={formData.beamType}
    onValueChange={(v) =>
      setFormData({
        ...formData,
        beamType: v,
      })
    }
    required
  >
    <SelectTrigger className="rounded-none">
      <SelectValue placeholder="Select Beam Type" />
    </SelectTrigger>

   <SelectContent className="rounded-none">
  <SelectItem value="20s">20s</SelectItem>
  <SelectItem value="26s">26s</SelectItem>
  <SelectItem value="30s">30s</SelectItem>
  <SelectItem value="40s">40s</SelectItem>
  <SelectItem value="20s(W)">20s(W)</SelectItem>
  <SelectItem value="26s(W)">26s(W)</SelectItem>
  <SelectItem value="30s(W)">30s(W)</SelectItem>
  <SelectItem value="40s(W)">40s(W)</SelectItem>
</SelectContent>
  </Select>
</div>

<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Beam Count</Label>
    <Input
      type="number"
      required
      value={formData.beamCount}
      onChange={(e) =>
        setFormData({
          ...formData,
          beamCount: e.target.value,
        })
      }
      className="rounded-none"
    />
  </div>

  <div className="space-y-2">
    <Label>Total Meter</Label>
    <Input
      type="number"
      required
      value={formData.totalMeter}
      onChange={(e) =>
        setFormData({
          ...formData,
          totalMeter: e.target.value,
        })
      }
      className="rounded-none"
    />
  </div>
</div>

                <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-none">
                  {createMutation.isPending ? "Saving..." : "Save Delivery"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

<ERPTable
  headers={[
    "Date",
    "Party",
    "Beam Type",
    "Beam Count",
    "Total Meter",
  ]}
>        {isLoading ? (
          <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
        ) : records?.length === 0 ? (
          <TableRow><TableCell colSpan={5} className="text-center py-8">No records found.</TableCell></TableRow>
        ) : (
          records?.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/50">
              <TableCell>{format(new Date(r.createdAt), 'dd-MMM-yyyy')}</TableCell>
              <TableCell className="font-bold capitalize">{getPartyName(r.partyId)}</TableCell>
            <TableCell>{r.beamType}</TableCell>
<TableCell>{r.beamCount}</TableCell>
<TableCell>{r.totalMeter} Mtr</TableCell>

            </TableRow>
          ))
        )}
      </ERPTable>
    </div>
  );
}
