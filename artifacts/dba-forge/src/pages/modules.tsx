import { Link } from "wouter";
import { useListModules, useGetUserProgress } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Lock, BookOpen, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Modules() {
  const { data: modules, isLoading: isLoadingModules } = useListModules();
  const { data: progress, isLoading: isLoadingProgress } = useGetUserProgress();

  if (isLoadingModules || isLoadingProgress) {
    return (
      <div className="container max-w-screen-xl px-4 py-8 mx-auto space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
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
    <div className="container max-w-screen-xl px-4 py-8 mx-auto">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Training Modules</h1>
        <p className="text-muted-foreground">
          Master SQL Server administration through scenario-based learning.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {modules?.sort((a, b) => a.order - b.order).map((mod) => {
          const modProgress = progress?.find(p => p.moduleId === mod.id);
          const percentComplete = modProgress?.percentComplete || 0;
          const isStarted = percentComplete > 0;
          const isCompleted = percentComplete === 100;

          return (
            <Card key={mod.id} className={`flex flex-col relative overflow-hidden transition-all duration-300 ${mod.isLocked ? 'opacity-80 hover:opacity-100' : 'hover:border-primary/50'}`}>
              {mod.isLocked && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur text-muted-foreground border-border">
                    <Lock className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              {mod.isFree && !isCompleted && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30">
                    Free Fundmentals
                  </Badge>
                </div>
              )}
              {isCompleted && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl line-clamp-1">{mod.title}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                  {mod.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-primary/70" />
                    {mod.lessonCount} Lessons
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary/70" />
                    {mod.estimatedMinutes} mins
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mod.topics.slice(0, 3).map((topic, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground">
                      {topic}
                    </span>
                  ))}
                  {mod.topics.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-md bg-secondary/20 text-muted-foreground">
                      +{mod.topics.length - 3} more
                    </span>
                  )}
                </div>

                {!mod.isLocked && isStarted && (
                  <div className="space-y-1.5 pt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round(percentComplete)}%</span>
                    </div>
                    <Progress value={percentComplete} className="h-2" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/40">
                {mod.isLocked ? (
                  <Link href={`/modules/${mod.id}`} className="w-full">
                    <Button variant="secondary" className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Unlock to Access
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/modules/${mod.id}`} className="w-full">
                    <Button className="w-full group">
                      {isCompleted ? 'Review Module' : isStarted ? 'Continue Learning' : 'Start Module'}
                      <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Small missing component
function ChevronRight(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
}
