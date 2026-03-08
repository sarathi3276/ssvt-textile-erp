import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Components
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PartyManagement from "@/pages/PartyManagement";
import ReceivedMeter from "@/pages/ReceivedMeter";
import DeliveryBag from "@/pages/DeliveryBag";
import DeliveryBeam from "@/pages/DeliveryBeam";
import Salary from "@/pages/Salary";
import Advance from "@/pages/Advance";
import Statement from "@/pages/Statement";
import Reports from "@/pages/Reports";
import Notes from "@/pages/Notes";

function ProtectedRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/parties" component={PartyManagement}/>
        <Route path="/received-meter" component={ReceivedMeter}/>
        <Route path="/delivery-bag" component={DeliveryBag}/>
        <Route path="/delivery-beam" component={DeliveryBeam}/>
        <Route path="/salary" component={Salary}/>
        <Route path="/advance" component={Advance}/>
        <Route path="/statement" component={Statement}/>
        <Route path="/reports" component={Reports}/>
        <Route path="/notes" component={Notes}/>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/:rest*">
              <ProtectedRouter />
            </Route>
          </Switch>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
