"use client";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import styles from "./page.module.css";

interface ResearchHistory {
  id: string;
  company: string;
  verdict: string;
  confidence: number;
  timestamp: string;
}

const DEMO_COMPANIES = [
  "Zepto", "Reliance Industries", "OpenAI", "Zomato", "HDFC Bank",
  "Swiggy", "PhonePe", "Ola", "Meesho", "Razorpay",
];

const POPULAR = ["Zepto", "Reliance Industries", "Razorpay", "Swiggy", "OpenAI"];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "new", label: "New Research", icon: "⌕" },
  { id: "history", label: "Research History", icon: "◷" },
  { id: "watchlist", label: "Watchlist", icon: "☆" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const PIPELINE_STEPS = [
  { id: "webResearcher", label: "Web Research", match: "Searching" },
  { id: "sentimentAnalyst", label: "News & Sentiment", match: "Analyzing" },
  { id: "financialAnalyst", label: "Financial Analysis", match: "financial" },
  { id: "riskAssessor", label: "Risk Assessment", match: "risk" },
  { id: "verdictWriter", label: "Final Decision", match: "CIO" },
];

export default function HomePage() {
  const [company, setCompany] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<ResearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [streamMessages, setStreamMessages] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  const [comparisonCompanies, setComparisonCompanies] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("research_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (company.length > 1) {
      const filtered = DEMO_COMPANIES.filter(c =>
        c.toLowerCase().includes(company.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [company]);

  useEffect(() => {
    if (!isSearching) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSearching]);

  const resetToNewSearch = () => {
    setResult(null);
    setError(null);
    setCompany("");
    setShowFullSummary(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    inputRef.current?.focus();
  };

  const handleSearch = async (targetCompany?: string) => {
    const searchCompany = targetCompany || company;
    if (!searchCompany.trim() || isSearching) return;

    setIsSearching(true);
    setResult(null);
    setError(null);
    setStreamMessages([]);
    setShowSuggestions(false);
    setShowFullSummary(false);
    setElapsed(0);
    startTimeRef.current = Date.now();

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: searchCompany.trim() }),
      });

      if (!response.ok) throw new Error("Research failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "progress") {
              setStreamMessages(prev => [...prev, data.message]);
            } else if (data.type === "complete") {
              setResult(data.result);

              const entry: ResearchHistory = {
                id: Date.now().toString(),
                company: searchCompany,
                verdict: (data.result.verdictData as Record<string, unknown>)?.verdict as string || "PASS",
                confidence: (data.result.verdictData as Record<string, unknown>)?.confidence as number || 0,
                timestamp: new Date().toISOString(),
              };
              const newHistory = [entry, ...history.slice(0, 9)];
              setHistory(newHistory);
              localStorage.setItem("research_history", JSON.stringify(newHistory));
            } else if (data.type === "error") {
              setError(data.message);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  return (
    <div className={styles.appShell}>
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.sidebarLogoIcon}>◈</span>
          <span className={styles.sidebarLogoText}>VentureScope</span>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${item.id === "dashboard" ? styles.navItemActive : ""}`}
              onClick={() => {
                if (item.id === "new") resetToNewSearch();
                if (item.id === "dashboard") window.scrollTo({ top: 0, behavior: "smooth" });
                if (item.id === "history") {
                  document.getElementById("history-panel")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.upgradeCard}>
            <div className={styles.upgradeTitle}>⚡ Upgrade to Pro</div>
            <p className={styles.upgradeDesc}>Unlock advanced reports, export data, and more.</p>
            <button className={styles.upgradeBtn}>Upgrade Now</button>
          </div>
          <div className={styles.userFooter}>
            <div className={styles.userAvatar}>PK</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Pragati Kashyap</span>
              <span className={styles.userPlan}>Free Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className={styles.mainArea}>
        <header className={styles.topHeader}>
          <div>
            <h1 className={styles.pageTitle}>AI Investment Research Agent</h1>
            <p className={styles.pageSubtitle}>Research any company. Get insights. Make smarter investment decisions.</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.iconBtn} ${comparisonMode ? styles.iconBtnActive : ""}`}
              onClick={() => setComparisonMode(!comparisonMode)}
              title="Toggle comparison mode"
            >
              ⇄
            </button>
            <button className={styles.iconBtn} title="Help">?</button>
            <div className={styles.headerAvatar}>PK</div>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <main className={styles.mainColumn}>
            {/* Search card */}
            <div className={styles.searchCard}>
              <h2 className={styles.searchCardTitle}>Start your research</h2>
              <p className={styles.searchCardSubtitle}>Enter a company name to begin AI-powered analysis</p>

              <div className={styles.searchRow}>
                <div className={styles.searchInputWrap}>
                  <span className={styles.searchInputIcon}>⌕</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Zepto, Razorpay, OpenAI"
                    className={styles.searchInput}
                    disabled={isSearching}
                    autoComplete="off"
                    id="company-search"
                  />
                  {showSuggestions && (
                    <div className={styles.suggestions}>
                      {suggestions.map(s => (
                        <button
                          key={s}
                          className={styles.suggestionItem}
                          onClick={() => { setCompany(s); setShowSuggestions(false); handleSearch(s); }}
                        >
                          <span className={styles.suggestionIcon}>◈</span>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleSearch()}
                  disabled={isSearching || !company.trim()}
                  id="research-btn"
                >
                  {isSearching ? <span className={styles.spinner} /> : <span>Research →</span>}
                </button>
              </div>

              <div className={styles.popularRow}>
                <span className={styles.popularLabel}>Popular:</span>
                {POPULAR.map(c => (
                  <button
                    key={c}
                    className={styles.popularChip}
                    onClick={() => { setCompany(c); handleSearch(c); }}
                    disabled={isSearching}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison mode */}
            {comparisonMode && (
              <div className={styles.comparisonBanner}>
                <div className={styles.comparisonHeader}>
                  <h3>Comparison Mode</h3>
                  <p>Add up to 3 companies to compare side-by-side</p>
                </div>
                <div className={styles.comparisonSlots}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className={styles.comparisonSlot}>
                      {comparisonCompanies[i] ? (
                        <div className={styles.comparisonSlotFilled}>
                          <span>{comparisonCompanies[i]}</span>
                          <button
                            className={styles.removeSlot}
                            onClick={() => setComparisonCompanies(prev => prev.filter((_, idx) => idx !== i))}
                          >×</button>
                        </div>
                      ) : (
                        <button
                          className={styles.comparisonSlotEmpty}
                          onClick={() => {
                            if (company.trim() && !comparisonCompanies.includes(company)) {
                              setComparisonCompanies(prev => [...prev, company.trim()]);
                            }
                          }}
                        >
                          + Add {company || "company"}
                        </button>
                      )}
                    </div>
                  ))}
                  {comparisonCompanies.length >= 2 && (
                    <button
                      className="btn-primary"
                      onClick={() => comparisonCompanies.forEach(c => handleSearch(c))}
                    >
                      Compare All →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className={styles.errorCard}>
                <span className={styles.errorIcon}>⚠</span>
                <div>
                  <h3>Research Failed</h3>
                  <p>{error}</p>
                  <p className={styles.errorHint}>Check your API keys in .env.local</p>
                </div>
                <button className="btn-ghost" onClick={() => handleSearch()}>Retry</button>
              </div>
            )}

            {/* Results */}
            {result && !isSearching && (
              <ResultsDashboard
                result={result}
                showFullSummary={showFullSummary}
                setShowFullSummary={setShowFullSummary}
              />
            )}

            {/* Idle state: how it works */}
            {!isSearching && !result && (
              <div className={styles.howItWorks}>
                <h3 className={styles.howItWorksTitle}>How it works</h3>
                <div className={styles.howItWorksRow}>
                  {[
                    { icon: "⌕", text: "5 AI agents research the company from live web sources" },
                    { icon: "▤", text: "Each agent scores growth, risk, moat, valuation & sentiment" },
                    { icon: "◆", text: "A final CIO-style agent renders an INVEST / PASS verdict" },
                  ].map(f => (
                    <div key={f.text} className={styles.howItWorksItem}>
                      <span className={styles.howItWorksIcon}>{f.icon}</span>
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div id="history-panel" className={styles.historySectionInline}>
                <h3 className={styles.railPanelTitle}>Recent Analyses</h3>
                <div className={styles.historyGrid}>
                  {history.map(h => (
                    <button
                      key={h.id}
                      className={styles.historyItem}
                      onClick={() => { setCompany(h.company); handleSearch(h.company); }}
                    >
                      <div className={styles.historyCompany}>{h.company}</div>
                      <div className={`${styles.historyVerdict} ${h.verdict === "INVEST" ? styles.pillInvest : styles.pillPass}`}>
                        {h.verdict} · {h.confidence}%
                      </div>
                      <div className={styles.historyTime}>{new Date(h.timestamp).toLocaleDateString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ── Right rail ─────────────────────────────────────── */}
          <aside className={styles.rightRail}>
            {isSearching && (
              <ResearchStepsPanel streamMessages={streamMessages} elapsed={elapsed} company={company} />
            )}

            {result && !isSearching && <KeyScoresPanel result={result} />}

            {history.length > 0 && (
              <div className={styles.railPanel}>
                <div className={styles.railPanelHeader}>
                  <h3 className={styles.railPanelTitle}>Recent Research</h3>
                </div>
                <div className={styles.recentList}>
                  {history.slice(0, 4).map(h => (
                    <button
                      key={h.id}
                      className={styles.recentItem}
                      onClick={() => { setCompany(h.company); handleSearch(h.company); }}
                    >
                      <span className={styles.recentLogo}>{h.company.charAt(0)}</span>
                      <span className={styles.recentInfo}>
                        <span className={styles.recentName}>{h.company}</span>
                        <span className={styles.recentDate}>{new Date(h.timestamp).toLocaleDateString()}</span>
                      </span>
                      <span className={`${styles.recentPill} ${h.verdict === "INVEST" ? styles.pillInvest : styles.pillPass}`}>
                        {h.verdict}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── Research Steps Panel (right rail, live) ──────────────────────────
function ResearchStepsPanel({ streamMessages, elapsed, company }: { streamMessages: string[]; elapsed: number; company: string }) {
  return (
    <div className={styles.railPanel}>
      <div className={styles.railPanelHeader}>
        <h3 className={styles.railPanelTitle}>Research Steps</h3>
        <span className={styles.elapsedTime}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
      </div>
      <p className={styles.stepsCompany}>{company}</p>
      <div className={styles.stepsList}>
        {PIPELINE_STEPS.map((step, i) => {
          const relevant = streamMessages.filter(m => m.toLowerCase().includes(step.match.toLowerCase()));
          const isDone = streamMessages.some(m => m.includes("✅") && m.toLowerCase().includes(step.match.toLowerCase()));
          const isActive = !isDone && relevant.length > 0 && streamMessages[streamMessages.length - 1] === relevant[relevant.length - 1];
          const latestMessage = relevant[relevant.length - 1];

          return (
            <div key={step.id} className={styles.stepItem}>
              <span className={`${styles.stepIcon} ${isDone ? styles.stepIconDone : isActive ? styles.stepIconActive : styles.stepIconPending}`}>
                {isDone ? "✓" : isActive ? "●" : "○"}
              </span>
              <div className={styles.stepText}>
                <span className={isDone || isActive ? styles.stepLabelActive : styles.stepLabel}>{step.label}</span>
                {isActive && latestMessage && (
                  <span className={styles.stepMessage}>{latestMessage.replace(/^[^\w]*/, "")}</span>
                )}
                {isDone && <span className={styles.stepStatus}>Completed</span>}
                {!isDone && !isActive && i > 0 && <span className={styles.stepStatus}>Pending</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Key Scores Panel (right rail, post-result) ───────────────────────
function KeyScoresPanel({ result }: { result: Record<string, unknown> }) {
  const financialData = result.financialData as Record<string, unknown>;
  const sentimentData = result.sentimentData as Record<string, unknown>;
  const riskData = result.riskData as Record<string, unknown>;

  const rows = [
    { label: "Growth", value: (financialData?.growthScore as number) ?? 50 },
    { label: "Financial Health", value: (financialData?.financialScore as number) ?? 50 },
    { label: "Moat", value: (financialData?.moatScore as number) ?? 50 },
    { label: "Valuation", value: (financialData?.valuationScore as number) ?? 50 },
    { label: "Sentiment", value: (sentimentData?.sentimentScore as number) ?? 50 },
    { label: "Risk", value: 100 - ((riskData?.riskScore as number) ?? 50) },
  ];

  return (
    <div className={styles.railPanel}>
      <div className={styles.railPanelHeader}>
        <h3 className={styles.railPanelTitle}>Key Scores</h3>
      </div>
      <div className={styles.miniScoreList}>
        {rows.map(r => (
          <div key={r.label} className={styles.miniScoreRow}>
            <span className={styles.miniScoreLabel}>{r.label}</span>
            <div className={styles.miniScoreBarTrack}>
              <div
                className={styles.miniScoreBarFill}
                style={{ width: `${r.value}%`, background: r.value >= 65 ? "var(--invest)" : r.value >= 40 ? "var(--amber)" : "var(--pass)" }}
              />
            </div>
            <span className={`${styles.miniScoreValue} tabular`}>{Math.round(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Results Dashboard ─────────────────────────────────────────────────
function ResultsDashboard({
  result,
  showFullSummary,
  setShowFullSummary,
}: {
  result: Record<string, unknown>;
  showFullSummary: boolean;
  setShowFullSummary: (v: boolean) => void;
}) {
  const verdictData = result.verdictData as Record<string, unknown>;
  const financialData = result.financialData as Record<string, unknown>;
  const sentimentData = result.sentimentData as Record<string, unknown>;
  const riskData = result.riskData as Record<string, unknown>;
  const researchData = result.researchData as Record<string, unknown>;

  const isInvest = verdictData?.verdict === "INVEST";
  const confidence = (verdictData?.confidence as number) || 0;

  const scores = [
    { label: "Growth", value: (financialData.growthScore as number) || 50 },
    { label: "Moat", value: (financialData.moatScore as number) || 50 },
    { label: "Valuation", value: (financialData.valuationScore as number) || 50 },
    { label: "Sentiment", value: (sentimentData.sentimentScore as number) || 50 },
    { label: "Risk", value: 100 - ((riskData.riskScore as number) || 50) },
  ];
  const compositeScore = Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);

  const handleExport = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    const maxWidth = pageWidth - margin * 2;
    let y = 60;

    const ensureSpace = (h: number) => {
      if (y + h > pageHeight - margin - 10) {
        doc.addPage();
        y = 60;
      }
    };

    const heading = (text: string) => {
      ensureSpace(32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229);
      doc.text(text, margin, y);
      y += 16;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      doc.setTextColor(17, 24, 39);
    };

    const body = (text: string) => {
      if (!text || text === "N/A") {
        ensureSpace(20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("No data available", margin, y);
        y += 14;
        return;
      }
      const lines = doc.splitTextToSize(text, maxWidth);
      ensureSpace(lines.length * 14 + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      lines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 14;
      });
      y += 6;
    };

    const list = (items: string[], icon: string = "•") => {
      if (!items || items.length === 0) {
        ensureSpace(20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("No items to display", margin, y);
        y += 14;
        return;
      }
      const totalHeight = items.reduce((h, item) => {
        const lines = doc.splitTextToSize(`${icon} ${item}`, maxWidth - 20);
        return h + lines.length * 14;
      }, 0) + 8;
      
      ensureSpace(totalHeight);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      items.forEach((item) => {
        const lines = doc.splitTextToSize(`${icon} ${item}`, maxWidth - 20);
        lines.forEach((line: string) => {
          doc.text(line, margin + 16, y);
          y += 14;
        });
      });
      y += 6;
    };

    // ──── COVER PAGE ────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(79, 70, 229);
    doc.text("VentureScope AI", pageWidth / 2, 100, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128);
    doc.text("Investment Research Report", pageWidth / 2, 130, { align: "center" });

    // Verdict box on cover
    const isInvest = verdictData?.verdict === "INVEST";
    const verdictColor = isInvest ? [22, 163, 74] : [220, 38, 38];
    doc.setFillColor(...(verdictColor as [number, number, number]));
    doc.rect(margin, 160, maxWidth, 80, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(255);
    doc.text(verdictData.verdict as string, pageWidth / 2, 195, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Confidence: ${confidence}%`, pageWidth / 2, 220, { align: "center" });

    // Company info on cover
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text("Company:", margin, 280);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text((result.company as string).toUpperCase(), margin, 300);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", margin, 330);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString("en-IN", { dateStyle: "full" }), margin, 350);

    doc.setFont("helvetica", "bold");
    doc.text("Investment Score:", margin, 380);
    doc.setFont("helvetica", "normal");
    doc.text(`${compositeScore}/100`, margin, 400);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Powered by LangGraph + Claude AI", pageWidth / 2, pageHeight - 40, { align: "center" });

    // ──── PAGE 2: EXECUTIVE SUMMARY ────
    doc.addPage();
    y = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text("Executive Summary", margin, y);
    y += 24;
    doc.setTextColor(17, 24, 39);

    body(verdictData.executiveSummary as string);

    heading("Investment Thesis");
    body(verdictData.investmentThesis as string);

    heading("Composite Score");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39);
    const scoreBoxWidth = (maxWidth - 20) / 5;
    const scoreBoxes = [
      { label: "Growth", value: (financialData.growthScore as number) || 50, color: [59, 130, 246] },
      { label: "Moat", value: (financialData.moatScore as number) || 50, color: [34, 197, 94] },
      { label: "Valuation", value: (financialData.valuationScore as number) || 50, color: [249, 115, 22] },
      { label: "Sentiment", value: (sentimentData.sentimentScore as number) || 50, color: [139, 92, 246] },
      { label: "Risk", value: 100 - ((riskData.riskScore as number) || 50), color: [239, 68, 68] },
    ];

    ensureSpace(60);
    scoreBoxes.forEach((box, i) => {
      const boxX = margin + i * (scoreBoxWidth + 4);
      const boxColor = box.value >= 65 ? box.color : box.value >= 40 ? [251, 191, 36] : [239, 68, 68];
      doc.setFillColor(...(boxColor as [number, number, number]));
      doc.rect(boxX, y, scoreBoxWidth, 40, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255);
      doc.text(box.label, boxX + scoreBoxWidth / 2, y + 12, { align: "center" });
      doc.setFontSize(14);
      doc.text(String(Math.round(box.value)), boxX + scoreBoxWidth / 2, y + 28, { align: "center" });
    });
    y += 60;
    doc.setTextColor(17, 24, 39);

    // ──── PAGE 3: COMPANY OVERVIEW & FINANCIALS ────
    doc.addPage();
    y = 60;

    heading("Company Overview");
    body((researchData.companyOverview as string) || "N/A");

    heading("Business Model");
    body((researchData.businessModel as string) || "N/A");

    heading("Key Metrics");
    const keyMetrics = researchData.keyMetrics as Record<string, unknown>;
    body(
      `Revenue: ${(keyMetrics?.revenue as string) || "N/A"} | Growth: ${(keyMetrics?.growth as string) || "N/A"} | ` +
      `Valuation: ${(keyMetrics?.valuation as string) || "N/A"} | Profitability: ${(keyMetrics?.profitability as string) || "N/A"}`
    );

    heading("Financial Analysis");
    body((financialData.financialSummary as string) || "N/A");

    heading("Growth Drivers");
    list(((financialData.growthDrivers as string[]) || []).slice(0, 5), "▲");

    heading("Financial Concerns");
    list(((financialData.concerns as string[]) || []).slice(0, 5), "▼");

    heading("Competitive Advantage");
    body((financialData.comparativeAdvantage as string) || "N/A");

    // ──── PAGE 4: INVESTMENT CASE ────
    doc.addPage();
    y = 60;

    heading("Bull Case (Why INVEST)");
    list(((verdictData.keyBullCase as string[]) || []).slice(0, 6), "✓");

    heading("Bear Case (Why PASS)");
    list(((verdictData.keyBearCase as string[]) || []).slice(0, 6), "✗");

    heading("Recent News & Narratives");
    list(((researchData.recentNews as string[]) || []).slice(0, 5), "★");

    heading("Key Narratives");
    list(((sentimentData.keyNarratives as string[]) || []).slice(0, 5), "◆");

    // ──── PAGE 5: SENTIMENT & MARKET ────
    doc.addPage();
    y = 60;

    heading("Sentiment Analysis");
    body(
      `Sentiment Score: ${sentimentData.sentimentScore}/100 (${sentimentData.sentimentLabel as string})\n` +
      `Media Presence: ${sentimentData.mediaPresence as string} | Investor Sentiment: ${sentimentData.investorSentiment as string}`
    );

    heading("Positive Signals");
    list(((sentimentData.positiveSignals as string[]) || []).slice(0, 5), "↑");

    heading("Negative Signals");
    list(((sentimentData.negativeSignals as string[]) || []).slice(0, 5), "↓");

    heading("Competitors & Market Position");
    const competitors = ((researchData.competitors as string[]) || []).slice(0, 5);
    if (competitors.length > 0) {
      list(competitors, "◉");
    } else {
      body("N/A");
    }
    body((researchData.marketPosition as string) || "N/A");

    // ──── PAGE 6: RISK ASSESSMENT ────
    doc.addPage();
    y = 60;

    heading("Risk Assessment");
    body(
      `Overall Risk Level: ${riskData.overallRiskLevel as string} (Score: ${riskData.riskScore as number}/100)\n\n` +
      `${riskData.overallRiskLevel === "Low" || riskData.overallRiskLevel === "Very Low" ? "✓ This investment has LOW risk factors." : "⚠ This investment carries SIGNIFICANT risk factors."}`
    );

    heading("Market Risks");
    list(((riskData.marketRisks as string[]) || []).slice(0, 4), "◆");

    heading("Competitive Risks");
    list(((riskData.competitiveRisks as string[]) || []).slice(0, 4), "◆");

    heading("Regulatory Risks");
    list(((riskData.regulatoryRisks as string[]) || []).slice(0, 4), "◆");

    heading("Operational Risks");
    list(((riskData.operationalRisks as string[]) || []).slice(0, 4), "◆");

    if (((riskData.redFlags as string[]) || []).length > 0) {
      heading("🚩 Red Flags");
      list(((riskData.redFlags as string[]) || []).slice(0, 4), "⚠");
    }

    heading("Mitigating Factors");
    list(((riskData.mitigatingFactors as string[]) || []).slice(0, 4), "✓");

    // ──── PAGE 7: SOURCES ────
    doc.addPage();
    y = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Research Sources", margin, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    ((researchData.sources as string[]) || []).slice(0, 10).forEach((url, i) => {
      ensureSpace(14);
      try {
        const urlObj = new URL(url);
        const link = urlObj.hostname.replace("www.", "");
        doc.textWithLink(link, margin, y, { pageNumber: 0 });
        y += 14;
      } catch {
        doc.text(url.slice(0, 80), margin, y);
        y += 14;
      }
    });

    doc.setTextColor(17, 24, 39);
    ensureSpace(30);
    heading("Final Insight");
    body(verdictData.finalNote as string);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated by VentureScope AI | ${new Date().toISOString().split('T')[0]}`, pageWidth / 2, pageHeight - 24, { align: "center" });

    doc.save(`${result.company}_investment_report.pdf`);
  };

  const strengths = (verdictData.keyBullCase as string[]) || [];
  const risks = (verdictData.keyBearCase as string[]) || [];
  const catalysts = (sentimentData.positiveSignals as string[]) || (sentimentData.keyNarratives as string[]) || [];

  return (
    <div className={styles.resultsWrap}>
      {/* Company header */}
      <div className={styles.resultHeader}>
        <div>
          <h2 className={styles.resultCompanyName}>{result.company as string}</h2>
          <span className={styles.resultTimestamp}>Last updated: {new Date().toLocaleString()}</span>
        </div>
        <button className="btn-ghost" onClick={handleExport} id="export-btn">
          ⬇ Download Report
        </button>
      </div>

      {/* Verdict row */}
      <div className={styles.verdictRow}>
        <div className={styles.decisionCard}>
          <span className={styles.cardLabel}>Investment Decision</span>
          <div className={`${styles.decisionBadge} ${isInvest ? styles.decisionInvest : styles.decisionPass}`}>
            {verdictData.verdict as string}
          </div>
          <span className={styles.cardLabel} style={{ marginTop: 14 }}>AI Confidence</span>
          <span className={`${styles.confidenceValue} tabular`}>{confidence} / 100</span>
          <div className={styles.confidenceTrack}>
            <div
              className={styles.confidenceFill}
              style={{ width: `${confidence}%`, background: isInvest ? "var(--invest)" : "var(--pass)" }}
            />
          </div>
        </div>

        <div className={styles.scoreGaugeCard}>
          <span className={styles.cardLabel}>Investment Score</span>
          <CircularGauge value={compositeScore} isInvest={isInvest} />
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>Summary</span>
          <p className={styles.summaryText}>{verdictData.executiveSummary as string}</p>
          <button className={styles.viewFullLink} onClick={() => setShowFullSummary(!showFullSummary)}>
            {showFullSummary ? "Hide full summary ↑" : "View full summary →"}
          </button>
        </div>
      </div>

      {/* Key metrics (score-based, since no live financial-statement API is wired in) */}
      <div className={styles.metricsCard}>
        <span className={styles.cardLabel}>Key Scores (AI-derived, /100)</span>
        <div className={styles.metricsRow}>
          {scores.map(s => (
            <div key={s.label} className={styles.metricTile}>
              <span className={styles.metricLabel}>{s.label}</span>
              <span className={`${styles.metricValue} tabular`}>{Math.round(s.value)}</span>
              <span className={`${styles.metricLevel} ${s.value >= 65 ? styles.levelHigh : s.value >= 40 ? styles.levelMed : styles.levelLow}`}>
                {s.value >= 65 ? "Strong" : s.value >= 40 ? "Moderate" : "Weak"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Thesis columns */}
      <div className={styles.thesisCard}>
        <span className={styles.cardLabel}>AI Investment Thesis</span>
        <div className={styles.thesisColumns}>
          <div className={styles.thesisColumn}>
            <div className={styles.thesisColumnHeader}>
              <span className={styles.thesisIcon} style={{ color: "var(--invest)" }}>▲</span>
              Strengths
            </div>
            <ul className={styles.thesisList}>
              {strengths.slice(0, 4).map((item, i) => <li key={i}>{item}</li>)}
              {strengths.length === 0 && <li className={styles.thesisEmpty}>No data returned</li>}
            </ul>
          </div>
          <div className={styles.thesisColumn}>
            <div className={styles.thesisColumnHeader}>
              <span className={styles.thesisIcon} style={{ color: "var(--pass)" }}>▼</span>
              Risks
            </div>
            <ul className={styles.thesisList}>
              {risks.slice(0, 4).map((item, i) => <li key={i}>{item}</li>)}
              {risks.length === 0 && <li className={styles.thesisEmpty}>No data returned</li>}
            </ul>
          </div>
          <div className={styles.thesisColumn}>
            <div className={styles.thesisColumnHeader}>
              <span className={styles.thesisIcon} style={{ color: "var(--primary)" }}>◆</span>
              Catalysts
            </div>
            <ul className={styles.thesisList}>
              {catalysts.slice(0, 4).map((item, i) => <li key={i}>{item}</li>)}
              {catalysts.length === 0 && <li className={styles.thesisEmpty}>No data returned</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Expanded: full summary detail */}
      {showFullSummary && (
        <div className={styles.detailsSection}>
          <div className={styles.radarCard}>
            <span className={styles.cardLabel}>Score Breakdown</span>
            <RadarChart scores={scores} isInvest={isInvest} />
          </div>

          <div className={styles.risksSection}>
            <span className={styles.cardLabel}>Full Risk Breakdown</span>
            <div className={styles.risksGrid}>
              {[
                { title: "Market Risks", items: (riskData.marketRisks as string[]) || [] },
                { title: "Competitive Risks", items: (riskData.competitiveRisks as string[]) || [] },
                { title: "Regulatory Risks", items: (riskData.regulatoryRisks as string[]) || [] },
              ].map(r => (
                <div key={r.title} className={styles.riskCard}>
                  <h4 className={styles.riskTitle}>{r.title}</h4>
                  <ul>
                    {r.items.slice(0, 3).map((item, i) => <li key={i} className={styles.riskItem}>· {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            {((riskData.redFlags as string[]) || []).length > 0 && (
              <div className={styles.redFlags}>
                <span className={styles.redFlagLabel}>🚩 Red Flags:</span>
                {((riskData.redFlags as string[]) || []).map((f, i) => (
                  <span key={i} className={styles.redFlagItem}>{f}</span>
                ))}
              </div>
            )}
          </div>

          {((researchData.sources as string[]) || []).length > 0 && (
            <div className={styles.sourcesSection}>
              <span className={styles.cardLabel}>Research Sources</span>
              <div className={styles.sourcesList}>
                {((researchData.sources as string[]) || []).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                    <span className={styles.sourceDot}>●</span>
                    {new URL(url).hostname}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className={styles.finalNote}>
            <span className={styles.finalNoteIcon}>💡</span>
            <p>{verdictData.finalNote as string}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Circular gauge (single score) ─────────────────────────────────────
function CircularGauge({ value, isInvest }: { value: number; isInvest: boolean }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (value / 100) * circumference;
  const color = isInvest ? "var(--invest)" : "var(--pass)";

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className={styles.gaugeSvg}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle
        cx="64" cy="64" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="64" y="60" textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--ink)" fontFamily="Inter, sans-serif">
        {value}
      </text>
      <text x="64" y="80" textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="Inter, sans-serif">
        / 100
      </text>
    </svg>
  );
}

// ── Radar chart (score breakdown) ─────────────────────────────────────
function RadarChart({ scores, isInvest }: { scores: { label: string; value: number }[]; isInvest: boolean }) {
  const cx = 120, cy = 120, r = 85;
  const n = scores.length;
  const color = isInvest ? "#16a34a" : "#dc2626";

  const angleOffset = -Math.PI / 2;
  const getCoord = (i: number, radius: number) => {
    const angle = (i * 2 * Math.PI) / n + angleOffset;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const dataPoints = scores.map((s, i) => getCoord(i, (s.value / 100) * r));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className={styles.radarWrapper}>
      <svg viewBox="0 0 240 240" className={styles.radarSvg}>
        {rings.map(ratio => {
          const pts = scores.map((_, i) => getCoord(i, ratio * r));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return <path key={ratio} d={d} fill="none" stroke="var(--border)" strokeWidth="1" />;
        })}
        {scores.map((_, i) => {
          const outer = getCoord(i, r);
          return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="var(--border)" strokeWidth="1" />;
        })}
        <path d={pathD} fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2" />
        {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />)}
        {scores.map((s, i) => {
          const labelPos = getCoord(i, r + 20);
          return (
            <text
              key={i}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontFamily="Inter, sans-serif"
              fill="var(--muted)"
              fontWeight="600"
            >
              {s.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}