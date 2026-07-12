import { Search, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POPULAR } from "@/lib/types/dashboard";

interface SearchPanelProps {
  company: string;
  setCompany: (v: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  isSearching: boolean;
  onSearch: (company?: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchPanel({
  company,
  setCompany,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  isSearching,
  onSearch,
  inputRef,
}: SearchPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  return (
    <Card id="search" className="shadow-[var(--shadow-md)] border-border/60 rounded-2xl overflow-hidden">
      <CardContent className="p-5 md:p-6 space-y-4">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Zepto, Razorpay, OpenAI"
              className="pl-11 h-12 text-base rounded-xl border-border/80 bg-secondary/40 focus:bg-card"
              disabled={isSearching}
              autoComplete="off"
              id="company-search"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-card border border-border rounded-xl shadow-[var(--shadow-lg)] overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left hover:bg-secondary transition-colors"
                    onClick={() => {
                      setCompany(s);
                      setShowSuggestions(false);
                      onSearch(s);
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => onSearch()}
            disabled={isSearching || !company.trim()}
            className="sm:min-w-[150px] h-12 rounded-xl text-base"
            id="research-btn"
          >
            {isSearching ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Research</>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Try:</span>
          {POPULAR.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCompany(c);
                onSearch(c);
              }}
              disabled={isSearching}
              className="text-xs px-3 py-1.5 rounded-full border border-border/80 bg-secondary/60 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HowItWorksCard() {
  const steps = [
    { num: "01", title: "Web Research", desc: "Live data from Tavily across news, financials, and competitors" },
    { num: "02", title: "Multi-Agent Analysis", desc: "Sentiment, financial, and risk agents score every dimension" },
    { num: "03", title: "CIO Verdict", desc: "Final INVEST or PASS recommendation with confidence score" },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {steps.map((s) => (
        <div
          key={s.num}
          className="rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/20 hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-3xl font-extrabold text-primary/20 tabular">{s.num}</span>
          <h3 className="font-semibold mt-2 mb-1">{s.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function DemoModeBanner() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] border border-amber/30 bg-[var(--amber-tint)] text-sm">
      <span className="text-amber font-semibold">Demo Mode</span>
      <span className="text-muted-foreground">
        API keys not configured. Showing sample data. Add OPENROUTER_API_KEY and TAVILY_API_KEY to .env.local for live research.
      </span>
    </div>
  );
}

export function ComparisonBanner({
  comparisonCompanies,
  setComparisonCompanies,
  company,
  isSearching,
  onCompareAll,
}: {
  comparisonCompanies: string[];
  setComparisonCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  company: string;
  isSearching: boolean;
  onCompareAll: () => void;
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-[var(--primary-tint)] p-5 md:p-6">
      <p className="text-sm font-semibold mb-1">Comparison Mode</p>
      <p className="text-xs text-muted-foreground mb-4">Add up to 3 companies to compare side-by-side</p>
      <div className="flex flex-wrap gap-3 items-center">
        {[0, 1, 2].map((i) => (
          <div key={i} className="min-w-[140px] flex-1 max-w-[200px]">
            {comparisonCompanies[i] ? (
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-sm font-medium truncate">{comparisonCompanies[i]}</span>
                <button
                  className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0"
                  onClick={() => setComparisonCompanies((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                className="w-full px-4 py-2.5 rounded-xl border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors"
                onClick={() => {
                  if (company.trim() && !comparisonCompanies.includes(company)) {
                    setComparisonCompanies((prev) => [...prev, company.trim()]);
                  }
                }}
              >
                + Add {company || "company"}
              </button>
            )}
          </div>
        ))}
        {comparisonCompanies.length >= 2 && (
          <Button onClick={onCompareAll} disabled={isSearching} className="rounded-xl">
            {isSearching ? "Comparing..." : "Compare All"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ErrorCard({
  error,
  onRetry,
  demoMode,
}: {
  error: string;
  onRetry: () => void;
  demoMode?: boolean;
}) {
  return (
    <Card className="border-pass/30 bg-[var(--pass-tint)]">
      <CardContent className="flex items-start gap-4 p-6">
        <span className="text-2xl">!</span>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Research Failed</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          {!demoMode && (
            <p className="text-xs text-muted-foreground mt-1">
              Check your API keys in .env.local (OPENROUTER_API_KEY, TAVILY_API_KEY)
            </p>
          )}
        </div>
        <Button variant="ghost" onClick={onRetry}>Retry</Button>
      </CardContent>
    </Card>
  );
}

export function HistoryGrid({
  history,
  onSelect,
}: {
  history: { id: string; company: string; verdict: string; confidence: number; timestamp: string }[];
  onSelect: (entry: { id: string; company: string; verdict: string; confidence: number; timestamp: string }) => void;
}) {
  return (
    <div id="history-panel">
      <h2 className="text-lg font-semibold mb-4">Recent Analyses</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((h) => (
          <button
            key={h.id}
            onClick={() => onSelect(h)}
            className="text-left p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-[var(--shadow-sm)] transition-all group"
          >
            <p className="font-semibold mb-3 group-hover:text-primary transition-colors">{h.company}</p>
            <Badge variant={h.verdict === "INVEST" ? "invest" : "pass"} className="mb-3">
              {h.verdict} · {h.confidence}%
            </Badge>
            <p className="text-xs text-muted-foreground">
              {new Date(h.timestamp).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
