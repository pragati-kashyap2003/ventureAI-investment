import { PIPELINE_STEPS } from "@/lib/types/dashboard";
import { cn, scoreBg } from "@/lib/utils";

export function ResearchStepsPanel({
  streamMessages,
  elapsed,
  company,
}: {
  streamMessages: string[];
  elapsed: number;
  company: string;
}) {
  const getStepStatus = (step: (typeof PIPELINE_STEPS)[0]) => {
    const isDone =
      streamMessages.some(
        (m) =>
          m.toLowerCase().includes("completed") &&
          m.toLowerCase().includes(step.match.toLowerCase())
      ) ||
      streamMessages.some(
        (m) => m.includes("✅") && m.toLowerCase().includes(step.match.toLowerCase())
      );
    const relevant = streamMessages.filter((m) =>
      m.toLowerCase().includes(step.match.toLowerCase())
    );
    const isActive =
      !isDone &&
      relevant.length > 0 &&
      streamMessages[streamMessages.length - 1] === relevant[relevant.length - 1];
    return { isDone, isActive };
  };

  let currentActive = PIPELINE_STEPS.findIndex((step) => getStepStatus(step).isActive);
  if (currentActive === -1) {
    const lastDone = [...PIPELINE_STEPS].reverse().findIndex((step) => getStepStatus(step).isDone);
    currentActive = lastDone === -1 ? 0 : PIPELINE_STEPS.length - 1 - lastDone + 1;
    currentActive = Math.min(currentActive, PIPELINE_STEPS.length - 1);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold">Research in progress</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px] md:max-w-none">
            {company}
          </p>
        </div>
        <span className="text-sm tabular font-mono text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-start gap-0 overflow-x-auto pb-1">
        {PIPELINE_STEPS.map((step, i) => {
          const { isDone, isActive } = getStepStatus(step);
          const showActive = isActive || (!isDone && i === currentActive && !PIPELINE_STEPS.some((s) => getStepStatus(s).isActive));

          return (
            <div key={step.id} className="flex items-start min-w-0 flex-1">
              <div className="flex flex-col items-center flex-1 min-w-[80px]">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isDone && "bg-invest text-white",
                    showActive && "bg-primary text-white ring-4 ring-primary/20",
                    !isDone && !showActive && "bg-secondary text-muted-foreground"
                  )}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <p
                  className={cn(
                    "text-[11px] mt-2 text-center leading-tight px-1",
                    showActive ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mt-4 min-w-[16px] transition-colors",
                    isDone ? "bg-invest/40" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KeyScoresPanel({ result }: { result: Record<string, unknown> }) {
  const financialData = result.financialData as Record<string, unknown>;
  const sentimentData = result.sentimentData as Record<string, unknown>;
  const riskData = result.riskData as Record<string, unknown>;

  const rows = [
    { label: "Growth", value: (financialData?.growthScore as number) ?? 50 },
    { label: "Financial", value: (financialData?.financialScore as number) ?? 50 },
    { label: "Moat", value: (financialData?.moatScore as number) ?? 50 },
    { label: "Valuation", value: (financialData?.valuationScore as number) ?? 50 },
    { label: "Sentiment", value: (sentimentData?.sentimentScore as number) ?? 50 },
    { label: "Risk Adj.", value: 100 - ((riskData?.riskScore as number) ?? 50) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {rows.map((r) => (
        <div
          key={r.label}
          className="rounded-xl border border-border/60 bg-card p-4 text-center hover:border-primary/20 transition-colors"
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
            {r.label}
          </p>
          <p className="text-2xl font-bold tabular">{Math.round(r.value)}</p>
          <div className="h-1 rounded-full bg-secondary mt-2 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", scoreBg(r.value))}
              style={{ width: `${r.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentResearchRail({
  history,
  onSelect,
}: {
  history: { id: string; company: string; verdict: string; timestamp: string }[];
  onSelect: (entry: { id: string; company: string; verdict: string; timestamp: string }) => void;
}) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {history.slice(0, 6).map((h) => (
        <button
          key={h.id}
          onClick={() => onSelect(h)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-secondary/50 transition-all text-sm"
        >
          <span className="font-medium">{h.company}</span>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              h.verdict === "INVEST"
                ? "bg-[var(--invest-tint)] text-invest"
                : "bg-[var(--pass-tint)] text-pass"
            )}
          >
            {h.verdict}
          </span>
        </button>
      ))}
    </div>
  );
}
