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

  const [formData, setFormData] = useState({ partyId: "", totalMeter: "", rent: "0", cashPaid: "" });

  const selectedParty = useMemo(() => 
    parties?.find(p => p.id.toString() === formData.partyId), 
  [parties, formData.partyId]);

  // Calculations
  const pick = Number(selectedParty?.pick || 0);
  const totalMeters = Number(formData.totalMeter || 0);
  const rent = Number(formData.rent || 0);
  const cashPaid = Number(formData.cashPaid || 0);

  // Salary = ((TotalMeters / 80) * 86) * Pick * 0.10
  const grossSalary = totalMeters > 0 ? ((totalMeters / 80) * 86) * pick * 0.10 : 0;
  const finalSalary = grossSalary - rent;
  const balance = cashPaid - finalSalary; // Extra goes to advance (+), shortfall reduces advance (-)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParty) return;
    
    await createMutation.mutateAsync({
      partyId: selectedParty.id,
      totalMeter: totalMeters,
      pick: pick,
      salary: grossSalary,
      rent: rent,
      finalSalary: finalSalary,
      cashPaid: cashPaid,
      balance: balance,
    });
    setOpen(false);
    setFormData({ partyId: "", totalMeter: "", rent: "0", cashPaid: "" });
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
                  <Select value={formData.partyId} onValueChange={(v) => setFormData({...formData, partyId: v})} required>
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Select Party" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      {parties?.map(p => <SelectItem key={p.id} value={p.id.toString()} className="capitalize">{p.partyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Auto-fetched Pick</Label>
                    <Input disabled value={pick} className="bg-muted rounded-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Advance Bal.</Label>
                    <Input disabled value={`₹${Number(selectedParty?.advanceBalance || 0).toFixed(2)}`} className="bg-muted text-destructive rounded-none font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billable Meters</Label>
                    <Input type="number" step="0.01" required value={formData.totalMeter} onChange={e => setFormData({...formData, totalMeter: e.target.value})} className="rounded-none border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Deduct Rent</Label>
                    <Input type="number" step="0.01" required value={formData.rent} onChange={e => setFormData({...formData, rent: e.target.value})} className="rounded-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cash Paid to Party</Label>
                  <Input type="number" step="0.01" required value={formData.cashPaid} onChange={e => setFormData({...formData, cashPaid: e.target.value})} className="rounded-none bg-green-50" />
                </div>

                <div className="bg-slate-100 border p-3 text-sm space-y-1 font-mono mt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Gross Salary:</span> <span>₹{grossSalary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>- Rent:</span> <span>₹{rent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border pt-1 mb-1">
                    <span>Final Payable:</span> <span>₹{finalSalary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold pt-1">
                    <span>Advance Adjustment:</span> 
                    <span className={balance > 0 ? "text-destructive" : "text-green-600"}>
                      {balance > 0 ? `+ ₹${balance.toFixed(2)} (Added to Adv)` : `- ₹${Math.abs(balance).toFixed(2)} (Deducted from Adv)`}
                    </span>
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

      <ERPTable headers={["Date", "Party", "Meters", "Gross", "Rent", "Final Sal", "Paid", "Adv Change"]}>
        {isLoading ? (
          <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
        ) : records?.length === 0 ? (
          <TableRow><TableCell colSpan={8} className="text-center py-8">No records found.</TableCell></TableRow>
        ) : (
          records?.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/50">
              <TableCell>{format(new Date(r.createdAt), 'dd-MMM-yyyy')}</TableCell>
              <TableCell className="font-bold capitalize">{parties?.find(p => p.id === r.partyId)?.partyName}</TableCell>
              <TableCell>{r.totalMeter}</TableCell>
              <TableCell>₹{Number(r.salary).toFixed(0)}</TableCell>
              <TableCell>₹{Number(r.rent).toFixed(0)}</TableCell>
              <TableCell className="font-bold">₹{Number(r.finalSalary).toFixed(0)}</TableCell>
              <TableCell className="text-green-700 font-bold">₹{Number(r.cashPaid).toFixed(0)}</TableCell>
              <TableCell className={Number(r.balance) > 0 ? "text-destructive" : "text-green-600"}>
                {Number(r.balance) > 0 ? "+" : ""}₹{Number(r.balance).toFixed(0)}
              </TableCell>
            </TableRow>
          ))
        )}
      </ERPTable>
    </div>
  );
}
