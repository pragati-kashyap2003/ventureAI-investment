import { useState, useEffect, useRef } from "react";
import { DashboardHero, DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  ComparisonBanner,
  DemoModeBanner,
  ErrorCard,
  HistoryGrid,
  HowItWorksCard,
  SearchPanel,
} from "@/components/dashboard/search-panel";
import {
  KeyScoresPanel,
  RecentResearchRail,
  ResearchStepsPanel,
} from "@/components/dashboard/panels";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { CompanyDisambiguation } from "@/components/dashboard/company-disambiguation";
import { ComparisonView } from "@/components/dashboard/comparison-view";
import { DEMO_COMPANIES } from "@/lib/types/dashboard";
import {
  loadHistory,
  saveToHistory,
  useResearchStream,
  type ResearchHistoryEntry,
} from "@/hooks/useResearchStream";
import type { ResearchResult } from "@/lib/types/research";

export function DashboardPage() {
  const [company, setCompany] = useState("");
  const [history, setHistory] = useState<ResearchHistoryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [comparisonCompanies, setComparisonCompanies] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isSearching,
    result,
    results,
    error,
    streamMessages,
    elapsed,
    isDemo,
    ambiguousCandidates,
    ambiguousCompany,
    runResearch,
    selectAmbiguousCompany,
    clearAmbiguous,
    setResult,
    setError,
  } = useResearchStream({
    onComplete: (completed: ResearchResult) => {
      const entry = saveToHistory(completed);
      setHistory((prev) => [
        entry,
        ...prev.filter((h) => h.company !== entry.company).slice(0, 9),
      ]);
    },
  });

  useEffect(() => {
    setHistory(loadHistory());
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setDemoMode(Boolean(data.demoMode)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (company.length > 1) {
      const filtered = DEMO_COMPANIES.filter((c) =>
        c.toLowerCase().includes(company.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [company]);

  const resetToNewSearch = () => {
    setResult(null);
    setError(null);
    setCompany("");
    setShowFullSummary(false);
    clearAmbiguous();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSearch = (targetCompany?: string) => {
    const searchCompany = targetCompany || company;
    if (!searchCompany.trim()) return;
    setCompany(searchCompany);
    setShowFullSummary(false);
    clearAmbiguous();
    runResearch(searchCompany);
  };

  const handleHistorySelect = (entry: ResearchHistoryEntry) => {
    setCompany(entry.company);
    if (entry.result) {
      setResult(entry.result);
      setShowFullSummary(false);
      setError(null);
      clearAmbiguous();
    } else {
      handleSearch(entry.company);
    }
  };

  const handleCompareAll = async () => {
    if (comparisonCompanies.length < 2) return;
    setShowFullSummary(false);
    setResult(null);
    setError(null);
    clearAmbiguous();

    for (let i = 0; i < comparisonCompanies.length; i++) {
      await runResearch(comparisonCompanies[i], {
        appendResult: i > 0,
        resetResults: i === 0,
      });
    }
  };

  const activeResult = result as unknown as Record<string, unknown> | null;
  const showComparison = comparisonMode && results.length >= 2 && !isSearching;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <DashboardNav
        comparisonMode={comparisonMode}
        onToggleComparison={() => setComparisonMode(!comparisonMode)}
        onNewResearch={resetToNewSearch}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <DashboardHero />

        {(demoMode || isDemo) && (
          <div className="mb-6">
            <DemoModeBanner />
          </div>
        )}

        <div className="space-y-6">
          <SearchPanel
            company={company}
            setCompany={setCompany}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            isSearching={isSearching}
            onSearch={handleSearch}
            inputRef={inputRef}
          />

          {history.length > 0 && !isSearching && !activeResult && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Recent
              </p>
              <RecentResearchRail
                history={history}
                onSelect={(entry) => handleHistorySelect(entry)}
              />
            </div>
          )}

          {isSearching && (
            <ResearchStepsPanel
              streamMessages={streamMessages}
              elapsed={elapsed}
              company={company}
            />
          )}

          {comparisonMode && (
            <ComparisonBanner
              comparisonCompanies={comparisonCompanies}
              setComparisonCompanies={setComparisonCompanies}
              company={company}
              isSearching={isSearching}
              onCompareAll={handleCompareAll}
            />
          )}

          {ambiguousCandidates && ambiguousCompany && (
            <CompanyDisambiguation
              company={ambiguousCompany}
              candidates={ambiguousCandidates}
              onSelect={selectAmbiguousCompany}
              onCancel={clearAmbiguous}
            />
          )}

          {error && <ErrorCard error={error} onRetry={() => handleSearch()} demoMode={demoMode} />}

          {showComparison && <ComparisonView results={results} />}

          {activeResult && !isSearching && !showComparison && (
            <div className="space-y-6">
              <KeyScoresPanel result={activeResult} />
              <ResultsDashboard
                result={activeResult}
                showFullSummary={showFullSummary}
                setShowFullSummary={setShowFullSummary}
              />
            </div>
          )}

          {!isSearching && !activeResult && !ambiguousCandidates && <HowItWorksCard />}

          {history.length > 0 && (
            <HistoryGrid
              history={history}
              onSelect={(entry) => handleHistorySelect(entry)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
