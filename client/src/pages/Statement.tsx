import { useState } from "react";
import { useStatement, useParties } from "@/hooks/use-erp-data";
import { Button } from "@/components/ui/button";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer } from "lucide-react";
import { format } from "date-fns";

export default function Statement() {
  const { data: parties } = useParties();
  const [selectedPartyId, setSelectedPartyId] = useState<number | undefined>();
  const { data: statement, isLoading } = useStatement(selectedPartyId);

  const selectedParty = parties?.find(p => p.id === selectedPartyId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print-container bg-background">
      <div className="no-print bg-card p-4 border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Party Statement</h2>
          <p className="text-sm text-muted-foreground">Select a party to view their bank-style ledger.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select 
            value={selectedPartyId?.toString() || ""} 
            onValueChange={(v) => setSelectedPartyId(Number(v))}
          >
            <SelectTrigger className="w-[250px] rounded-none bg-background">
              <SelectValue placeholder="Select Party..." />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {parties?.map(p => <SelectItem key={p.id} value={p.id.toString()} className="capitalize">{p.partyName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} disabled={!selectedPartyId} variant="outline" className="rounded-none border-primary text-primary">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {selectedPartyId && (
        <div className="bg-card border p-6 shadow-sm">
          {/* Print Header */}
          <div className="hidden no-print:block print:block text-center mb-8 border-b-2 border-primary pb-6">
            <h1 className="text-2xl font-black tracking-widest uppercase">SSVT TEXTILE</h1>
            <p className="text-muted-foreground">Ledger Statement</p>
            <div className="mt-4 flex justify-between text-left">
              <div>
                <p className="font-bold capitalize text-lg">Party: {selectedParty?.partyName}</p>
                <p className="text-sm text-muted-foreground">Loom: {selectedParty?.powerLoom} | Pick: {selectedParty?.pick}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Generated: {format(new Date(), 'dd-MMM-yyyy')}</p>
                <p className="font-bold text-destructive mt-1">Current Advance: ₹{Number(selectedParty?.advanceBalance || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <ERPTable headers={["Date", "Description", "Meter (Mtr)", "Cash (₹)"]}>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading statement...</TableCell></TableRow>
            ) : statement?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">No records found for this party.</TableCell></TableRow>
            ) : (
              statement?.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/50">
                  <TableCell>{format(new Date(s.date), 'dd-MMM-yyyy')}</TableCell>
                  <TableCell className="font-medium text-foreground whitespace-pre-line">
  {s.description}
</TableCell>
                  <TableCell className="text-primary font-bold bg-primary/5">
                    {s.meter !== null ? `${s.meter}` : "-"}
                  </TableCell>
                  <TableCell className={Number(s.cash) > 0 ? "text-green-700 font-bold" : Number(s.cash) < 0 ? "text-destructive font-bold" : ""}>
                    {s.cash !== null ? `₹${Math.abs(s.cash).toLocaleString()}${Number(s.cash) < 0 ? ' (Dr)' : ' (Cr)'}` : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </ERPTable>
        </div>
      )}
      
      {!selectedPartyId && (
        <div className="h-64 border border-dashed border-border flex items-center justify-center text-muted-foreground bg-card">
          Select a party above to view their statement.
        </div>
      )}
    </div>
  );
}
