export interface ResearchHistory {
  id: string;
  company: string;
  verdict: string;
  confidence: number;
  timestamp: string;
  result?: Record<string, unknown>;
}

export interface ScoreRow {
  label: string;
  value: number;
}

export interface PipelineStep {
  id: string;
  label: string;
  match: string;
}

export const DEMO_COMPANIES = [
  "Zepto", "Reliance Industries", "OpenAI", "Zomato", "HDFC Bank",
  "Swiggy", "PhonePe", "Ola", "Meesho", "Razorpay",
];

export const POPULAR = ["Zepto", "Reliance Industries", "Razorpay", "Swiggy", "OpenAI"];

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: "companyResolver", label: "Company Resolution", match: "Resolving" },
  { id: "webResearcher", label: "Web Research", match: "Searching" },
  { id: "sentimentAnalyst", label: "News & Sentiment", match: "sentiment" },
  { id: "financialAnalyst", label: "Financial Analysis", match: "financial" },
  { id: "riskAssessor", label: "Risk Assessment", match: "risk" },
  { id: "verdictWriter", label: "Final Decision", match: "verdict" },
];

export function extractScores(result: Record<string, unknown>): ScoreRow[] {
  const financialData = result.financialData as Record<string, unknown>;
  const sentimentData = result.sentimentData as Record<string, unknown>;
  const riskData = result.riskData as Record<string, unknown>;

  return [
    { label: "Growth", value: (financialData?.growthScore as number) ?? 50 },
    { label: "Moat", value: (financialData?.moatScore as number) ?? 50 },
    { label: "Valuation", value: (financialData?.valuationScore as number) ?? 50 },
    { label: "Sentiment", value: (sentimentData?.sentimentScore as number) ?? 50 },
    { label: "Risk", value: 100 - ((riskData?.riskScore as number) ?? 50) },
  ];
}

export function compositeScore(scores: ScoreRow[]): number {
  return Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);
}
