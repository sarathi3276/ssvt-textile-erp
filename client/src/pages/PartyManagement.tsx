import { useState } from "react";
import { useParties, useCreateParty } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function PartyManagement() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect href="/" />;

  const { data: parties, isLoading } = useParties();
  const createMutation = useCreateParty();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    partyName: "",
    powerLoom: "",
    pick: "",
    reed: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      partyName: formData.partyName.toLowerCase(),
      powerLoom: Number(formData.powerLoom),
      pick: Number(formData.pick),
      reed: Number(formData.reed),
    });
    setOpen(false);
    setFormData({ partyName: "", powerLoom: "", pick: "", reed: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Party Management</h2>
          <p className="text-sm text-muted-foreground">Manage all connected parties and loom details.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-primary shadow-sm">+ Add New Party</Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-t-4 border-t-primary sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Party</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Party Name</Label>
                <Input required value={formData.partyName} onChange={e => setFormData({...formData, partyName: e.target.value})} className="rounded-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Power Looms</Label>
                  <Input type="number" required value={formData.powerLoom} onChange={e => setFormData({...formData, powerLoom: e.target.value})} className="rounded-none" />
                </div>
                <div className="space-y-2">
                  <Label>Pick</Label>
                  <Input type="number" step="0.01" required value={formData.pick} onChange={e => setFormData({...formData, pick: e.target.value})} className="rounded-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reed</Label>
                <Input type="number" step="0.01" required value={formData.reed} onChange={e => setFormData({...formData, reed: e.target.value})} className="rounded-none" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-none">
                {createMutation.isPending ? "Saving..." : "Save Party"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ERPTable headers={["ID", "Party Name", "Power Loom", "Pick", "Reed", "Advance Bal"]}>
        {isLoading ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading records...</TableCell></TableRow>
        ) : parties?.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8">No parties found.</TableCell></TableRow>
        ) : (
          parties?.map((p) => (
            <TableRow key={p.id} className="hover:bg-muted/50">
              <TableCell>#{p.id}</TableCell>
              <TableCell className="font-bold capitalize">{p.partyName}</TableCell>
              <TableCell>{p.powerLoom}</TableCell>
              <TableCell>{p.pick}</TableCell>
              <TableCell>{p.reed}</TableCell>
              <TableCell className={Number(p.advanceBalance) > 0 ? "text-destructive font-bold" : "text-primary"}>
                ₹{Number(p.advanceBalance).toLocaleString()}
              </TableCell>
            </TableRow>
          ))
        )}
      </ERPTable>
    </div>
  );
}
