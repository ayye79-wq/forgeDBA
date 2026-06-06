import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface PracticeQuestion {
  id: string;
  moduleId: string;
  moduleTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TOTAL_MINUTES = 60;
const MODULE_ORDER = [
  "fundamentals",
  "backups",
  "recovery-models",
  "security",
  "sql-agent",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ScoreCard({
  questions,
  answers,
  onRetry,
  onReview,
  timeTaken,
}: {
  questions: PracticeQuestion[];
  answers: Record<string, number>;
  onRetry: () => void;
  onReview: () => void;
  timeTaken: number;
}) {
  const total = questions.length;
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const pct = Math.round((correct / total) * 100);

  const byModule = MODULE_ORDER.map((moduleId) => {
    const qs = questions.filter((q) => q.moduleId === moduleId);
    const c = qs.filter((q) => answers[q.id] === q.correctIndex).length;
    return { moduleId, title: qs[0]?.moduleTitle ?? moduleId, total: qs.length, correct: c };
  });

  const grade =
    pct >= 90 ? { label: "Outstanding", color: "text-emerald-400" } :
    pct >= 75 ? { label: "Proficient", color: "text-blue-400" } :
    pct >= 60 ? { label: "Developing", color: "text-amber-400" } :
    { label: "Needs Work", color: "text-red-400" };

  const minsUsed = Math.floor(timeTaken / 60);
  const secsUsed = timeTaken % 60;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <Trophy className="h-14 w-14 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-1">Test Complete</h1>
        <p className="text-muted-foreground">
          Time used: {minsUsed}m {secsUsed}s
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 mb-6 text-center">
        <div className={`text-7xl font-black mb-2 ${grade.color}`}>{pct}%</div>
        <div className={`text-xl font-semibold mb-1 ${grade.color}`}>{grade.label}</div>
        <p className="text-muted-foreground text-sm">
          {correct} correct out of {total} questions
        </p>
        <div className="mt-4">
          <Progress value={pct} className="h-3" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Score by Module
        </h2>
        <div className="space-y-3">
          {byModule.map(({ moduleId, title, total: t, correct: c }) => {
            const p = Math.round((c / t) * 100);
            return (
              <div key={moduleId}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-foreground">{title}</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {c}/{t} &nbsp;
                    <span className={p >= 75 ? "text-emerald-400" : p >= 50 ? "text-amber-400" : "text-red-400"}>
                      {p}%
                    </span>
                  </span>
                </div>
                <Progress value={p} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onReview} variant="outline" className="flex-1">
          Review Answers
        </Button>
        <Button onClick={onRetry} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake Test
        </Button>
      </div>
    </div>
  );
}

function ReviewMode({
  questions,
  answers,
  onBack,
}: {
  questions: PracticeQuestion[];
  answers: Record<string, number>;
  onBack: () => void;
}) {
  const grouped = MODULE_ORDER.map((moduleId) => ({
    moduleId,
    questions: questions.filter((q) => q.moduleId === moduleId),
  })).filter((g) => g.questions.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Answer Review</h1>
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back to Score
        </Button>
      </div>

      {grouped.map(({ moduleId, questions: qs }) => (
        <div key={moduleId} className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            {qs[0].moduleTitle}
          </h2>
          <div className="space-y-5">
            {qs.map((q, qi) => {
              const chosen = answers[q.id];
              const isCorrect = chosen === q.correctIndex;
              const wasAnswered = chosen !== undefined;
              return (
                <div
                  key={q.id}
                  className={`rounded-lg border p-5 ${
                    !wasAnswered
                      ? "border-border bg-card"
                      : isCorrect
                      ? "border-emerald-500/30 bg-emerald-950/20"
                      : "border-red-500/30 bg-red-950/20"
                  }`}
                >
                  <div className="flex gap-3 mb-3">
                    {!wasAnswered ? (
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    ) : isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <p className="text-sm font-medium text-foreground">
                      Q{qi + 1}. {q.question}
                    </p>
                  </div>

                  <div className="ml-8 space-y-1.5 mb-3">
                    {q.options.map((opt, i) => {
                      const isChosen = chosen === i;
                      const isAnswer = q.correctIndex === i;
                      return (
                        <div
                          key={i}
                          className={`text-sm px-3 py-1.5 rounded-md ${
                            isAnswer
                              ? "bg-emerald-500/20 text-emerald-300 font-medium"
                              : isChosen && !isAnswer
                              ? "bg-red-500/20 text-red-300 line-through"
                              : "text-muted-foreground"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                        </div>
                      );
                    })}
                  </div>

                  <div className="ml-8 text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2 leading-relaxed">
                    <span className="font-semibold text-foreground/70">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PracticeTest() {
  const { user } = useUser();
  const [phase, setPhase] = useState<"idle" | "active" | "score" | "review">("idle");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_MINUTES * 60);
  const [timeTaken, setTimeTaken] = useState(0);
  const [started, setStarted] = useState(false);

  const { data: questions, isLoading, error } = useQuery<PracticeQuestion[]>({
    queryKey: ["practice-test"],
    queryFn: async () => {
      const res = await fetch("/api/practice-test");
      if (!res.ok) throw new Error("Failed to load questions");
      return res.json();
    },
    enabled: !!user,
  });

  const handleSubmit = useCallback(() => {
    if (!questions) return;
    setTimeTaken(TOTAL_MINUTES * 60 - secondsLeft);
    setPhase("score");
  }, [questions, secondsLeft]);

  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, handleSubmit]);

  function startTest() {
    setAnswers({});
    setSecondsLeft(TOTAL_MINUTES * 60);
    setStarted(true);
    setPhase("active");
  }

  function retry() {
    setAnswers({});
    setSecondsLeft(TOTAL_MINUTES * 60);
    setTimeTaken(0);
    setPhase("active");
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-muted-foreground mb-4">Sign in to access the practice test.</p>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-muted-foreground animate-pulse">Loading questions…</div>
      </div>
    );
  }

  if (error || !questions) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-red-400">Failed to load practice test. Please try again.</p>
      </div>
    );
  }

  if (phase === "score") {
    return (
      <ScoreCard
        questions={questions}
        answers={answers}
        onRetry={retry}
        onReview={() => setPhase("review")}
        timeTaken={timeTaken}
      />
    );
  }

  if (phase === "review") {
    return (
      <ReviewMode
        questions={questions}
        answers={answers}
        onBack={() => setPhase("score")}
      />
    );
  }

  if (phase === "idle") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          DBA Interview Practice Test
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          40 multiple-choice questions covering all 5 training modules. You have{" "}
          <span className="text-foreground font-medium">60 minutes</span> — the same
          pressure as a real interview. Your score and a full answer review are shown at the end.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          {[
            { label: "Questions", value: "40" },
            { label: "Time limit", value: "60 min" },
            { label: "Modules covered", value: "All 5" },
            { label: "Passing score", value: "75%" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-card px-5 py-4">
              <div className="text-2xl font-bold text-primary">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 mb-8 text-left space-y-2">
          <h2 className="text-sm font-semibold text-foreground mb-3">Topics covered</h2>
          {[
            "SQL Server Fundamentals — indexes, logs, ACID, system databases",
            "Backup Strategies — types, chains, COPY_ONLY, verification",
            "Recovery Models — Simple vs Full vs Bulk-Logged, VLFs, log truncation",
            "SQL Server Security — logins vs users, RLS, TDE, least privilege",
            "SQL Server Agent — jobs, proxies, alerts, operators, msdb",
          ].map((topic) => (
            <div key={topic} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {topic}
            </div>
          ))}
        </div>

        <Button
          onClick={startTest}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10"
        >
          Start Test
        </Button>
      </div>
    );
  }

  // Active test
  const grouped = MODULE_ORDER.map((moduleId) => ({
    moduleId,
    questions: questions.filter((q) => q.moduleId === moduleId),
  })).filter((g) => g.questions.length > 0);

  const answeredCount = Object.keys(answers).length;
  const total = questions.length;
  const pctAnswered = Math.round((answeredCount / total) * 100);
  const isLowTime = secondsLeft < 300;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Sticky timer bar */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border mb-8 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {answeredCount}/{total} answered
          <span className="ml-2 text-xs text-muted-foreground/60">({pctAnswered}%)</span>
        </div>
        <div
          className={`flex items-center gap-2 font-mono text-lg font-bold ${
            isLowTime ? "text-red-400 animate-pulse" : "text-foreground"
          }`}
        >
          <Clock className={`h-4 w-4 ${isLowTime ? "text-red-400" : "text-muted-foreground"}`} />
          {formatTime(secondsLeft)}
        </div>
        <Button
          onClick={handleSubmit}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Submit Test
        </Button>
      </div>

      {/* Questions grouped by module */}
      {grouped.map(({ moduleId, questions: qs }) => (
        <div key={moduleId} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="outline" className="text-primary border-primary/30 text-xs uppercase tracking-widest">
              {qs[0].moduleTitle}
            </Badge>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-8">
            {qs.map((q, qi) => {
              const globalIndex = questions.indexOf(q) + 1;
              const chosen = answers[q.id];
              return (
                <div key={q.id} className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-foreground mb-4 leading-relaxed">
                    <span className="text-muted-foreground mr-2">{globalIndex}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      const isChosen = chosen === i;
                      return (
                        <button
                          key={i}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: i }))
                          }
                          className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-colors ${
                            isChosen
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background hover:border-primary/40 hover:bg-primary/5 text-muted-foreground"
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4 pb-16">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10"
        >
          Submit Test
        </Button>
      </div>
    </div>
  );
}
