import { useUser } from "@clerk/react";
import { useGetUserProgress, useListModules } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Award, Printer, Share2, Database, CheckCircle2, ChevronRight, Linkedin } from "lucide-react";

export default function Certificate() {
  const { user } = useUser();
  const { data: progress } = useGetUserProgress();
  const { data: modules } = useListModules();

  const completedModuleIds = progress
    ?.filter(p => p.completedLessonIds && p.completedLessonIds.length >= 7)
    .map(p => p.moduleId) ?? [];

  const totalModules = modules?.length ?? 5;
  const completedCount = completedModuleIds.length;
  const isFullyComplete = completedCount >= totalModules;
  const completionDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const displayName = user?.fullName || user?.username || "DBA Forge Student";

  const handlePrint = () => window.print();

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://forgedba.com")}&summary=${encodeURIComponent(`I just completed the SQL Server DBA training on DBA Forge — hands-on scenario-based training that prepares you for real production work. forgedba.com`)}`;

  return (
    <div className="container max-w-screen-xl px-4 py-12 mx-auto">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Progress summary (always visible) */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary border border-primary/20">
            <Award className="h-4 w-4" />
            {isFullyComplete ? "Course Complete" : `${completedCount}/${totalModules} Modules Complete`}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {isFullyComplete ? "Your DBA Certificate" : "Your Progress Certificate"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isFullyComplete
              ? "You've completed the full DBA Forge curriculum. Well forged."
              : `Complete all ${totalModules} modules to earn your full certificate.`}
          </p>
        </div>

        {/* Certificate card */}
        <div id="certificate-card" className="relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/30 rounded-3xl p-10 shadow-2xl shadow-primary/10 overflow-hidden print:shadow-none print:border-primary/50">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <span className="text-xl font-black tracking-tight text-primary">DBA FORGE</span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                This certifies that
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{displayName}</h2>
            </div>

            <div className="space-y-2 max-w-lg">
              <p className="text-muted-foreground text-base">
                has successfully completed
              </p>
              <p className="text-xl font-bold text-foreground">
                {isFullyComplete
                  ? "SQL Server DBA Training — Full Curriculum"
                  : `SQL Server DBA Training — ${completedCount} of ${totalModules} Modules`}
              </p>
              <p className="text-muted-foreground text-sm">
                Scenario-based, production-ready SQL Server DBA skills
              </p>
            </div>

            {/* Module badges */}
            <div className="flex flex-wrap justify-center gap-2">
              {(modules ?? [
                { id: "fundamentals", title: "SQL Server Fundamentals" },
                { id: "backups", title: "Backups & Restores" },
                { id: "recovery-models", title: "Recovery Models" },
                { id: "performance-tuning", title: "Performance Tuning" },
                { id: "high-availability", title: "High Availability" },
              ]).map((mod) => {
                const done = completedModuleIds.includes(mod.id);
                return (
                  <span
                    key={mod.id}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                      done
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-muted/30 border-border/40 text-muted-foreground"
                    }`}
                  >
                    {done && <CheckCircle2 className="h-3 w-3" />}
                    {mod.title}
                  </span>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border/40 w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <span>Issued {completionDate}</span>
              <span className="font-mono text-xs opacity-60">forgedba.com</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
          <Button onClick={handlePrint} variant="outline" className="h-11 px-6 border-border/50">
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
          <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
            <Button className="h-11 px-6 w-full sm:w-auto bg-[#0077b5] hover:bg-[#006699] text-white">
              <Linkedin className="mr-2 h-4 w-4" />
              Share on LinkedIn
            </Button>
          </a>
        </div>

        {!isFullyComplete && (
          <div className="bg-card border border-border/50 rounded-xl p-6 text-center space-y-4 print:hidden">
            <p className="text-muted-foreground text-sm">
              You're <strong className="text-foreground">{completedCount}/{totalModules}</strong> of the way there. Keep going.
            </p>
            <Link href="/modules">
              <Button className="h-10 px-6">
                Continue Training
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-card, #certificate-card * { visibility: visible; }
          #certificate-card { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
