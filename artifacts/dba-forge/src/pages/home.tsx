import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Database, Terminal, ShieldAlert, Cpu, ChevronRight, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { useGetStatsOverview } from "@workspace/api-client-react";

export default function Home() {
  const { data: stats } = useGetStatsOverview();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="container relative max-w-screen-xl px-4 md:px-8 mx-auto z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
              <Database className="mr-2 h-4 w-4" />
              <span>SQL Server DBA Training</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
              Forge yourself into a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                production-ready DBA
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Zero to job-ready. No fluff, no academic theory. Learn how to manage real production SQL Server environments, handle disasters, and optimize performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold">
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
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="py-8 bg-card border-b border-border/40">
          <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border/50">
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-3xl font-bold text-foreground">{stats.totalModules}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Modules</span>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-3xl font-bold text-foreground">{stats.totalLessons}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lessons</span>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-3xl font-bold text-foreground">{stats.totalEnrollments}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Enrollments</span>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-3xl font-bold text-foreground">{stats.premiumUsers}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pro DBAs</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What you will learn */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Master the DBA Arsenal</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our curriculum is forged from real-world incidents, outages, and performance bottlenecks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldAlert,
                title: "Disaster Recovery",
                desc: "Learn to build bulletproof backup strategies, handle database corruption, and recover from catastrophic failures."
              },
              {
                icon: Terminal,
                title: "T-SQL Mastery",
                desc: "Write high-performance queries, understand execution plans, and master indexing strategies."
              },
              {
                icon: Cpu,
                title: "Performance Tuning",
                desc: "Diagnose CPU, memory, and IO bottlenecks. Configure SQL Server for maximum throughput."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-xl border border-border/50 flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
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

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-card border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="container max-w-screen-xl px-4 md:px-8 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to step into the forge?</h2>
            <p className="text-xl text-muted-foreground">
              Join the ranks of professional DBAs. Start with the free fundamental modules today.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-8 text-lg font-bold w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
