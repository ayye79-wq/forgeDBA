import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Database,
  FileClock,
  Gauge,
  HardDrive,
  KeyRound,
  RefreshCcw,
  Rocket,
  ServerCog,
  ShieldCheck,
  TerminalSquare,
  XCircle,
} from "lucide-react";

type Choice = {
  label: string;
  rationale: string;
  correct: boolean;
};

type ShiftStage = {
  id: string;
  time: string;
  title: string;
  ticket: string;
  priority: "P1" | "P2" | "P3";
  category: string;
  icon: typeof Database;
  situation: string;
  evidence: Array<{ label: string; value: string }>;
  question: string;
  choices: Choice[];
  points: number;
  successLog: string;
};

const stages: ShiftStage[] = [
  {
    id: "handoff",
    time: "06:00",
    title: "Review the overnight handoff",
    ticket: "INC-2084",
    priority: "P1",
    category: "Backup",
    icon: FileClock,
    situation:
      "The night DBA reports one failed transaction-log backup on FIN-PROD at 05:42. The database is online and no user impact is reported. The next scheduled log backup is 06:00.",
    evidence: [
      { label: "Last full backup", value: "Sunday 23:00 · Success" },
      { label: "Log chain", value: "Intact through 05:27" },
      { label: "Agent message", value: "OS error 112" },
    ],
    question: "What is your first action?",
    points: 12,
    choices: [
      {
        label: "Check the backup destination and available disk space",
        rationale:
          "Correct. OS error 112 means there is not enough space on the destination device. Confirm capacity, clear or extend space through the proper owner, rerun the log backup, and verify success.",
        correct: true,
      },
      {
        label: "Restart the SQL Server service immediately",
        rationale:
          "A failed backup with an online database is not evidence of an instance outage. Restarting SQL Server adds avoidable user impact and does not fix a full backup destination.",
        correct: false,
      },
      {
        label: "Wait for users to report a problem",
        rationale:
          "Backup failures threaten recoverability even when users see no immediate impact. A DBA must act from monitoring evidence, not wait for an outage.",
        correct: false,
      },
    ],
    successLog:
      "Validated OS error 112, restored destination capacity, reran FIN-PROD log backup, and confirmed the log chain remains intact.",
  },
  {
    id: "health",
    time: "06:25",
    title: "Complete morning health checks",
    ticket: "OPS-0612",
    priority: "P2",
    category: "Monitoring",
    icon: ServerCog,
    situation:
      "The dashboard is mostly green. SALES-PROD shows a brief Always On synchronization warning overnight, but it currently reports SYNCHRONIZED. No alerts are active.",
    evidence: [
      { label: "Replica state", value: "SYNCHRONIZED" },
      { label: "Database state", value: "ONLINE" },
      { label: "Last failover", value: "None recorded" },
    ],
    question: "How should you close the health check?",
    points: 13,
    choices: [
      {
        label:
          "Record current health, review the warning window, and keep monitoring",
        rationale:
          "Correct. Verify present state, review the warning duration and cause, document it, and monitor for recurrence. A recovered transient warning does not justify disruptive action.",
        correct: true,
      },
      {
        label: "Force an Always On failover to prove the secondary works",
        rationale:
          "An unapproved production failover is disruptive. Failover testing belongs in a planned change with application owners and a rollback plan.",
        correct: false,
      },
      {
        label: "Ignore the warning because the dashboard is green now",
        rationale:
          "Current health matters, but so does history. Repeated synchronization warnings can expose network, storage, or replica problems.",
        correct: false,
      },
    ],
    successLog:
      "Verified SALES-PROD is online and synchronized; reviewed the transient warning and documented monitoring follow-up.",
  },
  {
    id: "agent-jobs",
    time: "07:15",
    title: "Investigate a failed Agent job",
    ticket: "INC-2087",
    priority: "P2",
    category: "SQL Agent",
    icon: TerminalSquare,
    situation:
      "The nightly CustomerImport job failed. Job history says the expected vendor file was not found. The upstream file-transfer dashboard shows a delayed delivery.",
    evidence: [
      { label: "Failed step", value: "Load vendor file" },
      { label: "SQL error", value: "File not found" },
      { label: "Upstream ETA", value: "07:40" },
    ],
    question: "What is the best response?",
    points: 12,
    choices: [
      {
        label:
          "Confirm the dependency, notify the owner, and rerun after the file arrives",
        rationale:
          "Correct. The failure is caused by a missing upstream dependency. Coordinate with its owner, preserve evidence, rerun only after delivery, and validate imported row counts.",
        correct: true,
      },
      {
        label: "Keep rerunning the job every five minutes",
        rationale:
          "Repeated retries cannot create the missing file and may generate noise or duplicate work. Resolve the dependency first.",
        correct: false,
      },
      {
        label: "Edit the production job to skip the missing-file step",
        rationale:
          "Bypassing a required step without an approved change can create incomplete or misleading data.",
        correct: false,
      },
    ],
    successLog:
      "Confirmed delayed vendor delivery, coordinated with the file-transfer owner, reran CustomerImport, and validated row counts.",
  },
  {
    id: "performance",
    time: "08:35",
    title: "Triage a slow application query",
    ticket: "INC-2091",
    priority: "P2",
    category: "Performance",
    icon: Gauge,
    situation:
      "Support reports that order lookup is slow. CPU is normal, but one reporting session has held locks for nine minutes and application sessions are waiting behind it.",
    evidence: [
      { label: "Top wait", value: "LCK_M_S" },
      { label: "Lead blocker", value: "Session 184" },
      { label: "Running command", value: "Month-end report" },
    ],
    question: "What should you do before terminating anything?",
    points: 13,
    choices: [
      {
        label:
          "Capture the blocking chain, contact the report owner, and assess rollback impact",
        rationale:
          "Correct. Preserve evidence, identify business ownership, estimate rollback cost, and coordinate the least disruptive resolution. Kill a session only with sufficient justification and authority.",
        correct: true,
      },
      {
        label: "Kill every session with a wait status",
        rationale:
          "Waiting sessions are usually victims, not causes. Killing them can increase user impact while leaving the blocker untouched.",
        correct: false,
      },
      {
        label: "Rebuild every index on the database",
        rationale:
          "The evidence points to blocking. A broad index rebuild is unrelated, resource-intensive, and requires an approved maintenance window.",
        correct: false,
      },
    ],
    successLog:
      "Captured the blocking chain, coordinated with the report owner, ended the blocker safely, and confirmed order latency recovered.",
  },
  {
    id: "access",
    time: "10:10",
    title: "Process a production access request",
    ticket: "REQ-5519",
    priority: "P2",
    category: "Security",
    icon: KeyRound,
    situation:
      "A developer requests db_owner on SALES-PROD to investigate a stored procedure. The ticket has manager approval but does not explain why broad ownership is necessary.",
    evidence: [
      { label: "Requested role", value: "db_owner" },
      { label: "Stated task", value: "Execute and inspect procedure" },
      { label: "Expiration", value: "Not provided" },
    ],
    question: "How should you handle the request?",
    points: 12,
    choices: [
      {
        label:
          "Clarify the task and grant the least privilege with an expiration",
        rationale:
          "Correct. Manager approval does not replace least privilege. Grant only the permissions needed, make elevated access time-bound, and document who approved and what was changed.",
        correct: true,
      },
      {
        label: "Grant db_owner because the manager approved it",
        rationale:
          "db_owner is excessive for executing and inspecting a procedure. Approval must still meet access-control policy and least-privilege standards.",
        correct: false,
      },
      {
        label: "Share the DBA service account temporarily",
        rationale:
          "Shared privileged credentials destroy accountability and should never be used as a shortcut.",
        correct: false,
      },
    ],
    successLog:
      "Clarified the developer task, granted time-bound least privilege, recorded approval, and scheduled access removal.",
  },
  {
    id: "deployment",
    time: "11:30",
    title: "Support an approved schema deployment",
    ticket: "CHG-7731",
    priority: "P2",
    category: "Change",
    icon: Rocket,
    situation:
      "An approved release adds an index and alters a stored procedure. The maintenance window is open, application and QA owners are present, and the change includes a tested rollback script.",
    evidence: [
      { label: "Approval", value: "CAB approved" },
      { label: "Rollback", value: "Tested in UAT" },
      { label: "Backup status", value: "Current" },
    ],
    question: "Which execution sequence is strongest?",
    points: 13,
    choices: [
      {
        label:
          "Run prechecks, execute the script, validate, monitor, and document",
        rationale:
          "Correct. Confirm prerequisites and recovery readiness, execute the approved change, validate database and application behavior, monitor, and record evidence and outcome.",
        correct: true,
      },
      {
        label: "Run the script and close the ticket when it returns success",
        rationale:
          "A successful script execution does not prove the application works or that performance is acceptable. Post-change validation is mandatory.",
        correct: false,
      },
      {
        label: "Rewrite the procedure directly in production to improve it",
        rationale:
          "Unreviewed changes exceed the approved scope and invalidate the tested rollback plan.",
        correct: false,
      },
    ],
    successLog:
      "Completed prechecks, executed CHG-7731, validated schema and application behavior, monitored health, and documented the outcome.",
  },
  {
    id: "capacity",
    time: "13:15",
    title: "Review the capacity forecast",
    ticket: "PRB-1044",
    priority: "P3",
    category: "Capacity",
    icon: HardDrive,
    situation:
      "The DATA volume on CRM-PROD is 83% full. It grew six percentage points this month, and the current trend predicts less than three weeks before reaching the 90% alert threshold.",
    evidence: [
      { label: "Current usage", value: "83%" },
      { label: "Monthly growth", value: "+6 percentage points" },
      { label: "Forecast", value: "90% in under 3 weeks" },
    ],
    question: "What is the appropriate normal-day action?",
    points: 12,
    choices: [
      {
        label:
          "Document the forecast and open a capacity request before it becomes urgent",
        rationale:
          "Correct. Capacity management is proactive. Verify what is growing, confirm retention and autogrowth settings, and engage the storage or VM team with evidence before space is critical.",
        correct: true,
      },
      {
        label: "Shrink the production database immediately",
        rationale:
          "Routine shrinking causes fragmentation and usually does not solve the growth driver. It is not a capacity plan.",
        correct: false,
      },
      {
        label: "Wait until the volume reaches 95%",
        rationale:
          "Waiting removes planning time and turns a predictable issue into an emergency change.",
        correct: false,
      },
    ],
    successLog:
      "Validated CRM-PROD growth, documented the forecast, and opened a capacity request with the infrastructure owner.",
  },
  {
    id: "handoff-close",
    time: "14:00",
    title: "Prepare the end-of-shift handoff",
    ticket: "OPS-1400",
    priority: "P3",
    category: "Handoff",
    icon: ClipboardCheck,
    situation:
      "The backup, import, performance incident, access request, and deployment are resolved. The capacity request remains open with the infrastructure team, and temporary developer access expires at 17:00.",
    evidence: [
      { label: "Resolved", value: "5 work items" },
      { label: "Open follow-up", value: "Capacity request" },
      { label: "Timed action", value: "Remove access at 17:00" },
    ],
    question: "What makes the handoff useful to the next DBA?",
    points: 13,
    choices: [
      {
        label:
          "Record status, evidence, remaining risk, next action, deadline, and owner",
        rationale:
          "Correct. A handoff must let the next DBA continue without reconstructing the shift. Include what happened, what was validated, what remains, when it is due, and who owns it.",
        correct: true,
      },
      {
        label: "Write that everything looks good and leave",
        rationale:
          "This hides the open capacity request and timed access removal. Vague handoffs create operational risk.",
        correct: false,
      },
      {
        label: "Copy only the ticket numbers into chat",
        rationale:
          "Ticket numbers help, but the next DBA still needs concise status, risk, owner, and next action.",
        correct: false,
      },
    ],
    successLog:
      "Delivered a complete handoff with outcomes, validation evidence, open risk, owners, deadlines, and the 17:00 access-removal action.",
  },
];

