import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetModule, 
  useGetUserProgress, 
  useUpdateProgress, 
  useCreateCheckoutSession,
  Lesson
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, CheckCircle2, Circle, ChevronLeft, ChevronRight, Play, Terminal, AlertTriangle, AlertCircle, FileCheck2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function ModulePlayer() {
  const { moduleId } = useParams();
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const { data: moduleData, isLoading: isLoadingModule } = useGetModule(moduleId || "", { 
    query: { enabled: !!moduleId } 
  });
  const { data: progress, isLoading: isLoadingProgress } = useGetUserProgress();
  const updateProgress = useUpdateProgress();
  const createCheckoutSession = useCreateCheckoutSession();

  const moduleProgress = progress?.find(p => p.moduleId === moduleId);
  const completedLessonIds = moduleProgress?.completedLessonIds || [];

  // Set initial active lesson
  useEffect(() => {
    if (moduleData?.lessons && !activeLessonId) {
      // Find first incomplete lesson, or just use the first lesson
      const firstIncomplete = moduleData.lessons.find(l => !completedLessonIds.includes(l.id));
      setActiveLessonId(firstIncomplete?.id || moduleData.lessons[0].id);
    }
  }, [moduleData, completedLessonIds, activeLessonId]);

  const activeLesson = moduleData?.lessons.find(l => l.id === activeLessonId);
  const activeLessonIndex = moduleData?.lessons.findIndex(l => l.id === activeLessonId) ?? -1;
  const isLastLesson = activeLessonIndex === (moduleData?.lessons.length ?? 0) - 1;
  const isCompleted = activeLessonId ? completedLessonIds.includes(activeLessonId) : false;

  const handleUnlock = () => {
    createCheckoutSession.mutate(undefined, {
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: "Failed to initiate checkout. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleMarkComplete = () => {
    if (!moduleId || !activeLessonId) return;

    updateProgress.mutate({
      moduleId,
      data: { lessonId: activeLessonId, completed: true }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
        toast({
          title: "Lesson completed!",
          description: "Great job. Keep the momentum going.",
        });
        
        // Auto advance if not last lesson
        if (!isLastLesson && moduleData) {
          const nextLesson = moduleData.lessons[activeLessonIndex + 1];
          setActiveLessonId(nextLesson.id);
          // reset states
          setSelectedOption("");
          setCheckedItems({});
        }
      }
    });
  };

  if (isLoadingModule || isLoadingProgress) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 border-r border-border/40 p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-10 w-2/3 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!moduleData) return <div className="p-8 text-center">Module not found</div>;

  // Paywall overlay for locked modules
  if (moduleData.isLocked) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Link href="/modules">
          <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Modules
          </Button>
        </Link>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <Lock className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4">{moduleData.title}</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              This module covers advanced DBA techniques and requires premium access.
              Unlock the full course to access all training materials, scenarios, and labs.
            </p>
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg shadow-lg shadow-primary/20"
              onClick={handleUnlock}
              disabled={createCheckoutSession.isPending}
            >
              {createCheckoutSession.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Unlock Full Course
            </Button>
            <div className="mt-8 pt-8 border-t border-border/40 w-full max-w-md text-left">
              <h3 className="font-semibold mb-4 text-center">What's included in this module:</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {moduleData.lessons.slice(0, 5).map(l => (
                  <li key={l.id} className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                    <span>{l.title}</span>
                  </li>
                ))}
                {moduleData.lessons.length > 5 && (
                  <li className="text-center text-xs italic pt-2">
                    + {moduleData.lessons.length - 5} more lessons
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderLessonIcon = (type: string) => {
    switch(type) {
      case 'scenario': return <Play className="h-4 w-4" />;
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'code': return <Terminal className="h-4 w-4" />;
      case 'mistakes': return <AlertTriangle className="h-4 w-4" />;
      case 'simulation': return <AlertCircle className="h-4 w-4" />;
      case 'lab': return <Terminal className="h-4 w-4" />;
      case 'checklist': return <FileCheck2 className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const renderLessonContent = (lesson: Lesson) => {
    return (
      <div className="max-w-4xl mx-auto pb-24">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            {renderLessonIcon(lesson.type)}
            <span className="uppercase tracking-wider">{lesson.type}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
        </div>

        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground max-w-none mb-10">
          {lesson.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {lesson.codeExample && (
          <div className="my-8 rounded-lg overflow-hidden border border-border/50 bg-black shadow-lg">
            <div className="bg-muted/30 px-4 py-2 border-b border-border/50 flex items-center text-xs font-mono text-muted-foreground">
              <Terminal className="h-3 w-3 mr-2" /> T-SQL
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-green-400">
              <code>{lesson.codeExample}</code>
            </pre>
          </div>
        )}

        {lesson.type === 'simulation' && lesson.options && (
          <div className="my-8 space-y-6 bg-card p-6 border border-primary/20 rounded-xl">
            <h3 className="text-lg font-semibold">How do you respond?</h3>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
              {lesson.options.map((opt, i) => (
                <div key={i} className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${selectedOption === i.toString() ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="mt-1" />
                  <Label htmlFor={`opt-${i}`} className="font-normal cursor-pointer flex-1 text-base">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
            
            {selectedOption !== "" && lesson.correctOption !== undefined && (
              <div className={`p-4 rounded-lg mt-6 ${parseInt(selectedOption) === lesson.correctOption ? 'bg-green-500/10 border border-green-500/30' : 'bg-destructive/10 border border-destructive/30'}`}>
                <div className="flex items-center gap-2 mb-2 font-bold">
                  {parseInt(selectedOption) === lesson.correctOption ? (
                    <><CheckCircle2 className="h-5 w-5 text-green-500" /> <span className="text-green-500">Correct Response</span></>
                  ) : (
                    <><AlertTriangle className="h-5 w-5 text-destructive" /> <span className="text-destructive">Production Impacted</span></>
                  )}
                </div>
                <p className="text-sm text-foreground/80">{lesson.explanation}</p>
              </div>
            )}
          </div>
        )}

        {lesson.type === 'checklist' && lesson.checklistItems && (
          <div className="my-8 space-y-4 bg-card p-6 border border-border/50 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Procedure Checklist</h3>
            {lesson.checklistItems.map((item, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Checkbox 
                  id={`chk-${i}`} 
                  checked={checkedItems[i] || false}
                  onCheckedChange={(checked) => setCheckedItems(prev => ({...prev, [i]: !!checked}))}
                  className="mt-1"
                />
                <Label htmlFor={`chk-${i}`} className={`text-base font-normal cursor-pointer ${checkedItems[i] ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {item}
                </Label>
              </div>
            ))}
          </div>
        )}

        <Separator className="my-8" />

        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              if (activeLessonIndex > 0 && moduleData) {
                setActiveLessonId(moduleData.lessons[activeLessonIndex - 1].id);
                setSelectedOption("");
                setCheckedItems({});
              }
            }}
            disabled={activeLessonIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button 
            size="lg"
            className="px-8 font-semibold"
            disabled={
              updateProgress.isPending || 
              (lesson.type === 'simulation' && selectedOption === "") ||
              (lesson.type === 'checklist' && lesson.checklistItems && Object.keys(checkedItems).filter(k => checkedItems[k]).length !== lesson.checklistItems.length)
            }
            onClick={handleMarkComplete}
          >
            {updateProgress.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            ) : null}
            {isCompleted 
              ? (isLastLesson ? "Module Completed" : "Continue to Next") 
              : "Mark Complete"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border/40 bg-card/50 flex flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-border/40 shrink-0">
          <Link href="/modules">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
          <h2 className="font-bold text-lg leading-tight line-clamp-2">{moduleData.title}</h2>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span className="text-primary">{Math.round((completedLessonIds.length / moduleData.lessons.length) * 100)}%</span>
            <span>Complete</span>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {moduleData.lessons.map((lesson, idx) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isActive = activeLessonId === lesson.id;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setActiveLessonId(lesson.id);
                    setSelectedOption("");
                    setCheckedItems({});
                  }}
                  className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary-foreground font-medium border border-primary/20' 
                      : 'hover:bg-muted/50 text-muted-foreground border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-primary/60'}`} />
                    ) : (
                      <Circle className={`h-4 w-4 ${isActive ? 'text-primary/50' : 'text-muted-foreground/30'}`} />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <span className="line-clamp-2 leading-snug">{lesson.title}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                      {renderLessonIcon(lesson.type)} {lesson.type}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-background/50">
        <ScrollArea className="flex-1 px-4 md:px-12 py-8">
          {activeLesson ? renderLessonContent(activeLesson) : null}
        </ScrollArea>
      </div>
    </div>
  );
}
