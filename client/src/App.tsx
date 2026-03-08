import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppLayout>
      <Component />
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
            <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/parties" component={() => <ProtectedRoute component={PartyManagement} />} />
            <Route path="/received-meter" component={() => <ProtectedRoute component={ReceivedMeter} />} />
            <Route path="/delivery-bag" component={() => <ProtectedRoute component={DeliveryBag} />} />
            <Route path="/delivery-beam" component={() => <ProtectedRoute component={DeliveryBeam} />} />
            <Route path="/salary" component={() => <ProtectedRoute component={Salary} />} />
            <Route path="/advance" component={() => <ProtectedRoute component={Advance} />} />
            <Route path="/statement" component={() => <ProtectedRoute component={Statement} />} />
            <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
            <Route path="/notes" component={() => <ProtectedRoute component={Notes} />} />
            <Route component={NotFound} />
          </Switch>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
