import { useDashboardStats } from "@/hooks/use-erp-data";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Ruler, Users, HandCoins, Banknote, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { isAdmin } = useAuth();

  if (isLoading || !stats) {
    return <div className="h-64 flex items-center justify-center animate-pulse text-muted-foreground">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions - Admin Only */}
      {isAdmin && (
        <div className="bg-card border p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</div>
          <div className="flex flex-wrap gap-2">
            <Link href="/received-meter"><Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary/5">Add Received Meter</Button></Link>
            <Link href="/delivery-beam"><Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary/5">Add Beam Delivery</Button></Link>
            <Link href="/delivery-bag"><Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary/5">Add Bag Delivery</Button></Link>
            <Link href="/salary"><Button className="rounded-none bg-primary hover:bg-primary/90 shadow-sm">Add Salary</Button></Link>
            <Link href="/advance"><Button className="rounded-none bg-primary hover:bg-primary/90 shadow-sm">Add Advance</Button></Link>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Today Received" value={stats.todayReceivedMeter} icon={Ruler} unit="Mtr" />
        <MetricCard title="Weekly Total" value={stats.weeklyMeterTotal} icon={Activity} unit="Mtr" />
        <MetricCard title="Total Parties" value={stats.totalParties} icon={Users} />
        <MetricCard title="Pending Salary" value={stats.pendingSalary} icon={Banknote} unit="₹" className="border-l-4 border-l-destructive" />
        <MetricCard title="Total Advance" value={stats.totalAdvance} icon={HandCoins} unit="₹" className="border-l-4 border-l-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 rounded-none shadow-sm border-border">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-base">Weekly Meter Production</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 0, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="meters" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-none shadow-sm border-border flex flex-col">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              Recent Activity
              <span className="text-xs font-normal text-muted-foreground">Last 10 actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[350px]">
            <div className="divide-y divide-border">
              {stats.recentActivity.map((activity, i) => (
                <div key={i} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold capitalize">{activity.partyName}</p>
                    <p className="text-xs text-muted-foreground">{activity.activity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono">{activity.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(activity.date), 'dd-MMM-yyyy')}</p>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, unit = "", className = "" }: any) {
  return (
    <Card className={`rounded-none shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">
              {unit === "₹" ? "₹" : ""}{Number(value).toLocaleString()}{unit !== "₹" ? ` ${unit}` : ""}
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
