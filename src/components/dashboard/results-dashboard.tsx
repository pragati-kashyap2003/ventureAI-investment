import { motion } from "framer-motion";
import { Download, ExternalLink, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, scoreLabel } from "@/lib/utils";
import { compositeScore, extractScores } from "@/lib/types/dashboard";
import { exportInvestmentReport } from "@/lib/export-report";
import { CircularGauge, ScoreRadarChart } from "./score-radar-chart";
import { ScoreMatrixTable } from "./score-matrix-table";

interface ResultsDashboardProps {
  result: Record<string, unknown>;
  showFullSummary: boolean;
  setShowFullSummary: (v: boolean) => void;
}

export function ResultsDashboard({
  result,
  showFullSummary,
  setShowFullSummary,
}: ResultsDashboardProps) {
  const verdictData = result.verdictData as Record<string, unknown>;
  const financialData = result.financialData as Record<string, unknown>;
  const sentimentData = result.sentimentData as Record<string, unknown>;
  const riskData = result.riskData as Record<string, unknown>;
  const researchData = result.researchData as Record<string, unknown>;

  const isInvest = verdictData?.verdict === "INVEST";
  const confidence = (verdictData?.confidence as number) || 0;
  const scores = extractScores(result);
  const composite = compositeScore(scores);

  const strengths = (verdictData.keyBullCase as string[]) || [];
  const risks = (verdictData.keyBearCase as string[]) || [];
  const catalysts =
    (sentimentData.positiveSignals as string[]) ||
    (sentimentData.keyNarratives as string[]) ||
    [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{result.company as string}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <Button variant="ghost" onClick={() => exportInvestmentReport(result)} id="export-btn">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* Verdict row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Investment Decision
            </p>
            <div
              className={cn(
                "inline-flex items-center px-5 py-2 rounded-[10px] text-2xl font-extrabold tracking-wide mb-4",
                isInvest
                  ? "bg-[var(--invest-tint)] text-invest border border-invest/20"
                  : "bg-[var(--pass-tint)] text-pass border border-pass/20"
              )}
            >
              {verdictData.verdict as string}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              AI Confidence
            </p>
            <p className="text-3xl font-bold tabular mb-2">{confidence} / 100</p>
            <Progress
              value={confidence}
              className="h-2"
              indicatorClassName={isInvest ? "bg-invest" : "bg-pass"}
            />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 self-start">
              Investment Score
            </p>
            <CircularGauge value={composite} isInvest={isInvest} />
          </CardContent>
        </Card>

        <Card className="border-border/80 lg:col-span-1">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Executive Summary
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">
              {verdictData.executiveSummary as string}
            </p>
            <button
              className="text-sm text-primary font-medium mt-3 hover:underline"
              onClick={() => setShowFullSummary(!showFullSummary)}
            >
              {showFullSummary ? "Hide full summary ↑" : "View full summary →"}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Score tiles */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Key Scores (AI-derived, /100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {scores.map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-[10px] bg-secondary/60 border border-border/60 text-center hover:border-primary/20 transition-colors"
              >
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-2xl font-bold tabular">{Math.round(s.value)}</p>
                <Badge
                  variant={s.value >= 65 ? "invest" : s.value >= 40 ? "amber" : "pass"}
                  className="mt-2 text-[10px]"
                >
                  {scoreLabel(s.value)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thesis */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            AI Investment Thesis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Strengths", items: strengths, color: "text-invest", icon: "▲" },
              { title: "Risks", items: risks, color: "text-pass", icon: "▼" },
              { title: "Catalysts", items: catalysts, color: "text-primary", icon: "◆" },
            ].map((col) => (
              <div key={col.title}>
                <div className={cn("flex items-center gap-2 font-semibold mb-3", col.color)}>
                  <span>{col.icon}</span>
                  {col.title}
                </div>
                <ul className="space-y-2">
                  {col.items.slice(0, 4).map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
                      <span className="text-border shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                  {col.items.length === 0 && (
                    <li className="text-sm text-muted-foreground italic">No data returned</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expanded detail */}
      {showFullSummary && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-5"
        >
          <Tabs defaultValue="matrix">
            <TabsList>
              <TabsTrigger value="matrix">Score Matrix</TabsTrigger>
              <TabsTrigger value="radar">Radar Chart</TabsTrigger>
              <TabsTrigger value="risks">Risk Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="matrix">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investment Score Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreMatrixTable scores={scores} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="radar">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Multi-Dimension Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreRadarChart scores={scores} isInvest={isInvest} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: "Market Risks", items: (riskData.marketRisks as string[]) || [] },
                  { title: "Competitive Risks", items: (riskData.competitiveRisks as string[]) || [] },
                  { title: "Regulatory Risks", items: (riskData.regulatoryRisks as string[]) || [] },
                ].map((r) => (
                  <Card key={r.title}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{r.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {r.items.slice(0, 3).map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground">· {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {((riskData.redFlags as string[]) || []).length > 0 && (
                <Card className="mt-4 border-pass/30 bg-[var(--pass-tint)]">
                  <CardContent className="p-4 flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold text-pass">Red Flags:</span>
                    {((riskData.redFlags as string[]) || []).map((f, i) => (
                      <Badge key={i} variant="pass">{f}</Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {((researchData.sources as string[]) || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Research Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {((researchData.sources as string[]) || []).map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-primary" />
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20 bg-[var(--primary-tint)]">
            <CardContent className="p-5 flex gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{verdictData.finalNote as string}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