type AnswerState = {
  choiceIndex: number;
  correct: boolean;
};

const priorityClasses = {
  P1: "border-red-500/30 bg-red-500/10 text-red-300",
  P2: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  P3: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

export default function WorkdaySimulator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [complete, setComplete] = useState(false);

  const activeStage = stages[activeIndex];
  const activeAnswer = answers[activeStage.id];
  const score = useMemo(
    () =>
      stages.reduce(
        (total, stage) =>
          total + (answers[stage.id]?.correct ? stage.points : 0),
        0,
      ),
    [answers],
  );
  const answeredCount = Object.keys(answers).length;
  const progress = complete
    ? 100
    : Math.round((answeredCount / stages.length) * 100);

  const selectChoice = (choiceIndex: number) => {
    if (activeAnswer) return;
    const choice = activeStage.choices[choiceIndex];
    setAnswers((current) => ({
      ...current,
      [activeStage.id]: { choiceIndex, correct: choice.correct },
    }));
  };

  const continueShift = () => {
    if (!activeAnswer) return;
    if (activeIndex === stages.length - 1) {
      setComplete(true);
      return;
    }
    setActiveIndex((current) => current + 1);
  };

  const resetShift = () => {
    setAnswers({});
    setActiveIndex(0);
    setComplete(false);
  };

  if (complete) {
    const correctCount = stages.filter(
      (stage) => answers[stage.id]?.correct,
    ).length;
    const rating =
      score >= 90
        ? "Production ready"
        : score >= 75
          ? "Strong shift"
          : score >= 60
            ? "Developing DBA"
            : "Needs another run";

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-primary" />
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Shift complete
            </p>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              {rating}
            </h1>
            <p className="mt-3 text-muted-foreground">
              You made {correctCount} correct decisions across a complete
              production day shift.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/50 p-5 text-center">
              <div className="text-4xl font-black text-primary">{score}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                Operational score
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-5 text-center">
              <div className="text-4xl font-black">
                {correctCount}/{stages.length}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                Correct decisions
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-5 text-center">
              <div className="text-4xl font-black text-emerald-400">14:00</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                Handoff complete
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <ClipboardCheck className="h-4 w-4" /> Evidence log
            </h2>
            <div className="space-y-3">
              {stages.map((stage) => {
                const answer = answers[stage.id];
                return (
                  <div
                    key={stage.id}
                    className="flex gap-3 rounded-lg border border-border bg-background/40 p-4"
                  >
                    {answer?.correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {stage.time}
                        </span>
                        <span className="text-sm font-semibold">
                          {stage.ticket}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {answer?.correct
                          ? stage.successLog
                          : stage.choices[answer?.choiceIndex ?? 0].rationale}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={resetShift}
              className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Run the shift again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const Icon = activeStage.icon;

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            >
              Guided scenarios
            </Badge>
            <Badge variant="outline">Normal Monday · Day shift</Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            SQL Server decision practice
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Practice the major decisions from a 06:00–14:00 DBA shift with
            immediate coaching, then enter Live Shift when you are ready to
            operate without multiple-choice answers.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/modules/daily-operations">
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" /> Study Daily DBA Operations
              </Button>
            </Link>
            <Link href="/workday-simulator/live">
              <Button className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
                <TerminalSquare className="mr-2 h-4 w-4" /> Launch live shift
              </Button>
            </Link>
          </div>
        </div>
        <div className="min-w-64 rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shift progress</span>
            <span className="font-mono font-bold">
              {answeredCount}/{stages.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Operational score</span>
            <span className="font-mono text-lg font-black text-primary">
              {score}/100
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside className="rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Clock3 className="h-4 w-4" /> Shift timeline
          </h2>
          <div className="space-y-1">
            {stages.map((stage, index) => {
              const answered = answers[stage.id];
              const current = index === activeIndex;
              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                    current ? "bg-primary/10 ring-1 ring-primary/30" : ""
                  }`}
                >
                  <div className="w-11 font-mono text-xs text-muted-foreground">
                    {stage.time}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate text-sm ${current ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      {stage.category}
                    </div>
                  </div>
                  {answered?.correct && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  {answered && !answered.correct && (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border p-5 md:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={priorityClasses[activeStage.priority]}
              >
                {activeStage.priority}
              </Badge>
              <Badge variant="outline">{activeStage.ticket}</Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {activeStage.time}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {activeStage.category}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{activeStage.title}</h2>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-5 md:p-7">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Situation</h3>
              <p className="leading-relaxed text-muted-foreground">
                {activeStage.situation}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {activeStage.evidence.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border bg-background/50 p-3"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm font-medium">{item.value}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-base font-semibold">
                {activeStage.question}
              </h3>
              <div className="space-y-3">
                {activeStage.choices.map((choice, index) => {
                  const selected = activeAnswer?.choiceIndex === index;
                  const revealCorrect = !!activeAnswer && choice.correct;
                  const incorrectSelected = selected && !choice.correct;
                  return (
                    <button
                      key={choice.label}
                      type="button"
                      disabled={!!activeAnswer}
                      onClick={() => selectChoice(index)}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${
                        revealCorrect
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : incorrectSelected
                            ? "border-red-500/50 bg-red-500/10"
                            : "border-border bg-background/30 hover:border-primary/50 hover:bg-primary/5 disabled:hover:border-border disabled:hover:bg-background/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="pt-0.5 text-sm font-medium leading-relaxed">
                          {choice.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeAnswer && (
              <div
                className={`rounded-lg border p-4 ${activeAnswer.correct ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}
              >
                <div className="flex gap-3">
                  {activeAnswer.correct ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  )}
                  <div>
                    <div className="text-sm font-semibold">
                      {activeAnswer.correct
                        ? `Correct · +${activeStage.points} points`
                        : "Not the safest production action"}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {activeStage.choices[activeAnswer.choiceIndex].rationale}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-border pt-5">
              <Button
                disabled={!activeAnswer}
                onClick={continueShift}
                className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {activeIndex === stages.length - 1
                  ? "Complete shift"
                  : "Continue shift"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Active queue
            </h2>
            <div className="space-y-3">
              {stages.slice(0, 7).map((stage, index) => {
                const answer = answers[stage.id];
                const isCurrent = index === activeIndex;
                return (
                  <div key={stage.ticket} className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${answer ? "bg-emerald-400" : isCurrent ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold">
                          {stage.ticket}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {stage.priority}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {answer
                          ? "Reviewed"
                          : isCurrent
                            ? "In progress"
                            : "Awaiting review"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="text-xs font-semibold uppercase tracking-widest">
                Operating rule
              </h2>
            </div>
            <p className="font-mono text-sm font-semibold leading-relaxed">
              Diagnose → stabilize → validate → document
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Escalate with evidence, business impact, and a clear owner.
            </p>
          </div>

          <Button variant="outline" onClick={resetShift} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset shift
          </Button>
        </aside>
      </div>
    </div>
  );
}
