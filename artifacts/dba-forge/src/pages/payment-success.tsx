import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { useVerifyPayment } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const { data, isLoading, isError, error } = useVerifyPayment(
    { session_id: sessionId || "" },
    { query: { enabled: !!sessionId, retry: 1 } }
  );

  useEffect(() => {
    if (data?.success) {
      // Invalidate profile query to refresh premium status
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    }
  }, [data]);

  if (!sessionId) {
    return (
      <div className="container max-w-lg px-4 py-24 mx-auto flex flex-col items-center text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold tracking-tight mb-4">Invalid Session</h1>
        <p className="text-muted-foreground mb-8 text-lg">No payment session ID was found in the URL.</p>
        <Link href="/modules">
          <Button size="lg">Return to Modules</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-lg px-4 py-24 mx-auto flex flex-col items-center text-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
        <h1 className="text-3xl font-bold tracking-tight mb-4">Verifying Payment</h1>
        <p className="text-muted-foreground text-lg">Forging your premium access...</p>
      </div>
    );
  }

  if (isError || (data && !data.success)) {
    return (
      <div className="container max-w-lg px-4 py-24 mx-auto">
        <Card className="border-destructive/50 bg-destructive/5 text-center p-6">
          <CardHeader>
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl text-destructive">Verification Failed</CardTitle>
            <CardDescription className="text-base mt-2">
              {data?.message || "There was an error verifying your payment. Please contact support if you have been charged."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-4">
            <Link href="/settings">
              <Button variant="outline">Go to Settings</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg px-4 py-24 mx-auto relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      
      <Card className="border-primary/40 shadow-2xl shadow-primary/10 overflow-hidden text-center relative bg-card/80 backdrop-blur">
        <div className="h-2 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
        <CardHeader className="pt-10 pb-6">
          <div className="mx-auto bg-primary/20 h-24 w-24 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Premium Unlocked!</CardTitle>
          <CardDescription className="text-lg mt-4 text-foreground/80 max-w-sm mx-auto">
            Your account has been successfully upgraded. You now have full access to all advanced DBA training modules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 pb-10">
          <div className="bg-muted/50 border border-border/50 rounded-lg p-4 inline-block mx-auto text-sm">
            <p className="text-muted-foreground font-mono">Receipt sent to your email</p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 border-t border-border/40 py-6 justify-center">
          <Link href="/modules">
            <Button size="lg" className="px-8 h-14 text-lg font-semibold w-full sm:w-auto shadow-lg shadow-primary/20">
              Start Training Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
