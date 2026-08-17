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
  const partyList = Array.isArray(parties) ? parties : [];
  const salaryRecords = Array.isArray(records) ? records : [];

  const createMutation = useCreateSalary();
  const [open, setOpen] = useState(false);

 const [formData, setFormData] = useState({
  partyId: "",
  totalMeter: "",
  pick: "",
  rate: "",
  rent: "",
  reduceAdvance: "",
  paidAmount: "",
});
  const selectedParty = useMemo(() =>
    partyList.find(p => p.id.toString() === formData.partyId),
    [partyList, formData.partyId]);

  // Calculations
const pick = Number(formData.pick || 0);
const rate = Number(formData.rate || 0);
const rent = Number(formData.rent || 0);

const advance = Number(selectedParty?.advanceBalance ?? 0);
const previousBalance = Number(selectedParty?.currentBalance ?? 0);

const reduceAdvance = Number(formData.reduceAdvance || 0);
const paidAmount = Number(formData.paidAmount || 0);
const totalMeters = Number(formData.totalMeter || 0);

const basicSalary = totalMeters * pick * rate;

// Balance for this salary only
const currentSalaryBalance =
  basicSalary - rent - reduceAdvance - paidAmount;

// Running balance
const currentBalance =
  previousBalance + currentSalaryBalance;

// Remaining advance
const remainingAdvance =
  Math.max(0, advance - reduceAdvance);




  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedParty) return;

  if (reduceAdvance > advance) {
    alert("Reduce Advance cannot be greater than Current Advance");
    return;
  }
console.log("Previous Balance:", previousBalance);
console.log("Basic Salary:", basicSalary);
console.log("Rent:", rent);
console.log("Reduce Advance:", reduceAdvance);
console.log("Paid Amount:", paidAmount);
console.log("Current Salary Balance:", currentSalaryBalance);
console.log("Running Current Balance:", currentBalance);
await createMutation.mutateAsync({
  partyId: selectedParty.id,
  totalMeter: totalMeters,
  pick,
  rate,
  basicSalary,
  rent,
  advance: remainingAdvance,
  paidAmount,
  currentBalance,
  balance: currentSalaryBalance,
});
  setOpen(false);

  setFormData({
    partyId: "",
    totalMeter: "",
    pick: "",
    rate: "",
    rent: "",
   reduceAdvance: "",
paidAmount: "",
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
                      {partyList.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()} className="capitalize">
                          {p.partyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

             <div className="grid grid-cols-2 gap-4">

  <div className="space-y-2">
    <Label>Current Advance Bal.</Label>
    <Input
      disabled
      value={`₹${Number(selectedParty?.advanceBalance || 0).toFixed(2)}`}
      className="bg-muted text-destructive rounded-none font-bold"
    />
  </div>

  <div className="space-y-2">
    <Label>Current Balance</Label>
    <Input
      disabled
      value={`₹${Number(selectedParty?.currentBalance || 0).toFixed(2)}`}
      className="bg-muted text-primary rounded-none font-bold"
    />
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
                  <div className="space-y-2">
  <Label>Paid Amount</Label>
  <Input
    type="number"
    value={formData.paidAmount}
    onChange={(e) =>
      setFormData({
        ...formData,
        paidAmount: e.target.value,
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
  <span>Net Balance</span>
<span>₹{currentSalaryBalance.toFixed(2)}</span></div>

<div className="flex justify-between">
  <span>Paid Amount</span>
  <span>₹{paidAmount.toFixed(2)}</span>
</div>

<div className="flex justify-between border-t pt-2 font-bold text-primary">
  <span>Current Balance</span>
  <span>₹{currentBalance.toFixed(2)}</span>
</div></div>
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
  "Paid",
  "Current Balance",
]}
>
  {isLoading ? (
    <TableRow>
      <TableCell colSpan={10} className="text-center py-8">
        Loading...
      </TableCell>
    </TableRow>
  ) : salaryRecords.length === 0 ? (
    <TableRow>
      <TableCell colSpan={10} className="text-center py-8">
        No records found.
      </TableCell>
    </TableRow>
  ) : (
    salaryRecords.map((r) => (
      <TableRow key={r.id}>
        <TableCell>
          {format(new Date(r.createdAt), "dd-MMM-yyyy")}
        </TableCell>

        <TableCell>
          {partyList.find((p) => p.id.toString() === r.partyId?.toString())?.partyName ?? "-"}
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
  ₹{Number(r.paidAmount).toFixed(2)}
</TableCell>

<TableCell className="font-bold text-primary">
  ₹{Number(r.currentBalance).toFixed(2)}
</TableCell>
      </TableRow>
    ))
  )}
</ERPTable>
    </div>
  );
}