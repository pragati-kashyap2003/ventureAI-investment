export type ResolutionStatus = "RESOLVED" | "AMBIGUOUS" | "NOT_FOUND" | "FAILED" | "PENDING";

export interface CompanyCandidate {
  name: string;
  industry: string;
  headquarters: string;
  website: string;
  oneLineDescription: string;
  confidence: number;
}

export interface ResearchResult {
  company: string;
  resolvedCompany?: string;
  resolutionStatus?: ResolutionStatus;
  companyCandidates?: CompanyCandidate[];
  researchData: Record<string, unknown>;
  sentimentData: Record<string, unknown>;
  financialData: Record<string, unknown>;
  riskData: Record<string, unknown>;
  verdictData: Record<string, unknown>;
  timestamp: string;
  isDemo?: boolean;
}
