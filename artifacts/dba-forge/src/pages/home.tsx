import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Database, Terminal, ShieldAlert, Cpu, ChevronRight, CheckCircle2,
  Quote, Loader2, Sparkles, Star, Zap, Users, Clock, Lock,
  TrendingUp, Wrench, AlertCircle, BarChart2
} from "lucide-react";

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

const OUTCOMES = [
  { icon: ShieldAlert, text: "Restore a production database from scratch — under pressure" },
  { icon: TrendingUp, text: "Diagnose and fix slow queries before they page you at 2am" },
  { icon: Wrench, text: "Automate backups and verify they actually work" },
  { icon: AlertCircle, text: "Handle an outage without panicking — with a plan" },
  { icon: BarChart2, text: "Read execution plans and build the right indexes" },
  { icon: Lock, text: "Lock down SQL Server permissions without breaking the app" },
];

const WHO_ITS_FOR = [
  {
    label: "Beginners",
    desc: "You want a job as a DBA and need real skills — not YouTube theory.",
  },
  {
    label: "Developers",
    desc: "You write SQL every day but databases feel like a black box.",
  },
  {
    label: "IT / SysAdmins",
    desc: "You manage SQL Server but learned on the job and want to fill the gaps.",
  },
];

export default function Home() {
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
      setLeadStatus(res.ok ? "success" : "error");
    } catch {
      setLeadStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container relative max-w-screen-xl px-4 md:px-8 mx-auto z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">

            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-400">
              <Zap className="h-3.5 w-3.5 fill-amber-400" />
              Early Access — $69 (price goes up soon)
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
              Forge yourself into a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                production-ready DBA
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Zero to job-ready. <strong className="text-foreground">No theory. Real DBA work.</strong>{" "}
              Learn to manage SQL Server through scenarios that feel like the real thing — not slides.
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
            <p className="text-xs text-muted-foreground">Module 1 free. No credit card needed to start.</p>
          </div>
        </div>
      </section>

      {/* ── MONEY MOMENT: Pricing block ──────────────────────── */}
      <section className="py-16 md:py-20 bg-card border-b border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="max-w-2xl mx-auto">

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-4">
                <Sparkles className="h-3.5 w-3.5" /> One-time payment. Lifetime access.
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Get the full DBA Forge — $69</h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Everything you need to go from zero to production-ready DBA.
              </p>
            </div>

            <div className="bg-background border-2 border-primary/40 rounded-2xl p-8 shadow-2xl shadow-primary/10 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-foreground">$69</span>
                      <span className="text-muted-foreground text-lg line-through">$149</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">one-time · no subscription · lifetime updates</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-400">
                      <Zap className="h-3 w-3 fill-amber-400" />
                      54% off · limited
                    </span>
                  </div>
                </div>

                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                  {COURSE_INCLUDES.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/sign-up" className="flex-1">
                    <Button size="lg" className="w-full h-13 text-base font-bold shadow-lg shadow-primary/20">
                      Unlock Full Access — $69
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/modules">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto border border-border/50 hover:bg-primary/5">
                      See what's inside
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-400/80 font-medium">
                  <Zap className="h-3 w-3 fill-amber-400/60" />
                  Price will increase to $149 when early access ends
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="py-8 bg-background border-b border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border/50">
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-foreground">5</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Modules</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-foreground">35+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lessons</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-foreground">$69</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">One-time</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className="text-3xl font-bold text-primary flex items-center gap-1.5">
                <Users className="h-6 w-6" />247
              </span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Founding Members</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you'll be able to do ─────────────────────────── */}
      <section className="py-20 md:py-28 bg-card border-b border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="max-w-screen-lg mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">After this course, you will:</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Real skills. Real scenarios. The kind of ability you only get from doing — not watching.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {OUTCOMES.map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-background rounded-xl border border-border/50 p-5 hover:border-primary/30 transition-colors">
                  <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium leading-snug mt-0.5">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Who this is for ──────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-background border-b border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Who this is for</h2>
              <p className="text-muted-foreground text-lg">
                DBA Forge is built for people who want to work — not just learn.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {WHO_ITS_FOR.map((item, i) => (
                <div key={i} className="bg-card rounded-xl border border-border/50 p-6 text-center hover:border-primary/30 transition-colors">
                  <p className="text-lg font-bold text-primary mb-2">{item.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Learn by doing ───────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-card border-b border-border/40">
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
              <div key={i} className="bg-background p-8 rounded-xl border border-border/50 flex flex-col items-center text-center space-y-4 hover:border-primary/40 transition-colors">
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

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-background border-b border-border/40">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="text-center mb-14">
            <div className="flex justify-center mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 text-primary fill-primary" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From developers to DBAs</h2>
            <p className="text-muted-foreground text-lg">What founding members say after going through the forge.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-card rounded-xl border border-border/50 p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors">
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

      {/* ── Bottom CTA — dual path ───────────────────────────── */}
      <section className="py-20 md:py-28 bg-card border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8">

            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to become a real DBA?</h2>
              <p className="text-xl text-muted-foreground">
                Start free with Module 1 — or unlock everything now before the price goes up.
              </p>
            </div>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold shadow-lg shadow-primary/20">
                  Unlock Full DBA Forge — $69
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base border-primary/20 hover:bg-primary/10">
                  Start Free — Module 1
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              Module 1 is 100% free — no credit card. Full access is a one-time $69, no subscription.
            </p>

            {/* Email capture */}
            <div className="pt-6 border-t border-border/40">
              <p className="text-sm text-muted-foreground mb-4">Not ready yet? Get the free weekly DBA checklist.</p>
              {leadStatus === "success" ? (
                <div className="flex items-center justify-center gap-2 text-green-400 font-medium py-2">
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
                    className="flex-1 h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  />
                  <Button type="submit" variant="outline" className="h-11 px-5 shrink-0 border-primary/30" disabled={leadStatus === "loading"}>
                    {leadStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send it →"}
                  </Button>
                </form>
              )}
              {leadStatus === "error" && (
                <p className="text-xs text-destructive mt-2">Something went wrong — try again.</p>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
