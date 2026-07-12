import jsPDF from "jspdf";
import { compositeScore, extractScores } from "@/lib/types/dashboard";

export function exportInvestmentReport(result: Record<string, unknown>) {
  const verdictData = result.verdictData as Record<string, unknown>;
  const financialData = result.financialData as Record<string, unknown>;
  const sentimentData = result.sentimentData as Record<string, unknown>;
  const riskData = result.riskData as Record<string, unknown>;

  const confidence = (verdictData?.confidence as number) || 0;
  const scores = extractScores(result);
  const composite = compositeScore(scores);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = 50;

  const ensureSpace = (h: number) => {
    if (y + h > pageHeight - margin - 10) {
      doc.addPage();
      y = 40;
    }
  };

  const heading = (text: string, size: number = 12) => {
    ensureSpace(18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(79, 70, 229);
    doc.text(text, margin, y);
    y += size / 2 + 6;
  };

  const subheading = (text: string) => {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.text(text, margin, y);
    y += 12;
  };

  const body = (text: string, size: number = 9) => {
    if (!text || text === "N/A") return;
    const lines = doc.splitTextToSize(text, maxWidth);
    ensureSpace(lines.length * (size + 2) + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(55, 65, 81);
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += size + 2;
    });
    y += 2;
  };

  const compactList = (items: string[], icon = "•", size: number = 9) => {
    if (!items?.length) return;
    items.slice(0, 3).forEach((item) => {
      const lines = doc.splitTextToSize(`${icon} ${item}`, maxWidth - 16);
      ensureSpace(lines.length * (size + 1));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(55, 65, 81);
      lines.forEach((line: string) => {
        doc.text(line, margin + 10, y);
        y += size + 1;
      });
    });
    y += 2;
  };

  // ========== PAGE 1: COVER & OVERVIEW ==========
  const isInvest = verdictData?.verdict === "INVEST";
  const verdictColor = isInvest ? [22, 163, 74] : [220, 38, 38];

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text("VentureScope AI", pageWidth / 2, 45, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  doc.text("Investment Research Report", pageWidth / 2, 62, { align: "center" });

  // Verdict box
  doc.setFillColor(...(verdictColor as [number, number, number]));
  doc.rect(margin, 75, maxWidth, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(verdictData.verdict as string, pageWidth / 2, 100, {
    align: "center",
  });

  // Quick info
  y = 140;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  doc.text("Company:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text((result.company as string).toUpperCase(), margin + 60, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Score:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${composite}/100`, margin + 60, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Confidence:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${confidence}%`, margin + 60, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Risk Level:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text((riskData?.overallRiskLevel as string) || "N/A", margin + 60, y);
  y += 14;

  // Scores in compact format
  heading("Investment Scores", 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);

  const scoreLabels = ["Growth", "Moat", "Valuation", "Sentiment", "Risk"];
  scores.forEach((score, idx) => {
    if (idx % 2 === 0) {
      ensureSpace(12);
    }
    const xPos = idx % 2 === 0 ? margin : margin + maxWidth / 2;
    const yPos = y + (Math.floor(idx / 2) * 11);

    // Label and value
    doc.text(`${scoreLabels[idx]}: ${score.value}/100`, xPos, yPos);
  });
  y += 40;

  // Executive Summary
  heading("Executive Summary", 11);
  body(verdictData.executiveSummary as string, 8);

  // ========== PAGE 2: ANALYSIS & RISKS ==========
  doc.addPage();
  y = 40;

  // Investment Thesis
  heading("Investment Thesis & Key Points", 11);
  body(verdictData.investmentThesis as string, 8);

  // Bull/Bear cases in 2 columns
  subheading("Bull Case");
  compactList(((verdictData.keyBullCase as string[]) || []).slice(0, 3), "✓", 8);

  subheading("Bear Case");
  compactList(((verdictData.keyBearCase as string[]) || []).slice(0, 3), "✗", 8);

  // Financial Metrics (compact table)
  heading("Financial Metrics", 11);
  const keyMetrics = (financialData?.keyMetrics as Record<string, any>) || {};

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text("Metric", margin, y);
  doc.text("Value", margin + maxWidth / 2, y);
  y += 8;

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const metrics = [
    ["Revenue", keyMetrics.revenue || "N/A"],
    ["Growth", keyMetrics.growth || "N/A"],
    ["Valuation", keyMetrics.valuation || "N/A"],
    ["Burn Rate", keyMetrics.burn_rate || "N/A"],
  ];

  metrics.forEach((metric) => {
    ensureSpace(10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(metric[0], margin, y);
    doc.text(metric[1], margin + maxWidth / 2, y);
    y += 9;
  });

  y += 4;

  // Risk Assessment
  heading("Risk Assessment", 11);
  body(riskData?.riskSummary as string, 8);

  subheading("Key Risks");
  compactList((riskData?.marketRisks as string[]) || [], "⚠", 8);

  // Sentiment
  heading("Market Sentiment", 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  const sentimentScore = sentimentData?.sentimentScore || 50;
  doc.text(
    `Sentiment: ${sentimentScore}/100 | ${(sentimentData?.sentimentLabel as string) || "N/A"}`,
    margin,
    y
  );
  y += 10;

  body((sentimentData?.bullNarrative as string) || "", 8);

  // ========== PAGE 3: CATALYSTS & FINAL RECOMMENDATION ==========
  doc.addPage();
  y = 40;

  heading("Catalysts & Milestones", 11);
  const catalysts = (verdictData?.catalysts as string[]) || [];
  if (catalysts[0]) {
    subheading("Near-term (0-3 months)");
    body(catalysts[0], 8);
  }
  if (catalysts[1]) {
    subheading("Mid-term (3-12 months)");
    body(catalysts[1], 8);
  }
  if (catalysts[2]) {
    subheading("Long-term (1-3 years)");
    body(catalysts[2], 8);
  }

  // Comparable Companies
  heading("Comparable Companies", 11);
  compactList((verdictData?.comparableCompanies as string[]) || [], "▪", 8);

  // Valuation & Stage
  heading("Valuation & Investment Stage", 11);
  body(verdictData?.valuationAssessment as string, 8);
  body((verdictData?.investmentStage as string) || "", 8);

  // Final Recommendation
  heading("Final Investment Recommendation", 11);
  body(verdictData?.finalNote as string, 8);

  // Key monitoring points
  subheading("Key Risks to Monitor");
  compactList((verdictData?.keyRisksToMonitor as string[]) || [], "●", 8);

  // Footer
  y = pageHeight - 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} | VentureScope AI Investment Research`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 8;
  doc.text(
    "This report is based on available public data and should not be considered financial advice.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  doc.save(`${result.company}_investment_report.pdf`);
}
