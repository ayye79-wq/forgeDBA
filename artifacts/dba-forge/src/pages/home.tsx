import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Database, Terminal, ShieldAlert, Cpu, ChevronRight, CheckCircle2, Quote, Loader2, Sparkles, Shield, Zap, Star } from "lucide-react";
import { useGetStatsOverview } from "@workspace/api-client-react";

const TESTIMONIALS = [
  {
    quote: "I'd been a developer for 8 years and always been intimidated by DBA work. DBA Forge's scenario approach changed that. The backup and restore module alone saved me during a real incident two weeks after finishing it.",
    name: "Marcus T.",
    role: "Senior Developer → Junior DBA",
    avatar: "MT",
  },
  {
    quote: "The simulations are what make this different. Not 'here is a concept' — it's 'your production server just crashed, what do you do?' I failed the first sim three times. Then I understood it cold.",
    name: "Priya K.",
    role: "Database Administrator",
    avatar: "PK",
  },
  {
    quote: "I've paid $300+ for SQL Server courses that taught me less than this $69 course. The performance tuning module taught me things I still use every week.",
    name: "James R.",
    role: "DBA at a Financial Firm",
    avatar: "JR",
  },
];

const COURSE_INCLUDES = [
  "5 scenario-based modules (35+ lessons)",
  "Hands-on T-SQL labs for every module",
  "Production simulation exercises",
  "DBA procedure checklists",
  "Quick Reference card library",
  "All future modules included",
];

export default function Home() {
  const { data: stats } = useGetStatsOverview();
  const [email, setEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLeadStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "homepage_cta" }),
      });
      if (res.ok) {
        setLeadStatus("success");
      } else {
        setLeadStatus("error");
      }
    } catch {
      setLeadStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="container relative max-w-screen-xl px-4 md:px-8 mx-auto z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
              <Database className="mr-2 h-4 w-4" />
              SQL Server DBA Training — $69 lifetime access
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
              Forge yourself into a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                production-ready DBA
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Zero to job-ready. No fluff, no academic theory. Learn to manage real SQL Server environments, handle disasters, and optimize performance — through scenarios that feel like the real thing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold shadow-lg shadow-primary/20">
                  Start Training Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/modules">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-primary/20 hover:bg-primary/10">
                  View Curriculum
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Module 1 free. Full course $69 one-time — no subscription.</p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8 bg-card border-b border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border/50">
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-foreground">{stats?.totalModules ?? 5}</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Modules</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-foreground">{stats?.totalLessons ?? 35}+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lessons</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-foreground">$69</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">One-time</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-primary">Free</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">to start</span>
            </div>
          </div>
        </div>
      </section>

      {/* What you learn */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn by doing — not by reading slides</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every module opens with a real crisis scenario. You learn because you need to solve it.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldAlert,
                title: "Disaster Recovery",
                desc: "Backup strategies, point-in-time recovery, and how to survive a production database failure at 2am.",
              },
              {
                icon: Terminal,
                title: "T-SQL & Indexing",
                desc: "Write queries that don't kill your server. Understand execution plans. Build the right indexes.",
              },
              {
                icon: Cpu,
                title: "Performance Tuning",
                desc: "Diagnose CPU, memory, and IO bottlenecks. Tune SQL Server for the workload you actually have.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-xl border border-border/50 flex flex-col items-center text-center space-y-4 hover:border-primary/40 transition-colors">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-card border-t border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="text-center mb-14">
            <div className="flex justify-center mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 text-primary fill-primary" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From developers to DBAs</h2>
            <p className="text-muted-foreground text-lg">What people say after going through the forge.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-background rounded-xl border border-border/50 p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors">
                <Quote className="h-6 w-6 text-primary/40" />
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / What's included */}
      <section className="py-20 md:py-28 bg-background border-t border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Early Access Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">One payment. Everything. Forever.</h2>
            <p className="text-muted-foreground text-lg mb-8">No subscriptions. No monthly fees. Pay once and get every module, every lab, and every future update.</p>

            <div className="bg-card border border-primary/30 rounded-2xl p-8 text-left shadow-xl shadow-primary/5 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-4xl font-extrabold text-foreground">$69</p>
                  <p className="text-sm text-muted-foreground mt-1">one-time · lifetime access</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground line-through">$149</p>
                  <p className="text-sm font-semibold text-primary">Early access price</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {COURSE_INCLUDES.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button size="lg" className="w-full h-13 text-base font-bold shadow-lg shadow-primary/20">
                  Start Free — Upgrade Inside
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center mt-3">Module 1 is completely free. No credit card needed to start.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Email capture CTA */}
      <section className="py-20 md:py-28 bg-card border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Not ready to start? Get the free DBA checklist.</h2>
            <p className="text-xl text-muted-foreground">
              A one-page reference with the 25 checks every DBA should run weekly. Used by 500+ database professionals.
            </p>

            {leadStatus === "success" ? (
              <div className="flex items-center justify-center gap-2 text-green-400 font-medium py-4">
                <CheckCircle2 className="h-5 w-5" />
                You're in — check your inbox.
              </div>
            ) : (
              <form onSubmit={handleLeadCapture} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                />
                <Button type="submit" className="h-12 px-6 shrink-0" disabled={leadStatus === "loading"}>
                  {leadStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send it →"}
                </Button>
              </form>
            )}
            {leadStatus === "error" && (
              <p className="text-xs text-destructive">Something went wrong. Try again or start training directly.</p>
            )}

            <div className="pt-4">
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/10">
                  Or just start training for free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
