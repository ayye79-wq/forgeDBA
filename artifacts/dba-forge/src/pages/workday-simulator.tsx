import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  RotateCcw,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

type Choice = {
  label: string;
  feedback: string;
  points: number;
};

type Scenario = {
  time: string;
  title: string;
  ticket: string;
  priority: "P1" | "P2" | "P3";
  situation: string;
  evidence: string[];
  choices: Choice[];
};

const scenarios: Scenario[] = [
  {
    time: "06:00",
    title: "Review the overnight handoff",
    ticket: "INC-2084",
    priority: "P1",
    situation:
      "The night DBA reports one failed transaction-log backup on FIN-PROD at 05:42. The database is online and no user impact has been reported.",
    evidence: ["Last full backup: Sunday 23:00 — Success", "Log chain intact through 05:27", "SQL Agent message: OS error 112"],
    choices: [
      { label: "Check the backup destination and free space", feedback: "Correct. OS error 112 commonly indicates insufficient disk space. Validate the destination before changing services.", points: 15 },
      { label: "Restart SQL Server immediately", feedback: "A restart introduces risk and does not address the storage evidence.", points: 0 },
      { label: "Wait for users to report a problem", feedback: "Backups protect recoverability. A failure requires investigation even when the database remains online.", points: 2 },
    ],
  },
  {
    time: "07:15",
    title: "Investigate an ETL job failure",
    ticket: "INC-2087",
    priority: "P2",
    situation: "The overnight customer-load job failed during step 4. Earlier steps completed, and the source file is present.",
    evidence: ["Failure began after a schema deployment", "Error: string or binary data would be truncated", "Target table remains available"],
    choices: [
      { label: "Identify the affected column and compare source length to schema", feedback: "Correct. Preserve evidence and isolate the mismatch before deciding whether data or schema must change.", points: 15 },
      { label: "Delete the failed job history and rerun", feedback: "Deleting evidence makes diagnosis harder and a blind rerun will probably fail again.", points: 0 },
      { label: "Increase every varchar column to MAX", feedback: "This is an uncontrolled schema change with storage and performance consequences.", points: 3 },
    ],
  },
  {
    time: "08:35",
    title: "Respond to a slow order lookup",
    ticket: "INC-2091",
    priority: "P2",
    situation: "Support reports that order searches now take 18 seconds instead of less than one second.",
    evidence: ["CPU: 42%", "Blocking session detected", "A reporting query has held a transaction open for 19 minutes"],
    choices: [
      { label: "Capture the blocking chain and contact the query owner", feedback: "Correct. Capture evidence, assess business impact, then coordinate the safest way to clear the blocker.", points: 15 },
      { label: "Kill the oldest session without checking ownership", feedback: "That may cause rollback, data loss at the application level, or a larger outage.", points: 4 },
      { label: "Add more CPU to the VM", feedback: "CPU is not the primary evidence; the blocking chain is.", points: 1 },
    ],
  },
  {
    time: "10:10",
    title: "Evaluate a production access request",
    ticket: "REQ-5519",
    priority: "P2",
    situation: "A developer asks for db_owner on FIN-PROD to troubleshoot an application error before lunch.",
    evidence: ["Manager approval is missing", "Read-only diagnostic access may be sufficient", "CyberArk session recording is available"],
    choices: [
      { label: "Clarify the task and grant approved, time-limited least privilege", feedback: "Correct. Match access to the task, require approval, and use the controlled CyberArk path.", points: 15 },
      { label: "Grant db_owner because the request is urgent", feedback: "Urgency does not remove least-privilege and approval requirements.", points: 0 },
      { label: "Share the DBA account password", feedback: "Privileged credentials must never be shared this way.", points: 0 },
    ],
  },
  {
    time: "11:30",
    title: "Control a schema deployment",
    ticket: "CHG-7731",
    priority: "P2",
    situation: "A release contains two index changes and one new nullable column. The approved window has started.",
    evidence: ["Backout script attached", "Pre-deployment backup verified", "Application owner is online"],
    choices: [
      { label: "Validate approvals, run the plan, test, and record evidence", feedback: "Correct. Execute the approved change, validate the result, and preserve a complete change record.", points: 15 },
      { label: "Run the script and leave when it reports success", feedback: "A successful command is not proof that the application and database are healthy.", points: 5 },
      { label: "Skip the backup because the column is nullable", feedback: "Follow the approved recovery plan; do not remove safeguards informally.", points: 1 },
    ],
  },
  {
    time: "13:15",
    title: "Prepare a capacity recommendation",
    ticket: "PRB-1044",
    priority: "P3",
    situation: "The data volume has reached 78% capacity and has grown by roughly 4% per month.",
    evidence: ["Current free space: 220 GB", "Monthly growth: approximately 70 GB", "Quarter-end load is expected to increase growth"],
    choices: [
      { label: "Forecast exhaustion and open a capacity request with lead time", feedback: "Correct. Capacity management is proactive: forecast, document assumptions, and assign an owner before the risk becomes an incident.", points: 15 },
      { label: "Wait until the disk reaches 95%", feedback: "Procurement and storage changes require lead time; waiting creates avoidable outage risk.", points: 0 },
      { label: "Delete old database files manually", feedback: "Database files must not be deleted as an ad hoc space-recovery method.", points: 0 },
    ],
  },
];

