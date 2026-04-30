import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Loader2, Download } from "lucide-react";

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (sessionStorage.getItem("exit_intent_shown")) return;

    let triggered = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered || e.clientY > 10) return;
      triggered = true;
      sessionStorage.setItem("exit_intent_shown", "1");
      setTimeout(() => setVisible(true), 200);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "exit_intent" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVisible(false)} />
      <div className="relative bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 max-w-md w-full p-8 z-10">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Free Download</p>
            <h2 className="text-xl font-bold text-foreground">DBA Emergency Cheat Sheet</h2>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
          Get the one-page reference every DBA keeps open during incidents — covering backup restore, log file fixes, blocking sessions, and performance triage.
        </p>

        <ul className="space-y-2 mb-6">
          {[
            "Restore database from backup (full + log chain)",
            "Kill blocking sessions & find deadlocks",
            "Shrink log file safely without data loss",
            "Top 5 DMVs every DBA should memorize",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {status === "success" ? (
          <div className="flex items-center gap-2.5 text-green-400 font-medium py-3 justify-center">
            <CheckCircle2 className="h-5 w-5" />
            Sent! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-full"
            />
            <Button type="submit" className="w-full h-11 font-bold" disabled={status === "loading"}>
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send me the cheat sheet →"}
            </Button>
            {status === "error" && <p className="text-xs text-destructive text-center">Something went wrong. Try again.</p>}
          </form>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">No spam. Unsubscribe any time.</p>
      </div>
    </div>
  );
}
