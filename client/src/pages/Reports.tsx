import { useWeeklyReport, useMonthlyReport } from "@/hooks/use-erp-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalaries, useParties } from "@/hooks/use-erp-data";
import { ERPTable } from "@/components/shared/ERPTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Reports() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect href="/" />;

  const { data: weekly, isLoading: loadingWeekly } = useWeeklyReport();
  const { data: monthly, isLoading: loadingMonthly } = useMonthlyReport();

  return (
    <div className="space-y-6">
      <div className="bg-card p-4 border shadow-sm">
        <h2 className="text-xl font-bold">Management Reports</h2>
        <p className="text-sm text-muted-foreground">Aggregated data for production and salaries.</p>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-muted h-12 p-1">
          <TabsTrigger value="weekly" className="rounded-none data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">Weekly Salary Report</TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-none data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">Monthly Consolidate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="mt-4 border-none p-0">
          <ERPTable headers={["Party Name", "Week 1", "Week 2", "Week 3", "Week 4", "Total (₹)"]}>
            {loadingWeekly ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : weekly?.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-bold capitalize">{r.partyName}</TableCell>
                <TableCell>₹{r.week1.toLocaleString()}</TableCell>
                <TableCell>₹{r.week2.toLocaleString()}</TableCell>
                <TableCell>₹{r.week3.toLocaleString()}</TableCell>
                <TableCell>₹{r.week4.toLocaleString()}</TableCell>
                <TableCell className="text-primary font-bold bg-muted/50">₹{r.total.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </ERPTable>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-4 border-none p-0">
          <ERPTable headers={["Party", "Total Meter", "Gross Salary", "Rent Ded.", "Advance Ded.", "Cash Paid"]}>
            {loadingMonthly ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : monthly?.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-bold capitalize">{r.partyName}</TableCell>
                <TableCell className="text-primary font-bold">{r.totalMeter.toLocaleString()} Mtr</TableCell>
                <TableCell>₹{r.salary.toLocaleString()}</TableCell>
                <TableCell className="text-destructive">₹{r.rent.toLocaleString()}</TableCell>
                <TableCell className="text-destructive">₹{r.advance.toLocaleString()}</TableCell>
                <TableCell className="text-green-700 font-bold bg-muted/50">₹{r.paid.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </ERPTable>
        </TabsContent>
      </Tabs>
    </div>
  );
}
