"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import jsPDF from "jspdf";

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

export default function HomePage() {
  const [company, setCompany] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<ResearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [streamMessages, setStreamMessages] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comparison mode
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

  const handleSearch = async (targetCompany?: string) => {
    const searchCompany = targetCompany || company;
    if (!searchCompany.trim() || isSearching) return;

    setIsSearching(true);
    setResult(null);
    setError(null);
    setStreamMessages([]);
    setShowSuggestions(false);

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
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>VentureScope</span>
          <span className={styles.logoBadge}>AI</span>
        </div>
        <div className={styles.navLinks}>
          <button
            className={`${styles.navLink} ${comparisonMode ? styles.navLinkActive : ""}`}
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            ⚡ Compare
          </button>
          <a
            href="https://github.com"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.pulseDot} />
          <span>Powered by LangGraph + Gemini 1.5 Pro</span>
        </div>

        <h1 className={styles.heroTitle}>
          AI Investment
          <br />
          <span className={styles.heroGradient}>Research Agent</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Enter any company name. Our multi-agent AI pipeline researches it in real-time
          <br />
          and delivers a data-backed <strong>INVEST</strong> or <strong>PASS</strong> verdict.
        </p>

        {/* Search Box */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⟳</span>
            <input
              ref={inputRef}
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter company name (e.g. Zepto, Razorpay, OpenAI...)"
              className={styles.searchInput}
              disabled={isSearching}
              autoComplete="off"
              id="company-search"
            />
            <button
              className={styles.searchBtn}
              onClick={() => handleSearch()}
              disabled={isSearching || !company.trim()}
              id="research-btn"
            >
              {isSearching ? (
                <span className={styles.spinner} />
              ) : (
                <span>Analyze →</span>
              )}
            </button>
          </div>

          {/* Autocomplete */}
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

        {/* Quick picks */}
        <div className={styles.quickPicks}>
          <span className={styles.quickPicksLabel}>Try:</span>
          {["Zepto", "Reliance", "Razorpay", "Swiggy", "OpenAI"].map(c => (
            <button
              key={c}
              className={styles.quickPickBtn}
              onClick={() => { setCompany(c); handleSearch(c); }}
              disabled={isSearching}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Comparison Mode Banner */}
      {comparisonMode && (
        <section className={styles.comparisonBanner}>
          <div className={styles.comparisonHeader}>
            <h3>⚡ Comparison Mode</h3>
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
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  comparisonCompanies.forEach(c => handleSearch(c));
                }}
              >
                <span>Compare All →</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Live Stream Panel */}
      {isSearching && (
        <section className={styles.streamSection}>
          <div className={styles.streamHeader}>
            <div className={styles.streamLive}>
              <span className={styles.pulseDot} />
              <span>Live Research Stream</span>
            </div>
            <span className={styles.streamCompany}>{company}</span>
          </div>

          {/* Agent Pipeline Visualization */}
          <div className={styles.agentPipeline}>
            {[
              { id: "webResearcher", label: "Web Researcher", icon: "🔍" },
              { id: "sentimentAnalyst", label: "Sentiment AI", icon: "📰" },
              { id: "financialAnalyst", label: "Financial AI", icon: "📊" },
              { id: "riskAssessor", label: "Risk Assessor", icon: "⚠️" },
              { id: "verdictWriter", label: "CIO Agent", icon: "🧠" },
            ].map((node, i) => {
              const nodeMessages = streamMessages.filter(m =>
                m.toLowerCase().includes(node.id.toLowerCase().replace("node", "")) ||
                (i === 0 && streamMessages.some(m => m.includes("Searching"))) ||
                (i === 1 && streamMessages.some(m => m.includes("Analyzing"))) ||
                (i === 2 && streamMessages.some(m => m.includes("financial"))) ||
                (i === 3 && streamMessages.some(m => m.includes("risk"))) ||
                (i === 4 && streamMessages.some(m => m.includes("CIO")))
              );
              const isDone = streamMessages.some(m => m.includes("✅") && (
                (i === 0 && m.includes("Research complete")) ||
                (i === 1 && m.includes("Sentiment")) ||
                (i === 2 && m.includes("Financial score")) ||
                (i === 3 && m.includes("Risk level")) ||
                (i === 4 && m.includes("Verdict"))
              ));
              const isActive = !isDone && nodeMessages.length > 0;

              return (
                <div key={node.id} className={styles.pipelineNode}>
                  <div className={`${styles.nodeCircle} ${isDone ? styles.nodeDone : isActive ? styles.nodeActive : styles.nodeIdle}`}>
                    <span>{isDone ? "✓" : node.icon}</span>
                  </div>
                  <span className={styles.nodeLabel}>{node.label}</span>
                  {i < 4 && <div className={`${styles.nodeConnector} ${isDone ? styles.connectorDone : ""}`} />}
                </div>
              );
            })}
          </div>

          {/* Message stream */}
          <div className={styles.messageStream}>
            {streamMessages.map((msg, i) => (
              <div key={i} className={styles.streamMessage} style={{ animationDelay: `${i * 0.05}s` }}>
                <span className={styles.streamMessageText}>{msg}</span>
              </div>
            ))}
            {isSearching && (
              <div className={styles.streamCursor}>
                <span className={styles.cursorDot} />
                <span className={styles.cursorDot} style={{ animationDelay: "0.2s" }} />
                <span className={styles.cursorDot} style={{ animationDelay: "0.4s" }} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <section className={styles.errorSection}>
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠</span>
            <div>
              <h3>Research Failed</h3>
              <p>{error}</p>
              <p style={{ fontSize: "12px", marginTop: "8px", color: "var(--text-muted)" }}>
                Check your API keys in .env.local
              </p>
            </div>
            <button className={styles.retryBtn} onClick={() => handleSearch()}>Retry</button>
          </div>
        </section>
      )}

      {/* Results */}
      {result && !isSearching && (
        <ResultsDashboard result={result} />
      )}

      {/* Features Grid */}
      {!isSearching && !result && (
        <section className={styles.featuresSection}>
          <h2 className={styles.featuresTitle}>How It Works</h2>
          <div className={styles.featuresGrid}>
            {[
              {
                icon: "🧠",
                title: "LangGraph Pipeline",
                desc: "5 specialized AI agents run in sequence — each one builds on the last. Powered by LangGraph.js."
              },
              {
                icon: "🔍",
                title: "Real-Time Web Research",
                desc: "Tavily Search API fetches fresh data from the web. No hallucinations — every claim is sourced."
              },
              {
                icon: "📊",
                title: "Quantified Scorecard",
                desc: "5-dimension investment score across Growth, Risk, Moat, Sentiment & Valuation."
              },
              {
                icon: "⚡",
                title: "Live Streaming",
                desc: "Watch the AI think in real-time via Server-Sent Events. See every agent's reasoning as it happens."
              },
              {
                icon: "🎯",
                title: "INVEST / PASS Verdict",
                desc: "Clear, decisive verdict with confidence score and full CIO-level executive summary."
              },
              {
                icon: "📋",
                title: "PDF Export",
                desc: "Download a full research report as PDF. Share with your team or portfolio."
              },
            ].map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && !isSearching && !result && (
        <section className={styles.historySection}>
          <h2 className={styles.historyTitle}>Recent Analyses</h2>
          <div className={styles.historyList}>
            {history.map(h => (
              <button
                key={h.id}
                className={styles.historyItem}
                onClick={() => { setCompany(h.company); handleSearch(h.company); }}
              >
                <div className={styles.historyCompany}>{h.company}</div>
                <div className={`${styles.historyVerdict} ${h.verdict === "INVEST" ? styles.historyInvest : styles.historyPass}`}>
                  {h.verdict} · {h.confidence}%
                </div>
                <div className={styles.historyTime}>
                  {new Date(h.timestamp).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerLogo}>◈ VentureScope AI</span>
          <span className={styles.footerTagline}>
            Built with LangGraph.js · LangChain · Gemini 1.5 Pro · Next.js 14
          </span>
          <span className={styles.footerNote}>For InsideIIM × Altuni AI Labs</span>
        </div>
      </footer>
    </div>
  );
}

// ── Results Dashboard (inline component) ────────────────────────────
function ResultsDashboard({ result }: { result: Record<string, unknown> }) {
  const verdictData = result.verdictData as Record<string, unknown>;
  const financialData = result.financialData as Record<string, unknown>;
  const sentimentData = result.sentimentData as Record<string, unknown>;
  const riskData = result.riskData as Record<string, unknown>;
  const researchData = result.researchData as Record<string, unknown>;

  const isInvest = verdictData?.verdict === "INVEST";
  const confidence = (verdictData?.confidence as number) || 0;

  const handleExport = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    const maxWidth = pageWidth - margin * 2;
    let y = 60;

    const addSpace = (h: number) => {
      if (y + h > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = 60;
      }
    };

    const heading = (text: string) => {
      addSpace(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(text, margin, y);
      y += 18;
      doc.setDrawColor(200);
      doc.line(margin, y - 10, pageWidth - margin, y - 10);
    };

    const body = (text: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const lines = doc.splitTextToSize(text || "N/A", maxWidth);
      lines.forEach((line: string) => {
        addSpace(16);
        doc.text(line, margin, y);
        y += 16;
      });
      y += 8;
    };

    const list = (items: string[]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      items.forEach((item, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${item}`, maxWidth);
        lines.forEach((line: string) => {
          addSpace(16);
          doc.text(line, margin, y);
          y += 16;
        });
      });
      y += 8;
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("VentureScope AI — Investment Research Report", margin, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Company: ${result.company}`, margin, y);
    y += 14;
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}`, margin, y);
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.text(`Verdict: ${verdictData.verdict} (${verdictData.confidence}% confidence)`, margin, y);
    y += 24;

    heading("Executive Summary");
    body(verdictData.executiveSummary as string);

    heading("Investment Thesis");
    body(verdictData.investmentThesis as string);

    heading("Scorecard");
    body(
      `Growth: ${financialData.growthScore}/100   Financial: ${financialData.financialScore}/100   ` +
      `Sentiment: ${sentimentData.sentimentScore}/100   Risk: ${riskData.riskScore}/100   Moat: ${financialData.moatScore}/100`
    );

    heading("Bull Case");
    list((verdictData.keyBullCase as string[]) || []);

    heading("Bear Case");
    list((verdictData.keyBearCase as string[]) || []);

    heading("Key Risks");
    list(
      [
        ...((riskData.marketRisks as string[]) || []),
        ...((riskData.competitiveRisks as string[]) || []),
      ].slice(0, 5)
    );

    heading("Final Note");
    body(verdictData.finalNote as string);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Generated by VentureScope AI | Powered by LangGraph + Gemini", margin, doc.internal.pageSize.getHeight() - 24);

    doc.save(`${result.company}_investment_report.pdf`);
  };

  // Radar chart data
  const scores = [
    { label: "Growth", value: (financialData.growthScore as number) || 50 },
    { label: "Moat", value: (financialData.moatScore as number) || 50 },
    { label: "Valuation", value: (financialData.valuationScore as number) || 50 },
    { label: "Sentiment", value: (sentimentData.sentimentScore as number) || 50 },
    { label: "Risk", value: (riskData.riskScore as number) || 50 },
  ];

  return (
    <section className={styles.results} id="results">
      {/* Verdict Hero */}
      <div className={`${styles.verdictHero} ${isInvest ? styles.verdictInvest : styles.verdictPass}`}>
        <div className={styles.verdictLeft}>
          <div className={styles.verdictBadge}>
            <span>{isInvest ? "▲" : "▼"}</span>
            <span>{verdictData.verdict as string}</span>
          </div>
          <h2 className={styles.verdictCompany}>{result.company as string}</h2>
          <p className={styles.verdictSummary}>{verdictData.executiveSummary as string}</p>
          <div className={styles.verdictMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Confidence</span>
              <span className={styles.metaValue}>{confidence}%</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Time Horizon</span>
              <span className={styles.metaValue}>{verdictData.timeHorizon as string}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Sentiment</span>
              <span className={styles.metaValue}>{sentimentData.sentimentLabel as string}</span>
            </div>
          </div>
          <div className={styles.verdictActions}>
            <button className="btn-primary" onClick={handleExport} id="export-btn">
              <span>📋 Export Report</span>
            </button>
            <button className="btn-ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              ↑ New Search
            </button>
          </div>
        </div>
        <div className={styles.verdictRight}>
          <RadarChart scores={scores} isInvest={isInvest} />
        </div>
      </div>

      {/* Scorecard Row */}
      <div className={styles.scorecardRow}>
        {scores.map(s => (
          <ScoreCard key={s.label} label={s.label} value={s.value} isInvest={isInvest} />
        ))}
      </div>

      {/* Bull / Bear */}
      <div className={styles.bullBearGrid}>
        <div className={styles.bullCard}>
          <h3 className={styles.bullTitle}>🟢 Bull Case</h3>
          <ul className={styles.caseList}>
            {((verdictData.keyBullCase as string[]) || []).map((item, i) => (
              <li key={i} className={styles.caseItem}>
                <span className={styles.caseIcon}>▲</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.bearCard}>
          <h3 className={styles.bearTitle}>🔴 Bear Case</h3>
          <ul className={styles.caseList}>
            {((verdictData.keyBearCase as string[]) || []).map((item, i) => (
              <li key={i} className={styles.caseItem}>
                <span className={styles.caseIconRed}>▼</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Risks */}
      <div className={styles.risksSection}>
        <h3 className={styles.sectionTitle}>⚠️ Risk Assessment</h3>
        <div className={styles.risksGrid}>
          {[
            { title: "Market Risks", items: riskData.marketRisks as string[] || [] },
            { title: "Competitive Risks", items: riskData.competitiveRisks as string[] || [] },
            { title: "Regulatory Risks", items: riskData.regulatoryRisks as string[] || [] },
          ].map(r => (
            <div key={r.title} className={styles.riskCard}>
              <h4 className={styles.riskTitle}>{r.title}</h4>
              <ul>
                {r.items.slice(0, 3).map((item, i) => (
                  <li key={i} className={styles.riskItem}>· {item}</li>
                ))}
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

      {/* Sources */}
      {((researchData.sources as string[]) || []).length > 0 && (
        <div className={styles.sourcesSection}>
          <h3 className={styles.sectionTitle}>🔗 Research Sources</h3>
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

      {/* Final Note */}
      <div className={styles.finalNote}>
        <span className={styles.finalNoteIcon}>💡</span>
        <p>{verdictData.finalNote as string}</p>
      </div>
    </section>
  );
}

// ── Radar Chart SVG ─────────────────────────────────────────────────
function RadarChart({ scores, isInvest }: { scores: { label: string; value: number }[]; isInvest: boolean }) {
  const cx = 120, cy = 120, r = 85;
  const n = scores.length;
  const color = isInvest ? "#10b981" : "#f43f5e";

  const angleOffset = -Math.PI / 2;
  const getCoord = (i: number, radius: number) => {
    const angle = (i * 2 * Math.PI) / n + angleOffset;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const dataPoints = scores.map((s, i) => getCoord(i, (s.value / 100) * r));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className={styles.radarWrapper}>
      <svg viewBox="0 0 240 240" className={styles.radarSvg}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {rings.map((ratio) => {
          const pts = scores.map((_, i) => getCoord(i, ratio * r));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return <path key={ratio} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}

        {/* Spokes */}
        {scores.map((_, i) => {
          const outer = getCoord(i, r);
          return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}

        {/* Data area */}
        <path d={pathD} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" filter="url(#glow)" />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} filter="url(#glow)" />
        ))}

        {/* Labels */}
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
              fill="rgba(255,255,255,0.7)"
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

// ── Score Card ───────────────────────────────────────────────────────
function ScoreCard({ label, value, isInvest }: { label: string; value: number; isInvest: boolean }) {
  const color = value >= 65 ? "#10b981" : value >= 40 ? "#f59e0b" : "#f43f5e";
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <div className={styles.scoreCard}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r="28"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 36 36)"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="36" y="36" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill={color} fontFamily="Outfit, sans-serif">
          {value}
        </text>
      </svg>
      <span className={styles.scoreLabel}>{label}</span>
    </div>
  );
}
