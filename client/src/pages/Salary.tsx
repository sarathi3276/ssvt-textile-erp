import { useState, useMemo } from "react";
import { useSalaries, useCreateSalary, useParties } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function Salary() {
  const { isAdmin } = useAuth();
  const { data: records, isLoading } = useSalaries();
  const { data: parties } = useParties();
  const createMutation = useCreateSalary();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    partyId: "",
    totalMeter: "",
    pick: "",
    rate: "",
    rent: "",
    reduceAdvance: "",
  });
  const selectedParty = useMemo(() =>
    parties?.find(p => p.id.toString() === formData.partyId),
    [parties, formData.partyId]);

  // Calculations

  const pick = Number(formData.pick || 0);
  const rate = Number(formData.rate || 0);
  const rent = Number(formData.rent || 0);
  const advance = Number(selectedParty?.advanceBalance || 0);
  const reduceAdvance = Number(formData.reduceAdvance || 0);
  const totalMeters = Number(formData.totalMeter || 0);

  const basicSalary = totalMeters * pick * rate;

  const balance = basicSalary - rent - reduceAdvance;

  const remainingAdvance = advance - reduceAdvance;// Extra goes to advance (+), shortfall reduces advance (-)

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedParty) return;

  if (reduceAdvance > advance) {
    alert("Reduce Advance cannot be greater than Current Advance");
    return;
  }

  await createMutation.mutateAsync({
    partyId: selectedParty.id,
    totalMeter: totalMeters,
    pick,
    rate,
    basicSalary,
    rent,
    advance: remainingAdvance,
    balance,
  });

  setOpen(false);

  setFormData({
    partyId: "",
    totalMeter: "",
    pick: "",
    rate: "",
    rent: "",
    reduceAdvance: "",
  });
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Salary Records</h2>
          <p className="text-sm text-muted-foreground">Salary calculations and payouts.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-primary shadow-sm">+ Process Salary</Button>
            </DialogTrigger>
            <DialogContent className="rounded-none border-t-4 border-t-primary sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Salary Processing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Select Party</Label>
                  <Select value={formData.partyId} onValueChange={(v) => setFormData({ ...formData, partyId: v })} required>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select Party" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      {parties?.map(p => <SelectItem key={p.id} value={p.id.toString()} className="capitalize">{p.partyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label>Current Advance Bal.</Label>
                    <Input disabled value={`₹${Number(selectedParty?.advanceBalance || 0).toFixed(2)}`} className="bg-muted text-destructive rounded-none font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Meter</Label>
                    <Input
                      type="number"
                      value={formData.totalMeter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalMeter: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pick</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.pick}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pick: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rent</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rent: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reduce Advance</Label>
                    <Input
                      type="number"
                      value={formData.reduceAdvance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reduceAdvance: e.target.value,
                        })
                      }
                    />
                  </div>
                </div><div className="bg-slate-100 border p-3 text-sm space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>₹{basicSalary.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Rent</span>
                    <span>₹{rent.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Current Advance</span>
                    <span>₹{advance.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Reduce Advance</span>
                    <span>₹{reduceAdvance.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Remaining Advance</span>
                    <span>₹{remainingAdvance.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-t pt-2 font-bold text-primary">
                    <span>Balance</span>
                    <span>₹{balance.toFixed(2)}</span>
                  </div>
                </div>
                <Button type="submit" disabled={createMutation.isPending || !selectedParty} className="w-full rounded-none mt-2">
                  {createMutation.isPending ? "Processing..." : "Process & Save"}
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
    "Meter",
    "Pick",
    "Rate",
    "Basic Salary",
    "Rent",
    "Advance",
    "Balance",
  ]}
>
  {isLoading ? (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-8">
        Loading...
      </TableCell>
    </TableRow>
  ) : records?.length === 0 ? (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-8">
        No records found.
      </TableCell>
    </TableRow>
  ) : (
    records.map((r) => (
      <TableRow key={r.id}>
        <TableCell>
          {format(new Date(r.createdAt), "dd-MMM-yyyy")}
        </TableCell>

        <TableCell>
          {parties?.find((p) => p.id === r.partyId)?.partyName}
        </TableCell>

        <TableCell>{r.totalMeter}</TableCell>
        <TableCell>{r.pick}</TableCell>
        <TableCell>{r.rate}</TableCell>

        <TableCell>
          ₹{Number(r.basicSalary).toFixed(2)}
        </TableCell>

        <TableCell>
          ₹{Number(r.rent).toFixed(2)}
        </TableCell>

        <TableCell>
          ₹{Number(r.advance).toFixed(2)}
        </TableCell>

        <TableCell>
          ₹{Number(r.balance).toFixed(2)}
        </TableCell>
      </TableRow>
    ))
  )}
</ERPTable>
    </div>
  );
}