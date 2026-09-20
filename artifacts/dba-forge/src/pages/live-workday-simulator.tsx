import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  FastForward,
  FileText,
  Gauge,
  Inbox,
  MessageSquare,
  Pause,
  Play,
  RefreshCcw,
  Send,
  ServerCog,
  ShieldCheck,
  TerminalSquare,
  TicketCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type View = "operations" | "console" | "tickets" | "handoff";
type TicketStatus = "new" | "investigating" | "waiting" | "resolved";

type SimTicket = {
  id: string;
  release: number;
  due: number;
  priority: "P1" | "P2" | "P3";
  title: string;
  source: string;
  description: string;
};

type LogEntry = {
  id: string;
  minute: number;
  kind: "alert" | "command" | "message" | "success" | "warning";
  text: string;
};

type TerminalEntry = {
  id: string;
  command: string;
  output: string;
  tone?: "normal" | "success" | "error";
};

const SHIFT_START = 6 * 60;
const SHIFT_END = 14 * 60;

const tickets: SimTicket[] = [
  {
    id: "INC-2084",
    release: 360,
    due: 405,
    priority: "P1",
    title: "FIN-PROD transaction-log backup failed",
    source: "SQL Monitor",
    description:
      "The 05:42 transaction-log backup failed with operating-system error 112. FIN-PROD is online, but recoverability is at risk until a successful log backup completes.",
  },
  {
    id: "OPS-0612",
    release: 385,
    due: 455,
    priority: "P2",
    title: "Morning production health check",
    source: "Shift runbook",
    description:
      "Review database state, Always On synchronization, failed jobs, backup freshness, and infrastructure capacity. SALES-PROD recorded a transient replica warning overnight.",
  },
  {
    id: "INC-2087",
    release: 435,
    due: 495,
    priority: "P2",
    title: "CustomerImport Agent job failed",
    source: "Service Desk",
    description:
      "The nightly import stopped at the vendor-file step. The downstream reporting team expects refreshed customer data this morning.",
  },
  {
    id: "INC-2091",
    release: 515,
    due: 560,
    priority: "P1",
    title: "Order lookup latency",
    source: "Application Support",
    description:
      "Users report slow order searches. CPU remains normal, but application requests are accumulating on SALES-PROD.",
  },
  {
    id: "REQ-5519",
    release: 610,
    due: 675,
    priority: "P2",
    title: "Developer requests db_owner",
    source: "Access Management",
    description:
      "A developer needs to execute and inspect one stored procedure in production. The manager approved access, but the request asks for db_owner and has no expiration.",
  },
  {
    id: "CHG-7731",
    release: 690,
    due: 750,
    priority: "P2",
    title: "Approved schema deployment",
    source: "Change Management",
    description:
      "The change window is open. The approved package adds an index and alters a stored procedure. Application and QA owners are present, and rollback was tested in UAT.",
  },
  {
    id: "PRB-1044",
    release: 795,
    due: 835,
    priority: "P3",
    title: "CRM-PROD capacity forecast",
    source: "Capacity dashboard",
    description:
      "The DATA volume is 83% full after six percentage points of monthly growth. Current growth reaches the 90% alert threshold in under three weeks.",
  },
];

const priorityStyle = {
  P1: "border-red-500/40 bg-red-500/10 text-red-300",
  P2: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  P3: "border-blue-500/40 bg-blue-500/10 text-blue-300",
};

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function makeStatuses(): Record<string, TicketStatus> {
  return Object.fromEntries(tickets.map((ticket) => [ticket.id, "new"]));
}

