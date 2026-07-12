import type { ResearchResult } from "./types/research";

const DEMO_TEMPLATES: Record<string, Partial<ResearchResult>> = {
  Zepto: {
    verdictData: {
      verdict: "PASS",
      confidence: 62,
      executiveSummary:
        "Zepto shows strong growth in quick commerce but faces intense competition, thin margins, and high cash burn. Valuation appears stretched relative to path to profitability.",
      keyBullCase: [
        "Rapid GMV growth in 10-minute delivery segment",
        "Strong brand recall in metro markets",
        "Expanding dark store network",
        "Tier-1 investor backing",
      ],
      keyBearCase: [
        "Intense competition from Blinkit, Swiggy Instamart",
        "Negative unit economics in many markets",
        "High customer acquisition costs",
        "Regulatory uncertainty on gig workers",
      ],
      investmentThesis:
        "High-growth quick commerce player with strong traction but unproven profitability. Wait for clearer unit economics before investing.",
      timeHorizon: "Medium-term (2-3yr)",
      comparableCompanies: ["Blinkit", "Swiggy Instamart", "Dunzo"],
      finalNote: "Monitor burn rate and path to contribution margin positivity before reconsidering.",
    },
    financialData: {
      financialScore: 45,
      growthScore: 78,
      moatScore: 42,
      valuationScore: 38,
      financialSummary: "High growth but pre-profit with significant burn.",
      growthDrivers: ["Quick commerce adoption", "Metro expansion"],
      concerns: ["Cash burn", "Competition"],
      comparativeAdvantage: "Speed-focused delivery network",
    },
    sentimentData: {
      sentimentScore: 65,
      sentimentLabel: "Mixed",
      keyNarratives: ["Growth story", "Profitability questions"],
      positiveSignals: ["Funding rounds", "Market expansion"],
      negativeSignals: ["Layoffs rumors", "Competition"],
      mediaPresence: "High",
      investorSentiment: "Cautious",
    },
    riskData: {
      riskScore: 68,
      overallRiskLevel: "High",
      marketRisks: ["Market saturation in metros"],
      competitiveRisks: ["Well-funded competitors"],
      regulatoryRisks: ["Gig economy regulations"],
      operationalRisks: ["Supply chain complexity"],
      redFlags: ["High burn rate"],
      mitigatingFactors: ["Strong investor base"],
    },
  },
  default: {
    verdictData: {
      verdict: "INVEST",
      confidence: 74,
      executiveSummary:
        "Strong fundamentals with solid growth trajectory, competitive moat, and manageable risk profile. The company demonstrates market leadership potential with improving unit economics.",
      keyBullCase: [
        "Strong revenue growth trajectory",
        "Differentiated product offering",
        "Expanding addressable market",
        "Experienced leadership team",
      ],
      keyBearCase: [
        "Competitive pressure intensifying",
        "Regulatory headwinds possible",
        "Valuation at premium to peers",
        "Execution risk on expansion plans",
      ],
      investmentThesis:
        "Well-positioned growth company with defensible market position. Risk-reward favors accumulation at current levels for medium-term investors.",
      timeHorizon: "Medium-term (1-3yr)",
      comparableCompanies: ["Industry peer A", "Industry peer B"],
      finalNote: "Conduct additional due diligence on latest financials before final allocation decision.",
    },
    financialData: {
      financialScore: 72,
      growthScore: 76,
      moatScore: 68,
      valuationScore: 65,
      financialSummary: "Solid financial health with above-average growth metrics.",
      growthDrivers: ["Market expansion", "Product innovation"],
      concerns: ["Margin pressure"],
      comparativeAdvantage: "Technology-driven efficiency",
    },
    sentimentData: {
      sentimentScore: 71,
      sentimentLabel: "Positive",
      keyNarratives: ["Innovation leader", "Strong funding"],
      positiveSignals: ["Positive media coverage", "Partnership announcements"],
      negativeSignals: ["Competitive threats"],
      mediaPresence: "Medium",
      investorSentiment: "Bullish",
    },
    riskData: {
      riskScore: 42,
      overallRiskLevel: "Medium",
      marketRisks: ["Macroeconomic sensitivity"],
      competitiveRisks: ["New entrants"],
      regulatoryRisks: ["Compliance requirements"],
      operationalRisks: ["Scaling challenges"],
      redFlags: [],
      mitigatingFactors: ["Diversified revenue streams"],
    },
  },
};

export function generateDemoResult(company: string): ResearchResult {
  const template = DEMO_TEMPLATES[company] || DEMO_TEMPLATES.default;
  const resolvedCompany = company.trim();

  return {
    company: resolvedCompany,
    resolvedCompany,
    resolutionStatus: "RESOLVED",
    researchData: {
      companyOverview: `${resolvedCompany} is a technology-focused company operating in a high-growth market segment with strong investor interest.`,
      businessModel: `${resolvedCompany} generates revenue through platform fees, subscriptions, and enterprise partnerships.`,
      recentNews: [
        `${resolvedCompany} announces strategic expansion`,
        "Recent funding highlights investor confidence",
        "New product launch drives user growth",
        "Partnership with major industry player",
        "Leadership team strengthened with key hires",
      ],
      keyMetrics: {
        revenue: "Growing YoY",
        growth: "Strong trajectory",
        valuation: "Recently funded",
        funding: "Series B+",
        profitability: "On path to profitability",
      },
      competitors: ["Competitor A", "Competitor B", "Competitor C"],
      marketPosition: `${resolvedCompany} is establishing itself as an innovative leader in its category.`,
      sources: [
        "https://techcrunch.com",
        "https://economictimes.indiatimes.com",
        "https://www.livemint.com",
      ],
    },
    sentimentData: template.sentimentData!,
    financialData: template.financialData!,
    riskData: template.riskData!,
    verdictData: template.verdictData!,
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
}

export const DEMO_PROGRESS_STEPS = [
  { node: "companyResolver", message: "Resolving company identity..." },
  { node: "webResearcher", message: "Searching web for company data..." },
  { node: "sentimentAnalyst", message: "Analyzing news sentiment..." },
  { node: "financialAnalyst", message: "Running financial analysis..." },
  { node: "riskAssessor", message: "Assessing investment risks..." },
  { node: "verdictWriter", message: "Writing final investment verdict..." },
];