const priorityStyle = {
  P1: "border-red-500/40 bg-red-500/10 text-red-300",
  P2: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  P3: "border-blue-500/40 bg-blue-500/10 text-blue-300",
};

export default function WorkdaySimulator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const scenario = scenarios[step];
  const selected = answers[step];
  const finished = answers.length === scenarios.length;
  const score = useMemo(
    () => answers.reduce((total, answer, index) => total + (scenarios[index]?.choices[answer]?.points ?? 0), 0),
    [answers],
  );
  const maxScore = scenarios.length * 15;
  const percentage = Math.round((score / maxScore) * 100);

  const choose = (choiceIndex: number) => {
    if (selected !== undefined) return;
    setAnswers((current) => [...current, choiceIndex]);
  };

  const reset = () => {
    setAnswers([]);
    setStep(0);
  };

  if (finished) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
          <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-primary" />
          <Badge variant="outline" className="mb-4">Shift complete</Badge>
          <h1 className="text-3xl font-black tracking-tight">Operational score: {score}/{maxScore}</h1>
          <p className="mt-2 text-muted-foreground">
            {percentage >= 85 ? "Strong production judgment. You diagnosed before acting and preserved evidence." : percentage >= 65 ? "Good foundation. Review the lower-scoring decisions before your next shift." : "Repeat the shift and focus on evidence, least privilege, validation, and documentation."}
          </p>
          <Progress value={percentage} className="mx-auto mt-6 h-3 max-w-xl" />
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {scenarios.map((item, index) => {
              const earned = item.choices[answers[index]].points;
              return (
                <div key={item.ticket} className="rounded-lg border border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{item.ticket}</span>
                    <span className={earned === 15 ? "text-emerald-400" : "text-amber-400"}>{earned}/15</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{item.title}</p>
                </div>
              );
            })}
          </div>
          <Button onClick={reset} className="mt-8">
            <RotateCcw className="mr-2 h-4 w-4" /> Restart shift
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.22em]">Production SQL Server Operations</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">ForgeDBA Workday Simulator</h1>
          <p className="mt-1 text-muted-foreground">Normal Monday · Day shift · Diagnose → stabilize → validate → document</p>
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Systems online · Trainee mode
        </div>
      </div>

      <div className="mb-7 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Clock3 className="h-4 w-4" /> Shift progress</div>
          <p className="mt-2 text-xl font-bold">{step + 1} of {scenarios.length}</p>
          <Progress value={(answers.length / scenarios.length) * 100} className="mt-3 h-2" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><ServerCog className="h-4 w-4" /> Active ticket</div>
          <p className="mt-2 text-xl font-bold">{scenario.ticket}</p>
          <p className="text-xs text-muted-foreground">{scenario.time} · Awaiting review</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><CheckCircle2 className="h-4 w-4" /> Current score</div>
          <p className="mt-2 text-xl font-bold">{score} points</p>
          <p className="text-xs text-muted-foreground">Evidence-based decisions earn the most</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={priorityStyle[scenario.priority]}>{scenario.priority}</Badge>
            <span className="font-mono text-sm text-muted-foreground">{scenario.time}</span>
          </div>
          <h2 className="text-2xl font-bold">{scenario.title}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{scenario.situation}</p>

          <div className="mt-7 space-y-3">
            {scenario.choices.map((choice, index) => {
              const isSelected = selected === index;
              const revealed = selected !== undefined;
              return (
                <button
                  type="button"
                  key={choice.label}
                  disabled={revealed}
                  onClick={() => choose(index)}
                  className={`w-full rounded-xl border p-4 text-left transition ${isSelected ? (choice.points === 15 ? "border-emerald-500 bg-emerald-500/10" : "border-amber-500 bg-amber-500/10") : "border-border bg-background/40 hover:border-primary/60 hover:bg-primary/5 disabled:hover:border-border disabled:hover:bg-background/40"}`}
                >
                  <span className="font-medium">{choice.label}</span>
                  {isSelected && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{choice.feedback}</p>}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button disabled={selected === undefined} onClick={() => setStep((current) => current + 1)}>
              {step === scenarios.length - 1 ? "Complete shift" : "Continue shift"}
            </Button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-amber-400" /> Evidence</h3>
            <ul className="mt-4 space-y-3">
              {scenario.evidence.map((item) => <li key={item} className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold">Shift timeline</h3>
            <div className="mt-4 space-y-3">
              {scenarios.map((item, index) => (
                <div key={item.ticket} className={`flex items-center gap-3 text-sm ${index === step ? "text-primary" : index < step ? "text-emerald-400" : "text-muted-foreground"}`}>
                  <span className="w-12 font-mono text-xs">{item.time}</span>
                  <span className="truncate">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