export default function LiveWorkdaySimulator() {
  const [minute, setMinute] = useState(SHIFT_START);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [view, setView] = useState<View>("operations");
  const [selectedTicket, setSelectedTicket] = useState("INC-2084");
  const [statuses, setStatuses] =
    useState<Record<string, TicketStatus>>(makeStatuses);
  const [announced, setAnnounced] = useState<string[]>([]);
  const [penalties, setPenalties] = useState<Record<string, number>>({});
  const [activityLog, setActivityLog] = useState<LogEntry[]>([
    {
      id: "shift-start",
      minute: SHIFT_START,
      kind: "message",
      text: "Day shift started. Overnight handoff and monitoring queue are ready for review.",
    },
  ]);
  const [terminal, setTerminal] = useState<TerminalEntry[]>([
    {
      id: "welcome",
      command: "-- ForgeDBA production console",
      output:
        "Connected with read-first training permissions. Type HELP to inspect the available environment. Your commands change the simulated system state.",
    },
  ]);
  const [command, setCommand] = useState("");
  const [handoff, setHandoff] = useState("");
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const [state, setState] = useState({
    diskChecked: false,
    backupHistoryChecked: false,
    storageContacted: false,
    backupSpaceRestored: false,
    backupCompleted: false,
    healthChecked: false,
    jobHistoryChecked: false,
    vendorContacted: false,
    fileAvailable: false,
    importCompleted: false,
    blockingCaptured: false,
    reportOwnerContacted: false,
    blockerCleared: false,
    accessClarified: false,
    leastPrivilegeGranted: false,
    changePrechecked: false,
    changeDeployed: false,
    changeValidated: false,
    capacityReviewed: false,
    capacityRequested: false,
  });
  const terminalBottom = useRef<HTMLDivElement | null>(null);

  const score = Math.max(
    0,
    100 - Object.values(penalties).reduce((total, value) => total + value, 0),
  );
  const releasedTickets = tickets.filter((ticket) => ticket.release <= minute);
  const selected =
    tickets.find((ticket) => ticket.id === selectedTicket) ?? tickets[0];
  const resolvedCount = tickets.filter(
    (ticket) => statuses[ticket.id] === "resolved",
  ).length;
  const progress = Math.round(
    ((minute - SHIFT_START) / (SHIFT_END - SHIFT_START)) * 100,
  );
  const shiftFinished = minute >= SHIFT_END;

  const metrics = useMemo(
    () => [
      {
        label: "Recoverability",
        value: state.backupCompleted ? "Protected" : "At risk",
        healthy: state.backupCompleted,
      },
      {
        label: "Availability",
        value: state.blockerCleared || minute < 515 ? "Stable" : "Degraded",
        healthy: state.blockerCleared || minute < 515,
      },
      {
        label: "Security",
        value: state.leastPrivilegeGranted ? "Controlled" : "No change",
        healthy: !penalties["unsafe-access"],
      },
      {
        label: "Open tickets",
        value: String(
          releasedTickets.filter((ticket) => statuses[ticket.id] !== "resolved")
            .length,
        ),
        healthy: releasedTickets.every(
          (ticket) => statuses[ticket.id] === "resolved",
        ),
      },
    ],
    [minute, penalties, releasedTickets, state, statuses],
  );

  const addLog = (
    text: string,
    kind: LogEntry["kind"] = "message",
    at = minute,
  ) => {
    setActivityLog((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, minute: at, kind, text },
    ]);
  };

  const deduct = (key: string, points: number, reason: string) => {
    if (penalties[key]) return;
    setPenalties((current) => ({ ...current, [key]: points }));
    addLog(`${reason} (-${points})`, "warning");
  };

  const setTicketStatus = (id: string, status: TicketStatus) => {
    setStatuses((current) => ({ ...current, [id]: status }));
  };

  const resolveTicket = (id: string, message: string) => {
    if (statuses[id] === "resolved") return;
    setTicketStatus(id, "resolved");
    addLog(`${id} resolved — ${message}`, "success");
  };

  useEffect(() => {
    if (!running || shiftFinished) return;
    const interval = window.setInterval(() => {
      setMinute((current) => Math.min(SHIFT_END, current + 5 * speed));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running, shiftFinished, speed]);

  useEffect(() => {
    const newlyReleased = tickets.filter(
      (ticket) => ticket.release <= minute && !announced.includes(ticket.id),
    );
    if (!newlyReleased.length) return;
    setAnnounced((current) => [
      ...current,
      ...newlyReleased.map((ticket) => ticket.id),
    ]);
    setActivityLog((current) => [
      ...current,
      ...newlyReleased.map((ticket) => ({
        id: `release-${ticket.id}`,
        minute: ticket.release,
        kind: "alert" as const,
        text: `${ticket.priority} ${ticket.id}: ${ticket.title}`,
      })),
    ]);
    const critical = newlyReleased.find((ticket) => ticket.priority === "P1");
    if (critical) {
      setRunning(false);
      setSelectedTicket(critical.id);
      setView("operations");
    }
  }, [announced, minute]);

  useEffect(() => {
    if (minute >= 460 && !state.fileAvailable) {
      setState((current) => ({ ...current, fileAvailable: true }));
      addLog(
        "Vendor file landed in the CustomerImport drop location.",
        "message",
        460,
      );
    }
  }, [minute, state.fileAvailable]);

  useEffect(() => {
    tickets.forEach((ticket) => {
      if (minute > ticket.due && statuses[ticket.id] !== "resolved") {
        deduct(
          `sla-${ticket.id}`,
          ticket.priority === "P1" ? 8 : ticket.priority === "P2" ? 5 : 3,
          `${ticket.id} exceeded its response target`,
        );
      }
    });
  }, [minute, statuses]);

  useEffect(() => {
    if (shiftFinished) setRunning(false);
  }, [shiftFinished]);

  useEffect(() => {
    terminalBottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminal]);

  const terminalResult = (
    entered: string,
    output: string,
    tone: TerminalEntry["tone"] = "normal",
  ) => {
    setTerminal((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, command: entered, output, tone },
    ]);
    addLog(`Console: ${entered}`, "command");
  };

  const executeCommand = (event: FormEvent) => {
    event.preventDefault();
    const entered = command.trim();
    if (!entered) return;
    setCommand("");
    const normalized = entered.toLowerCase().replace(/\s+/g, " ");

    if (normalized === "help") {
      terminalResult(
        entered,
        [
          "Discovery: DASHBOARD | XP_FIXEDDRIVES | BACKUP HISTORY | HADR STATUS",
          "Jobs: JOB HISTORY CustomerImport | START JOB CustomerImport",
          "Performance: SP_WHO2 | BLOCKING CHAIN | KILL 184",
          "Access: CLARIFY REQ-5519 | GRANT EXECUTE REQ-5519 | GRANT DB_OWNER REQ-5519",
          "Change: PRECHECK CHG-7731 | DEPLOY CHG-7731 | VALIDATE CHG-7731",
          "Capacity: CAPACITY FORECAST | OPEN CAPACITY REQUEST",
          "Backup: BACKUP LOG FIN-PROD",
          "Use the Operations panel for communication with other teams.",
        ].join("\n"),
      );
      return;
    }

    if (normalized.includes("dashboard")) {
      terminalResult(
        entered,
        `FIN-PROD  ONLINE  Log backup failed\nSALES-PROD  ONLINE  AG synchronized\nCRM-PROD  ONLINE  DATA volume 83%\nSQL Agent  1 failed job`,
      );
      return;
    }

    if (
      normalized.includes("xp_fixeddrives") ||
      normalized.includes("fixed drives")
    ) {
      setState((current) => ({ ...current, diskChecked: true }));
      setTicketStatus("INC-2084", "investigating");
      terminalResult(
        entered,
        "drive  MB free\nC      43820\nD      184215\nB      812\n\nB: is the shared backup target and is critically low.",
      );
      return;
    }

    if (normalized.includes("backup history")) {
      setState((current) => ({ ...current, backupHistoryChecked: true }));
      setTicketStatus("INC-2084", "investigating");
      terminalResult(
        entered,
        "FIN-PROD LOG backups succeeded every 15 minutes through 05:27. 05:42 failed with OS error 112. Full backup Sunday 23:00 succeeded.",
      );
      return;
    }

    if (normalized.includes("backup log")) {
      if (!state.backupSpaceRestored) {
        terminalResult(
          entered,
          "Msg 3202: Write on backup device failed. Operating system error 112 (There is not enough space on the disk.).",
          "error",
        );
        return;
      }
      setState((current) => ({ ...current, backupCompleted: true }));
      resolveTicket(
        "INC-2084",
        "log backup completed and the chain was validated",
      );
      terminalResult(
        entered,
        "Processed 28,416 pages for database 'FIN-PROD'. BACKUP LOG successfully processed in 4.122 seconds.",
        "success",
      );
      return;
    }

    if (normalized.includes("hadr") || normalized.includes("replica state")) {
      setState((current) => ({ ...current, healthChecked: true }));
      resolveTicket(
        "OPS-0612",
        "current health verified; transient warning documented for monitoring",
      );
      terminalResult(
        entered,
        "SALES-PROD | SYNCHRONIZED | HEALTHY | secondary connected\nWarning window: 02:14–02:16, automatically recovered.",
        "success",
      );
      return;
    }

    if (normalized.includes("job history")) {
      setState((current) => ({ ...current, jobHistoryChecked: true }));
      setTicketStatus("INC-2087", "investigating");
      terminalResult(
        entered,
        "CustomerImport step 2 failed at 07:12. File not found: \\vendor-drop\\customer_20260920.csv. No rows imported.",
      );
      return;
    }

    if (
      normalized.includes("start job") ||
      normalized.includes("sp_start_job")
    ) {
      if (!state.fileAvailable) {
        terminalResult(
          entered,
          "Job started, then failed: required vendor file is still absent.",
          "error",
        );
        deduct(
          "premature-job-retry",
          2,
          "CustomerImport was retried before its dependency arrived",
        );
        return;
      }
      if (!state.jobHistoryChecked) {
        terminalResult(
          entered,
          "Job started without reviewing the original failure. It completed, but the diagnostic trail is incomplete.",
          "success",
        );
        deduct(
          "job-no-diagnosis",
          3,
          "CustomerImport was rerun without reviewing failure evidence",
        );
      } else {
        terminalResult(
          entered,
          "CustomerImport completed. 48,219 rows loaded; validation count matches the vendor control file.",
          "success",
        );
      }
      setState((current) => ({ ...current, importCompleted: true }));
      resolveTicket(
        "INC-2087",
        "dependency arrived, job reran, and row counts matched",
      );
      return;
    }

    if (normalized === "sp_who2" || normalized.includes("blocking chain")) {
      if (minute < 515) {
        terminalResult(
          entered,
          "No blocking chain currently exceeds 30 seconds.",
        );
        return;
      }
      setState((current) => ({ ...current, blockingCaptured: true }));
      setTicketStatus("INC-2091", "investigating");
      terminalResult(
        entered,
        "SPID 184 blocks 62, 77, 91 and 104\n184: month_end_report | open transaction 00:09:14\nVictims: order_lookup | wait LCK_M_S\nEstimated rollback for 184: 00:01:40",
      );
      return;
    }

    if (normalized === "kill 184") {
      if (!state.blockingCaptured || !state.reportOwnerContacted) {
        setState((current) => ({ ...current, blockerCleared: true }));
        resolveTicket(
          "INC-2091",
          "blocker terminated without complete coordination",
        );
        deduct(
          "unsafe-kill",
          15,
          "Session 184 was killed before evidence and business-owner coordination were complete",
        );
        terminalResult(
          entered,
          "Session 184 terminated. Rollback started. Reporting owner was not prepared for the interruption.",
          "error",
        );
        return;
      }
      setState((current) => ({ ...current, blockerCleared: true }));
      resolveTicket(
        "INC-2091",
        "blocking evidence preserved, owner coordinated, and latency recovered",
      );
      terminalResult(
        entered,
        "Session 184 terminated with owner approval. Rollback completed in 00:01:36. Order lookup latency returned to baseline.",
        "success",
      );
      return;
    }

    if (normalized.includes("clarify req-5519")) {
      setState((current) => ({ ...current, accessClarified: true }));
      setTicketStatus("REQ-5519", "investigating");
      terminalResult(
        entered,
        "Task confirmed: execute dbo.usp_OrderTrace and view its definition for two hours. db_owner is not required.",
      );
      return;
    }

    if (normalized.includes("grant db_owner")) {
      deduct(
        "unsafe-access",
        20,
        "Excessive permanent production access was granted",
      );
      resolveTicket("REQ-5519", "request closed with excessive access");
      terminalResult(
        entered,
        "Role membership changed. WARNING: db_owner exceeds the documented task and has no expiration.",
        "error",
      );
      return;
    }

    if (
      normalized.includes("grant execute") &&
      normalized.includes("req-5519")
    ) {
      if (!state.accessClarified) {
        deduct(
          "access-not-clarified",
          5,
          "Access was granted before the production task was clarified",
        );
      }
      setState((current) => ({ ...current, leastPrivilegeGranted: true }));
      resolveTicket(
        "REQ-5519",
        "time-bound EXECUTE and VIEW DEFINITION granted with removal scheduled",
      );
      terminalResult(
        entered,
        "Granted EXECUTE and VIEW DEFINITION for dbo.usp_OrderTrace. Access expires at 5:00 PM; removal task created.",
        "success",
      );
      return;
    }

    if (normalized.includes("precheck chg-7731")) {
      setState((current) => ({ ...current, changePrechecked: true }));
      setTicketStatus("CHG-7731", "investigating");
      terminalResult(
        entered,
        "CAB approval valid. Backup current. Rollback checksum verified. Blocking clear. Application and QA owners present.",
        "success",
      );
      return;
    }

    if (normalized.includes("deploy chg-7731")) {
      if (!state.changePrechecked) {
        deduct(
          "deploy-no-precheck",
          10,
          "CHG-7731 was executed without production prechecks",
        );
        terminalResult(
          entered,
          "Deployment completed, but prerequisites and rollback readiness were not captured.",
          "error",
        );
      } else {
        terminalResult(
          entered,
          "Index created and stored procedure altered. Execution completed within the approved window.",
          "success",
        );
      }
      setState((current) => ({ ...current, changeDeployed: true }));
      return;
    }

    if (normalized.includes("validate chg-7731")) {
      if (!state.changeDeployed) {
        terminalResult(
          entered,
          "Nothing to validate: deployment has not run.",
          "error",
        );
        return;
      }
      setState((current) => ({ ...current, changeValidated: true }));
      resolveTicket(
        "CHG-7731",
        "database and application validation passed; monitoring remained healthy",
      );
      terminalResult(
        entered,
        "Object definitions match the package. Smoke tests passed. Query latency and error rate remain at baseline.",
        "success",
      );
      return;
    }

    if (normalized.includes("capacity forecast")) {
      setState((current) => ({ ...current, capacityReviewed: true }));
      setTicketStatus("PRB-1044", "investigating");
      terminalResult(
        entered,
        "CRM-PROD DATA: 83% used | +6 percentage points / 30 days | forecast 90% in 19 days | largest growth: CRM_AuditData.",
      );
      return;
    }

    if (normalized.includes("open capacity request")) {
      if (!state.capacityReviewed) {
        deduct(
          "capacity-no-evidence",
          3,
          "Capacity request opened without collecting forecast evidence",
        );
      }
      setState((current) => ({ ...current, capacityRequested: true }));
      resolveTicket(
        "PRB-1044",
        "forecast and growth evidence sent to the infrastructure owner",
      );
      terminalResult(
        entered,
        "INFRA-8821 created for 200 GB expansion. Owner: Wintel/Storage. Target completion: September 25.",
        "success",
      );
      return;
    }

    if (normalized.includes("restart") || normalized.includes("shutdown")) {
      deduct(
        "unnecessary-restart",
        20,
        "An unapproved production restart caused avoidable downtime",
      );
      terminalResult(
        entered,
        "Command blocked by the simulator safety layer. In production this would cause an unauthorized outage.",
        "error",
      );
      return;
    }

    terminalResult(
      entered,
      "Command not recognized by this training environment. Type HELP for supported investigations and actions.",
      "error",
    );
  };

  const contactStorage = () => {
    if (state.storageContacted) return;
    setState((current) => ({
      ...current,
      storageContacted: true,
      backupSpaceRestored: true,
    }));
    setTicketStatus("INC-2084", "waiting");
    addLog(
      "Storage owner cleared expired staging files; backup target now has 35 GB free.",
      "message",
    );
  };

  const contactVendor = () => {
    if (state.vendorContacted) return;
    setState((current) => ({ ...current, vendorContacted: true }));
    setTicketStatus("INC-2087", "waiting");
    addLog(
      "Vendor integration owner confirmed a delayed file with a 7:40 AM ETA.",
      "message",
    );
  };

  const contactReportOwner = () => {
    if (state.reportOwnerContacted) return;
    setState((current) => ({ ...current, reportOwnerContacted: true }));
    setTicketStatus("INC-2091", "waiting");
    addLog(
      "Reporting owner approved termination of session 184 after evidence review.",
      "message",
    );
  };

  const submitHandoff = () => {
    const normalized = handoff.toLowerCase();
    const completeHandoff =
      handoff.trim().length >= 120 &&
      normalized.includes("owner") &&
      (normalized.includes("capacity") || normalized.includes("infra-8821")) &&
      (normalized.includes("access") || normalized.includes("5:00"));
    setHandoffSubmitted(true);
    if (!completeHandoff) {
      deduct(
        "weak-handoff",
        10,
        "Handoff omitted status, evidence, an owner, or a timed follow-up",
      );
      addLog(
        "End-of-shift handoff submitted with missing operational detail.",
        "warning",
      );
      return;
    }
    addLog(
      "Complete handoff delivered with status, evidence, owners, and deadlines.",
      "success",
    );
  };

  const reset = () => {
    setMinute(SHIFT_START);
    setRunning(false);
    setSpeed(1);
    setView("operations");
    setSelectedTicket("INC-2084");
    setStatuses(makeStatuses());
    setAnnounced([]);
    setPenalties({});
    setActivityLog([
      {
        id: "shift-start",
        minute: SHIFT_START,
        kind: "message",
        text: "Day shift started. Overnight handoff and monitoring queue are ready for review.",
      },
    ]);
    setTerminal([
      {
        id: "welcome",
        command: "-- ForgeDBA production console",
        output:
          "Connected with read-first training permissions. Type HELP to inspect the available environment. Your commands change the simulated system state.",
      },
    ]);
    setCommand("");
    setHandoff("");
    setHandoffSubmitted(false);
    setState({
      diskChecked: false,
      backupHistoryChecked: false,
      storageContacted: false,
      backupSpaceRestored: false,
      backupCompleted: false,
      healthChecked: false,
      jobHistoryChecked: false,
      vendorContacted: false,
      fileAvailable: false,
      importCompleted: false,
      blockingCaptured: false,
      reportOwnerContacted: false,
      blockerCleared: false,
      accessClarified: false,
      leastPrivilegeGranted: false,
      changePrechecked: false,
      changeDeployed: false,
      changeValidated: false,
      capacityReviewed: false,
      capacityRequested: false,
    });
  };

  const jumpFiveMinutes = () =>
    setMinute((current) => Math.min(SHIFT_END, current + 5));

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-8">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              variant="outline"
            >
              Live environment
            </Badge>
            <Badge variant="outline">Normal day shift</Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            ForgeDBA Operations Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Investigate freely, coordinate with teams, execute commands, and own
            the handoff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <div className="mr-2 min-w-28">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Shift clock
            </div>
            <div className="font-mono text-2xl font-black text-primary">
              {formatTime(minute)}
            </div>
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setRunning((current) => !current)}
            disabled={shiftFinished}
          >
            {running ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={jumpFiveMinutes}
            disabled={shiftFinished}
          >
            <FastForward className="h-4 w-4" />
          </Button>
          <div className="flex rounded-md border border-border p-0.5">
            {([1, 2, 4] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(value)}
                className={`rounded px-2 py-1 font-mono text-xs ${speed === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {value}×
              </button>
            ))}
          </div>
          <Button size="icon" variant="ghost" onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {metric.label}
            </div>
            <div
              className={`mt-1 text-lg font-bold ${metric.healthy ? "text-emerald-400" : "text-amber-300"}`}
            >
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["operations", "Operations", Gauge],
              ["console", "SSMS Console", TerminalSquare],
              ["tickets", "Ticket Queue", TicketCheck],
              ["handoff", "Handoff", FileText],
            ] as const
          ).map(([id, label, Icon]) => (
            <Button
              key={id}
              variant={view === id ? "default" : "ghost"}
              size="sm"
              onClick={() => setView(id)}
            >
              <Icon className="mr-2 h-4 w-4" /> {label}
            </Button>
          ))}
        </div>
        <div className="flex min-w-64 items-center gap-3">
          <span className="text-xs text-muted-foreground">Shift</span>
          <Progress value={progress} className="h-2" />
          <span className="font-mono text-sm font-bold">{score}</span>
        </div>
      </div>

      {view === "operations" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Current operational picture
                </p>
                <h2 className="mt-1 text-xl font-bold">Production estate</h2>
              </div>
              <ServerCog className="h-6 w-6 text-primary" />
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">FIN-PROD</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${state.backupCompleted ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Database ONLINE
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${state.backupCompleted ? "text-emerald-400" : "text-red-300"}`}
                >
                  {state.backupCompleted
                    ? "Log backup current"
                    : "Log backup failed"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">SALES-PROD</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${minute >= 515 && !state.blockerCleared ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  AG SYNCHRONIZED
                </p>
                <p className="mt-1 text-sm font-medium">
                  {minute >= 515 && !state.blockerCleared
                    ? "Order latency degraded"
                    : "Application healthy"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">CRM-PROD</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Database ONLINE
                </p>
                <p className="mt-1 text-sm font-medium">DATA volume 83%</p>
              </div>
            </div>

            <div className="border-t border-border p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Team coordination
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={contactStorage}
                  disabled={state.storageContacted}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact storage
                  owner
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={contactVendor}
                  disabled={state.vendorContacted || minute < 435}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact vendor
                  owner
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={contactReportOwner}
                  disabled={state.reportOwnerContacted || minute < 515}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact report
                  owner
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Investigation happens in the SSMS Console. Communication and
                ownership happen here—just like the real job.
              </p>
            </div>
          </section>

          <aside className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-primary" /> Live activity
              </h2>
              <Badge variant="outline">{activityLog.length}</Badge>
            </div>
            <div className="max-h-[520px] space-y-3 overflow-y-auto p-4">
              {[...activityLog].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-3 rounded-lg border border-border bg-background/30 p-3"
                >
                  <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">
                    {formatTime(entry.minute)}
                  </span>
                  <p
                    className={`text-xs leading-relaxed ${entry.kind === "warning" ? "text-amber-300" : entry.kind === "success" ? "text-emerald-300" : entry.kind === "alert" ? "text-red-300" : "text-muted-foreground"}`}
                  >
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {view === "console" && (
        <section className="overflow-hidden rounded-xl border border-border bg-[#07110b] shadow-xl">
          <div className="flex items-center justify-between border-b border-emerald-950 bg-[#0b1710] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Database className="h-4 w-4" /> FORGEDBA-OPS · Production
              training connection
            </div>
            <Badge
              variant="outline"
              className="border-emerald-800 text-emerald-400"
            >
              Connected
            </Badge>
          </div>
          <div className="h-[520px] overflow-y-auto p-4 font-mono text-sm">
            {terminal.map((entry) => (
              <div key={entry.id} className="mb-5">
                <div className="text-emerald-400">
                  SQLDBA&gt; {entry.command}
                </div>
                <pre
                  className={`mt-2 whitespace-pre-wrap leading-relaxed ${entry.tone === "error" ? "text-red-300" : entry.tone === "success" ? "text-emerald-200" : "text-slate-300"}`}
                >
                  {entry.output}
                </pre>
              </div>
            ))}
            <div ref={terminalBottom} />
          </div>
          <form
            onSubmit={executeCommand}
            className="flex gap-2 border-t border-emerald-950 bg-[#0b1710] p-3"
          >
            <span className="pt-2 font-mono text-sm text-emerald-400">
              SQLDBA&gt;
            </span>
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600"
              placeholder="Type HELP or enter a command..."
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-700 text-white hover:bg-emerald-600"
            >
              Run
            </Button>
          </form>
        </section>
      )}

      {view === "tickets" && (
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-xl border border-border bg-card p-3">
            <div className="mb-3 flex items-center justify-between px-2 py-1">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Inbox className="h-4 w-4" /> Incoming queue
              </h2>
              <Badge variant="outline">{releasedTickets.length}</Badge>
            </div>
            <div className="space-y-2">
              {releasedTickets.map((ticket) => (
                <button
                  type="button"
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`w-full rounded-lg border p-3 text-left ${selectedTicket === ticket.id ? "border-primary/50 bg-primary/10" : "border-border bg-background/30"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={priorityStyle[ticket.priority]}
                      >
                        {ticket.priority}
                      </Badge>
                      <span className="font-mono text-xs font-semibold">
                        {ticket.id}
                      </span>
                    </div>
                    {statuses[ticket.id] === "resolved" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium">{ticket.title}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {statuses[ticket.id]}
                  </p>
                </button>
              ))}
              {!releasedTickets.length && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No tickets released yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={priorityStyle[selected.priority]}
                  >
                    {selected.priority}
                  </Badge>
                  <span className="font-mono text-sm font-bold">
                    {selected.id}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-bold">{selected.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Opened by {selected.source} at {formatTime(selected.release)}{" "}
                  · target {formatTime(selected.due)}
                </p>
              </div>
              <Badge variant="outline">{statuses[selected.id]}</Badge>
            </div>
            <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">
              {selected.description}
            </p>
            <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your work record
              </h3>
              <div className="mt-3 space-y-2">
                {activityLog
                  .filter(
                    (entry) =>
                      entry.text.includes(selected.id) ||
                      (selected.id === "INC-2084" &&
                        entry.text.toLowerCase().includes("backup")),
                  )
                  .map((entry) => (
                    <p key={entry.id} className="text-sm">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {formatTime(entry.minute)}
                      </span>
                      {entry.text}
                    </p>
                  ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTicketStatus(selected.id, "investigating");
                  addLog(`${selected.id} assigned to the day DBA.`, "message");
                }}
                disabled={statuses[selected.id] === "resolved"}
              >
                Assign to me
              </Button>
              <Button
                onClick={() => setView("console")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <TerminalSquare className="mr-2 h-4 w-4" /> Investigate in
                console
              </Button>
            </div>
          </section>
        </div>
      )}

      {view === "handoff" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  End-of-shift record
                </p>
                <h2 className="text-2xl font-bold">
                  Write the next DBA’s handoff
                </h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Write it yourself. Include resolved work, validation evidence,
              open risk, the capacity owner, and the 5:00 PM temporary-access
              removal.
            </p>
            <textarea
              value={handoff}
              onChange={(event) => setHandoff(event.target.value)}
              rows={12}
              disabled={handoffSubmitted}
              className="mt-5 w-full rounded-lg border border-border bg-background/50 p-4 text-sm leading-relaxed outline-none focus:border-primary"
              placeholder="Day shift handoff..."
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {handoff.length} characters
              </span>
              <Button
                onClick={submitHandoff}
                disabled={handoffSubmitted}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="mr-2 h-4 w-4" /> Submit handoff
              </Button>
            </div>
          </section>

          <aside className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Shift scorecard</h2>
            <div className="mt-5 text-center">
              <div className="text-6xl font-black text-primary">{score}</div>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                Operational score
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tickets resolved</span>
                <span className="font-mono font-bold">
                  {resolvedCount}/{tickets.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deductions</span>
                <span className="font-mono font-bold text-amber-300">
                  -{100 - score}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Handoff</span>
                <span className="font-semibold">
                  {handoffSubmitted ? "Submitted" : "Pending"}
                </span>
              </div>
            </div>
            {Object.entries(penalties).length > 0 && (
              <div className="mt-6 border-t border-border pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Coaching flags
                </h3>
                {Object.entries(penalties).map(([key, points]) => (
                  <div
                    key={key}
                    className="mb-2 flex items-center justify-between rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs"
                  >
                    <span>{key.replaceAll("-", " ")}</span>
                    <span>-{points}</span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {shiftFinished && (
        <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              {resolvedCount === tickets.length && handoffSubmitted ? (
                <ShieldCheck className="mt-1 h-6 w-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="mt-1 h-6 w-6 text-amber-300" />
              )}
              <div>
                <h2 className="font-bold">The 2:00 PM shift has ended</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resolvedCount} of {tickets.length} tickets resolved. Complete
                  the handoff before leaving the console.
                </p>
              </div>
            </div>
            <Button onClick={() => setView("handoff")}>Open handoff</Button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>
          Training rule: diagnose → stabilize → validate → document. The
          simulator blocks real infrastructure access.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/modules/daily-operations"
            className="flex items-center font-semibold text-primary hover:underline"
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Study Daily DBA
            Operations
          </Link>
          <Link
            href="/workday-simulator"
            className="font-semibold text-primary hover:underline"
          >
            Open Guided Scenarios
          </Link>
        </div>
      </div>
    </div>
  );
}
