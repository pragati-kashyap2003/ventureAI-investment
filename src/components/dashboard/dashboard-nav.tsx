import { Link } from "react-router-dom";
import { ArrowLeftRight, Diamond, History, Home, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type NavSection = "dashboard" | "search" | "history";

const NAV_ITEMS: { id: NavSection; label: string; icon: typeof Home; target: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, target: "#top" },
  { id: "search", label: "New Research", icon: Plus, target: "#search" },
  { id: "history", label: "History", icon: History, target: "#history-panel" },
];

interface DashboardNavProps {
  activeSection?: NavSection;
  comparisonMode: boolean;
  onToggleComparison: () => void;
  onNewResearch: () => void;
}

export function DashboardNav({
  activeSection = "dashboard",
  comparisonMode,
  onToggleComparison,
  onNewResearch,
}: DashboardNavProps) {
  const scrollTo = (target: string, id: NavSection) => {
    if (id === "search") {
      onNewResearch();
    }
    if (target.startsWith("#") && target.length > 1) {
      document.getElementById(target.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header id="top" className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-[15px] hover:opacity-80 transition-opacity shrink-0"
        >
          <Diamond className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">VentureScope</span>
        </Link>

        <nav className="flex items-center gap-1 bg-secondary/80 rounded-xl p-1 border border-border/60">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.target, item.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={onToggleComparison}
          title="Toggle comparison mode"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 border",
            comparisonMode
              ? "bg-[var(--primary-tint)] text-primary border-primary/30"
              : "text-muted-foreground border-border/60 hover:bg-secondary hover:text-foreground"
          )}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="hidden sm:inline">Compare</span>
        </button>
      </div>
    </header>
  );
}

export function DashboardHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-[var(--primary-tint)] via-card to-[var(--invest-tint)] p-8 md:p-10 mb-8">
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-invest/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            AI Research
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Investment Research Agent
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl">
          Enter any company name. Five AI agents research, score, and deliver an INVEST or PASS verdict.
        </p>
      </div>
    </div>
  );
}
