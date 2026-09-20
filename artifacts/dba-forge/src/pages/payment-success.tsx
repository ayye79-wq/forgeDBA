import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useVerifyPayment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, AlertCircle, ArrowRight, CheckCircle2, Play, Database, Cpu, Server, Zap } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const NEXT_STEPS = [
  {
    number: "01",
    icon: Database,
    title: "Backups & Restores",
    href: "/modules/backups",
    desc: "Start here. This is the most critical DBA skill and the one you'll be judged on first.",
    label: "Start Module 2 →",
  },
  {
    number: "02",
    icon: Shield,
    title: "Recovery Models",
    href: "/modules/recovery-models",
    desc: "Understand Full vs Simple recovery and why your log file keeps growing.",
    label: "Queue it up",
  },
  {
    number: "03",
    icon: Cpu,
    title: "Performance Tuning",
    href: "/modules/performance-tuning",
    desc: "Learn to read execution plans and fix the queries killing your server.",
    label: "Queue it up",
  },
  {
    number: "04",
    icon: Server,
    title: "High Availability",
    href: "/modules/high-availability",
    desc: "AlwaysOn, failover clusters, and how to keep databases online 24/7.",
    label: "Queue it up",
  },
];

export default function PaymentSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const { data, isLoading, isError } = useVerifyPayment(
    { session_id: sessionId || "" },
    { query: { enabled: !!sessionId, retry: 1 } }
  );

  useEffect(() => {
    if (data?.success) {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
    }
  }, [data]);

  if (!sessionId) {
    return (
      <div className="container max-w-lg px-4 py-24 mx-auto flex flex-col items-center text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold tracking-tight mb-4">Invalid Session</h1>
        <p className="text-muted-foreground mb-8 text-lg">No payment session ID was found.</p>
        <Link href="/modules"><Button size="lg">Go to Modules</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-lg px-4 py-24 mx-auto flex flex-col items-center text-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
        <h1 className="text-3xl font-bold tracking-tight mb-4">Verifying Payment</h1>
        <p className="text-muted-foreground text-lg">Forging your access...</p>
      </div>
    );
  }

  if (isError || (data && !data.success)) {
    return (
      <div className="container max-w-lg px-4 py-24 mx-auto flex flex-col items-center text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-destructive">Verification Failed</h1>
        <p className="text-muted-foreground mb-8">
          {data?.message || "There was an error verifying your payment. If you were charged, please contact support."}
        </p>
        <Link href="/settings"><Button variant="outline">Go to Settings</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero confirmation */}
      <div className="relative overflow-hidden border-b border-border/40 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="container relative max-w-2xl px-4 mx-auto text-center z-10">
          <div className="mx-auto bg-primary/20 h-20 w-20 rounded-full flex items-center justify-center mb-6 border border-primary/30 shadow-xl shadow-primary/20">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-sm font-medium text-green-400 mb-4">
            <CheckCircle2 className="h-4 w-4" /> Payment confirmed
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Welcome to the forge.
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            You now have <strong className="text-foreground">lifetime access</strong> to every module, lab, simulation, and everything we add in the future.
          </p>
          <p className="text-sm text-muted-foreground">A receipt has been sent to your email.</p>
        </div>
      </div>

      {/* Onboarding: what to do next */}
      <div className="container max-w-3xl px-4 py-16 mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold mb-2">Your roadmap — start here</h2>
          <p className="text-muted-foreground">The modules build on each other. Work through them in order for the best results.</p>
        </div>

        <div className="space-y-4 mb-12">
          {NEXT_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-start gap-5 p-5 rounded-xl border transition-colors ${
                i === 0
                  ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                  : "border-border/50 bg-card hover:border-border"
              }`}
            >
              <div className="text-2xl font-extrabold text-muted-foreground/30 w-8 shrink-0 mt-0.5 tabular-nums">{step.number}</div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-0.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
              <Link href={step.href} className="shrink-0">
                <Button
                  size="sm"
                  variant={i === 0 ? "default" : "outline"}
                  className={i === 0 ? "shadow-sm shadow-primary/20" : "border-border/50"}
                >
                  {i === 0 ? <><Play className="mr-1.5 h-3.5 w-3.5" /> Start</> : "Go →"}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Quick tips */}
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Tips for getting the most out of DBA Forge
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Work through each module in full before moving to the next — they build on each other.</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Set up a local SQL Server instance (Express is free) and actually run the lab queries.</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Use the Quick Reference section as your daily cheat sheet on the job.</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Mark each lesson complete as you go — it keeps your progress saved across devices.</li>
          </ul>
        </div>

        <div className="text-center mt-10">
          <Link href="/modules">
            <Button size="lg" className="px-10 h-13 text-base font-semibold shadow-lg shadow-primary/20">
              View All Modules
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
