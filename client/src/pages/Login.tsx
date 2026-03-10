import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Loader2 } from "lucide-react";

export default function Login() {
  const { user, login } = useAuth(); // Party login removed
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  if (user) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await login({ username, password });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary rounded-none">
        <CardHeader className="space-y-3 pb-8 pt-8">
          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <img src="/logo1.png" className="h-16 mx-auto mb-4" />
          </div>
          <CardTitle className="text-2xl text-center font-bold tracking-tight">SSVT</CardTitle>
          <CardDescription className="text-center text-base">
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Party Name</Label>
              <Input 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or sarathi" 
                required 
                className="h-12 border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                className="h-12 border-border focus-visible:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-md bg-primary hover:bg-primary/90 rounded-none"
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</>
              ) : (
                "Sign In to ERP"
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-xs text-muted-foreground border-t pt-6">
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
