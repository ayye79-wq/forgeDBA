import { Link } from "wouter";
import { useListModules, useGetUserProgress, useCreateCheckoutSession } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Lock, BookOpen, CheckCircle2, ChevronRight, Zap, Star, TrendingUp, Shield, Flame, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const MODULE_META: Record<string, {
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  scenario: string;
  icon: React.ReactNode;
}> = {
  fundamentals: {
    difficulty: "Beginner",
    scenario: "You just got your first DBA job. Where do you even start?",
    icon: <Star className="h-5 w-5 text-primary" />,
  },
  backups: {
    difficulty: "Beginner",
    scenario: "A developer deleted an entire table. The CEO wants it back in 10 minutes.",
    icon: <Shield className="h-5 w-5 text-primary" />,
  },
  "recovery-models": {
    difficulty: "Intermediate",
    scenario: "Your log file is eating all disk space. It's Friday at 4pm. Fix it now.",
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
  },
  "performance-tuning": {
    difficulty: "Intermediate",
    scenario: "A query that took 2 seconds now takes 40. The app is unusable. Go.",
    icon: <Flame className="h-5 w-5 text-primary" />,
  },
  "high-availability": {
    difficulty: "Advanced",
    scenario: "Your primary SQL Server just crashed. You have 30 seconds to failover.",
    icon: <Zap className="h-5 w-5 text-primary" />,
  },
};

const DIFFICULTY_STYLES = {
  Beginner: "text-green-400 bg-green-500/10 border-green-500/20",
  Intermediate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Advanced: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function Modules() {
  const { data: modules, isLoading: isLoadingModules } = useListModules();
  const { data: progress, isLoading: isLoadingProgress } = useGetUserProgress();
  const createCheckoutSession = useCreateCheckoutSession();
  const { toast } = useToast();

  const hasLockedModules = modules?.some(m => m.isLocked) ?? false;

  const handleUnlock = () => {
    createCheckoutSession.mutate(undefined, {
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to initiate checkout. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoadingModules || isLoadingProgress) {
    return (
      <div className="container max-w-screen-xl px-4 py-8 mx-auto space-y-8">
        <div>
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Upgrade Bar */}
      {hasLockedModules && (
        <div className="sticky top-0 z-20 border-b border-primary/30 bg-primary/5 backdrop-blur-md">
          <div className="container max-w-screen-xl px-4 py-2.5 mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">
                Unlock all 5 modules, labs &amp; simulations —{" "}
                <span className="text-primary font-bold">$69 lifetime access</span>
              </span>
              <Badge variant="outline" className="text-xs border-primary/40 text-primary shrink-0 hidden sm:flex">
                Early access price
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={handleUnlock}
              disabled={createCheckoutSession.isPending}
              className="shrink-0 shadow-sm shadow-primary/20"
            >
              {createCheckoutSession.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Unlock Now →
            </Button>
          </div>
        </div>
      )}

      <div className="container max-w-screen-xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Train Like a Real DBA — Scenario-Based Modules
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Every module starts with a real production crisis. You learn by solving it — not by reading slides.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {modules?.sort((a, b) => a.order - b.order).map((mod) => {
            const modProgress = progress?.find(p => p.moduleId === mod.id);
            const percentComplete = modProgress?.percentComplete || 0;
            const isStarted = percentComplete > 0;
            const isCompleted = percentComplete === 100;
            const meta = MODULE_META[mod.id];

            return (
              <Card
                key={mod.id}
                className={`flex flex-col relative overflow-hidden transition-all duration-300 ${
                  mod.isLocked
                    ? "border-border/50 hover:border-primary/30"
                    : "hover:border-primary/50"
                }`}
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4 z-10">
                  {isCompleted ? (
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  ) : mod.isFree ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Free
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur text-muted-foreground border-border">
                      <Lock className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      {meta?.icon ?? <BookOpen className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1 leading-tight">{mod.title}</CardTitle>
                      {meta && (
                        <span className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[meta.difficulty]}`}>
                          {meta.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scenario hook */}
                  {meta?.scenario && (
                    <div className={`text-sm italic leading-snug mt-1 pl-3 border-l-2 ${mod.isLocked ? "text-muted-foreground/60 border-border/40" : "text-muted-foreground border-primary/40"}`}>
                      "{meta.scenario}"
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-4 pb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-primary/70" />
                      {mod.lessonCount} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary/70" />
                      {mod.estimatedMinutes} min
                    </div>
                  </div>

                  {/* Topics — blurred for locked */}
                  <div className={`flex flex-wrap gap-1.5 ${mod.isLocked ? "blur-[2px] select-none pointer-events-none opacity-60" : ""}`}>
                    {mod.topics.slice(0, 4).map((topic, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground">
                        {topic}
                      </span>
                    ))}
                    {mod.topics.length > 4 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-secondary/20 text-muted-foreground">
                        +{mod.topics.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {!mod.isLocked && isStarted && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-medium text-primary">{Math.round(percentComplete)}%</span>
                      </div>
                      <Progress value={percentComplete} className="h-1.5" />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/40">
                  {mod.isLocked ? (
                    <Button
                      className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50"
                      variant="ghost"
                      onClick={handleUnlock}
                      disabled={createCheckoutSession.isPending}
                    >
                      {createCheckoutSession.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      Unlock to Continue — $69
                    </Button>
                  ) : (
                    <Link href={`/modules/${mod.id}`} className="w-full">
                      <Button className="w-full group">
                        {isCompleted ? "Review Module" : isStarted ? "Continue Learning" : "Start Module"}
                        <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA for locked users */}
        {hasLockedModules && (
          <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-8 text-center">
            <div className="mx-auto max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Early Access Pricing
              </div>
              <h2 className="text-2xl font-bold mb-2">One payment. Lifetime access.</h2>
              <p className="text-muted-foreground mb-6">
                Get all 5 modules, every lab, every simulation, and all future content — forever.
                No subscriptions. No monthly fees.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={handleUnlock}
                  disabled={createCheckoutSession.isPending}
                  className="h-12 px-8 text-base shadow-lg shadow-primary/20 min-w-48"
                >
                  {createCheckoutSession.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Unlock Full Course — $69
                </Button>
                <p className="text-xs text-muted-foreground">Price increases soon · One-time payment</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
