import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetModule, 
  useGetUserProgress, 
  useUpdateProgress, 
  useCreateCheckoutSession,
  getGetModuleQueryKey,
  getGetUserProgressQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Lock, CheckCircle2, Circle, ChevronLeft, ChevronRight, Play, Terminal, AlertTriangle, AlertCircle, FileCheck2, Loader2, Sparkles, BookOpen, Menu, Bot, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type Lesson = {
  id: string;
  title: string;
  type: string;
  content: string;
  codeExample?: string | null;
  options?: string[] | null;
  correctOption?: number | null;
  explanation?: string | null;
  checklistItems?: string[] | null;
  order: number;
};

export default function ModulePlayer() {
  const { moduleId } = useParams();
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiAnswerRef = useRef<HTMLDivElement>(null);

  const { data: moduleData, isLoading: isLoadingModule } = useGetModule(moduleId || "", { 
    query: { enabled: !!moduleId, queryKey: getGetModuleQueryKey(moduleId || "") } 
  });
  const { data: progress, isLoading: isLoadingProgress } = useGetUserProgress();
  const updateProgress = useUpdateProgress();
  const createCheckoutSession = useCreateCheckoutSession();

  const moduleProgress = progress?.find(p => p.moduleId === moduleId);
  const completedLessonIds = moduleProgress?.completedLessonIds || [];

  // Derived state — must be declared before the useEffects that reference them
  const activeLesson = moduleData?.lessons.find(l => l.id === activeLessonId);
  const activeLessonIndex = moduleData?.lessons.findIndex(l => l.id === activeLessonId) ?? -1;
  const isLastLesson = activeLessonIndex === (moduleData?.lessons.length ?? 0) - 1;
  const isCompleted = activeLessonId ? completedLessonIds.includes(activeLessonId) : false;

  useEffect(() => {
    if (moduleData?.lessons && !activeLessonId) {
      const firstIncomplete = moduleData.lessons.find(l => !completedLessonIds.includes(l.id));
      setActiveLessonId(firstIncomplete?.id || moduleData.lessons[0].id);
    }
  }, [moduleData, completedLessonIds, activeLessonId]);

  // Auto-restore checked state when landing on an already-completed checklist lesson
  useEffect(() => {
    if (!activeLesson || activeLesson.type !== 'checklist') return;
    if (isCompleted && activeLesson.checklistItems) {
      const all: Record<string, boolean> = {};
      activeLesson.checklistItems.forEach((_, i) => { all[i] = true; });
      setCheckedItems(all);
    }
  }, [activeLessonId, isCompleted]);

  // Auto-complete checklist lesson the moment the last item is ticked
  useEffect(() => {
    if (!activeLesson || activeLesson.type !== 'checklist') return;
    if (!activeLesson.checklistItems || isCompleted || updateProgress.isPending) return;
    const total = activeLesson.checklistItems.length;
    const checked = Object.values(checkedItems).filter(Boolean).length;
    if (checked === total && total > 0) {
      handleMarkComplete();
    }
  }, [checkedItems]);

  // Reset AI panel state when navigating to a new lesson
  useEffect(() => {
    setAiQuestion("");
    setAiAnswer("");
    setAiLoading(false);
    setAiOpen(false);
  }, [activeLessonId]);

  const handleUnlock = () => {
    createCheckoutSession.mutate(undefined, {
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to initiate checkout. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const askAI = async () => {
    if (!aiQuestion.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer("");
    let accumulated = "";
    try {
      const resp = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: aiQuestion, moduleId, lessonId: activeLessonId }),
      });
      if (!resp.ok || !resp.body) throw new Error("Request failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              accumulated += json.content;
              setAiAnswer(accumulated);
              if (aiAnswerRef.current) aiAnswerRef.current.scrollTop = aiAnswerRef.current.scrollHeight;
            }
            if (json.error) setAiAnswer(json.error);
          } catch {}
        }
      }
    } catch {
      setAiAnswer("Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleMarkComplete = () => {
    if (!moduleId || !activeLessonId) return;

    updateProgress.mutate({
      moduleId,
      data: { lessonId: activeLessonId, completed: true }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserProgressQueryKey() });
        toast({
          title: "Lesson completed!",
          description: "Great job. Keep the momentum going.",
        });
        if (!isLastLesson && moduleData) {
          const nextLesson = moduleData.lessons[activeLessonIndex + 1];
          setActiveLessonId(nextLesson.id);
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

  // For locked modules: show scenario preview on first lesson, paywall gate on others
  const isPreviewLesson = moduleData.isLocked && activeLessonIndex === 0;
  const isPaywalled = moduleData.isLocked && activeLessonIndex > 0;

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

  const renderPaywallGate = () => (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-10 text-center shadow-2xl shadow-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background rounded-2xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary border border-primary/20">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You've seen what's coming</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            This module has <strong className="text-foreground">{moduleData.lessons.length - 1} more lessons</strong> including 
            hands-on labs, simulations, and a complete DBA checklist. Unlock everything for a one-time fee.
          </p>
          <Button
            size="lg"
            className="h-13 px-8 text-base font-semibold shadow-lg shadow-primary/20 mb-4"
            onClick={handleUnlock}
            disabled={createCheckoutSession.isPending}
          >
            {createCheckoutSession.isPending 
              ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              : <Sparkles className="mr-2 h-5 w-5" />
            }
            Unlock Full Course — $69
          </Button>
          <p className="text-xs text-muted-foreground">One-time payment · All modules · No subscription</p>
          <div className="mt-8 pt-6 border-t border-border/40 w-full text-left">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3 text-center">What's inside this module</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {moduleData.lessons.slice(1, 6).map(l => (
                <li key={l.id} className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                  <span className="text-muted-foreground/70">{l.title}</span>
                </li>
              ))}
              {moduleData.lessons.length > 6 && (
                <li className="text-xs text-muted-foreground/50 text-center pt-1">
                  + {moduleData.lessons.length - 6} more lessons
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLessonContent = (lesson: Lesson) => {
    return (
      <div className="max-w-4xl mx-auto pb-24">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            {renderLessonIcon(lesson.type)}
            <span className="uppercase tracking-wider">{lesson.type}</span>
            {isPreviewLesson && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-normal">
                Free Preview
              </span>
            )}
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

        {isPreviewLesson ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground">That's the scenario. Ready to learn how to handle it?</p>
            <Button
              size="lg"
              className="px-8 font-semibold shadow-lg shadow-primary/20"
              onClick={handleUnlock}
              disabled={createCheckoutSession.isPending}
            >
              {createCheckoutSession.isPending 
                ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                : <Sparkles className="mr-2 h-5 w-5" />
              }
              Unlock Full Course — $69
            </Button>
            <p className="text-xs text-muted-foreground">One-time payment · All modules · No subscription</p>
          </div>
        ) : (
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
                (lesson.type === 'checklist' && !!lesson.checklistItems && Object.keys(checkedItems).filter(k => checkedItems[k]).length !== lesson.checklistItems.length)
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
        )}

        {moduleId === "daily-operations" && isLastLesson && isCompleted && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h3 className="font-semibold">Training complete—now apply it</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with coached decisions, then enter the live operations
              cockpit without multiple-choice answers.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/workday-simulator">
                <Button variant="outline">Open Guided Scenarios</Button>
              </Link>
              <Link href="/workday-simulator/live">
                <Button>Launch Live Shift</Button>
              </Link>
            </div>
          </div>
        )}

        {/* AI Q&A Panel */}
        <div className="mt-10 rounded-xl border border-primary/20 bg-card overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
            onClick={() => setAiOpen(v => !v)}
          >
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Bot className="h-4 w-4 text-primary" />
              Ask the AI Tutor
              <span className="text-xs font-normal text-muted-foreground ml-1">— get instant answers about this lesson</span>
            </div>
            {aiOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {aiOpen && (
            <div className="border-t border-border/40 p-5 space-y-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Ask anything about this lesson… e.g. 'What is a transaction log and why does it grow?'"
                  value={aiQuestion}
                  onChange={e => setAiQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askAI(); } }}
                  rows={2}
                  className="resize-none text-sm flex-1"
                  disabled={aiLoading}
                />
                <Button
                  size="sm"
                  className="self-end shrink-0 px-4"
                  onClick={askAI}
                  disabled={aiLoading || !aiQuestion.trim()}
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {(aiAnswer || aiLoading) && (
                <div
                  ref={aiAnswerRef}
                  className="max-h-72 overflow-y-auto rounded-lg bg-muted/30 border border-border/40 p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap"
                >
                  {aiAnswer || <span className="text-muted-foreground animate-pulse">Thinking…</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border/40 bg-card/50 flex-col hidden md:flex shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
        <div className="p-4 border-b border-border/40 shrink-0">
          <Link href="/modules">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
          <h2 className="font-bold text-lg leading-tight line-clamp-2">{moduleData.title}</h2>
          {moduleData.isLocked && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium">
              <Lock className="h-3 w-3" />
              <span>Free preview — Lesson 1 only</span>
            </div>
          )}
          {!moduleData.isLocked && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="text-primary">{Math.round((completedLessonIds.length / moduleData.lessons.length) * 100)}%</span>
              <span>Complete</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
          <div className="p-3 pb-6 space-y-1">
            {moduleData.lessons.map((lesson, idx) => {
              const isDone = completedLessonIds.includes(lesson.id);
              const isActive = activeLessonId === lesson.id;
              const isAccessible = !moduleData.isLocked || idx === 0;

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    if (isAccessible) {
                      setActiveLessonId(lesson.id);
                      setSelectedOption("");
                      setCheckedItems({});
                    }
                  }}
                  disabled={!isAccessible}
                  className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary/15 text-foreground font-semibold ring-1 ring-primary/50' 
                      : isAccessible
                        ? 'hover:bg-muted/50 text-muted-foreground'
                        : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {!isAccessible ? (
                      <Lock className="h-4 w-4 text-muted-foreground/30" />
                    ) : isDone ? (
                      <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-green-500'}`} />
                    ) : (
                      <Circle className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <span className="line-clamp-2 leading-snug">{lesson.title}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                      {renderLessonIcon(lesson.type)} {lesson.type}
                      {idx === 0 && moduleData.isLocked && (
                        <span className="ml-1 text-primary/70">· Preview</span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {moduleData.isLocked && (
          <div className="p-4 border-t border-border/40 shrink-0">
            <Button
              className="w-full"
              size="sm"
              onClick={handleUnlock}
              disabled={createCheckoutSession.isPending}
            >
              {createCheckoutSession.isPending 
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Sparkles className="mr-2 h-4 w-4" />
              }
              Unlock — $69
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background/50 min-w-0">

        {/* Mobile header bar */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-border/40 sticky top-16 z-10 bg-background/95 backdrop-blur">
          <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border/40">
                <Link href="/modules" onClick={() => setMobileDrawerOpen(false)}>
                  <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                    <ChevronLeft className="mr-1 h-4 w-4" /> All Modules
                  </Button>
                </Link>
                <SheetTitle className="text-left text-base leading-snug">{moduleData.title}</SheetTitle>
                {moduleData.isLocked && (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Lock className="h-3 w-3" />
                    <span>Free preview — Lesson 1 only</span>
                  </div>
                )}
                {!moduleData.isLocked && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span className="text-primary">{Math.round((completedLessonIds.length / moduleData.lessons.length) * 100)}%</span>
                    <span>Complete</span>
                  </div>
                )}
              </SheetHeader>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
                <div className="p-3 pb-6 space-y-1">
                  {moduleData.lessons.map((lesson, idx) => {
                    const isDone = completedLessonIds.includes(lesson.id);
                    const isActive = activeLessonId === lesson.id;
                    const isAccessible = !moduleData.isLocked || idx === 0;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (isAccessible) {
                            setActiveLessonId(lesson.id);
                            setSelectedOption("");
                            setCheckedItems({});
                            setMobileDrawerOpen(false);
                          }
                        }}
                        disabled={!isAccessible}
                        className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary/15 text-foreground font-semibold ring-1 ring-primary/50'
                            : isAccessible
                              ? 'hover:bg-muted/50 text-muted-foreground'
                              : 'text-muted-foreground/30 cursor-not-allowed'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {!isAccessible ? (
                            <Lock className="h-4 w-4 text-muted-foreground/30" />
                          ) : isDone ? (
                            <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-green-500'}`} />
                          ) : (
                            <Circle className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <span className="line-clamp-2 leading-snug">{lesson.title}</span>
                          <span className="text-[10px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                            {renderLessonIcon(lesson.type)} {lesson.type}
                            {idx === 0 && moduleData.isLocked && (
                              <span className="ml-1 text-primary/70">· Preview</span>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {moduleData.isLocked && (
                <div className="p-4 border-t border-border/40">
                  <Button className="w-full" size="sm" onClick={() => { handleUnlock(); setMobileDrawerOpen(false); }} disabled={createCheckoutSession.isPending}>
                    {createCheckoutSession.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Unlock — $69
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{moduleData.title}</p>
            <p className="text-sm font-medium truncate">{activeLesson?.title ?? "Loading..."}</p>
          </div>
          {activeLessonIndex >= 0 && (
            <span className="text-xs text-muted-foreground shrink-0">{activeLessonIndex + 1} / {moduleData.lessons.length}</span>
          )}
        </div>

        <div className="px-4 md:px-12 py-8">
          {isPaywalled 
            ? renderPaywallGate()
            : activeLesson 
              ? renderLessonContent(activeLesson) 
              : null
          }
        </div>
      </div>
    </div>
  );
}
