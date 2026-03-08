import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, Ruler, Package, Split, 
  Banknote, HandCoins, FileText, BarChart3, StickyNote, LogOut, Loader2 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger 
} from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, adminOnly: false },
    { title: "Parties", url: "/parties", icon: Users, adminOnly: true },
    { title: "Received Meter", url: "/received-meter", icon: Ruler, adminOnly: false },
    { title: "Bag Delivery", url: "/delivery-bag", icon: Package, adminOnly: false },
    { title: "Beam Delivery", url: "/delivery-beam", icon: Split, adminOnly: false },
    { title: "Salary", url: "/salary", icon: Banknote, adminOnly: false },
    { title: "Advance", url: "/advance", icon: HandCoins, adminOnly: false },
    { title: "Statement", url: "/statement", icon: FileText, adminOnly: false },
    { title: "Reports", url: "/reports", icon: BarChart3, adminOnly: true },
    { title: "Notes", url: "/notes", icon: StickyNote, adminOnly: true },
  ];

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar className="no-print border-r border-border">
          <div className="flex items-center px-6 h-16 border-b border-border bg-primary text-primary-foreground">
            <h1 className="text-xl font-bold tracking-wider">SSVT TEXTILE</h1>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2 px-6">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={`rounded-none mx-2 mb-1 ${isActive ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' : 'text-foreground/80 hover:bg-muted'}`}
                        >
                          <Link href={item.url} className="flex items-center gap-3 px-4 py-2">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t p-4">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase">
                {user.username.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground capitalize">{user.username}</span>
                <span className="text-xs text-muted-foreground uppercase">{user.role}</span>
              </div>
            </div>
            <button 
              onClick={() => logout()}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="no-print flex items-center justify-between h-16 px-6 border-b bg-card shadow-sm z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground capitalize">
                {visibleItems.find(i => i.url === location)?.title || "Dashboard"}
              </h2>
            </div>
            <div className="text-sm font-mono text-muted-foreground">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6 relative">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
