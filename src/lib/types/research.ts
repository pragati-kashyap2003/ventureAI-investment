export interface CompanyCandidate {
  name: string;
  industry: string;
  headquarters: string;
  website: string;
  oneLineDescription: string;
  confidence: number;
}

export type ResolutionStatus = "RESOLVED" | "AMBIGUOUS" | "NOT_FOUND" | "FAILED" | "PENDING";

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

export interface ProgressEvent {
  type: "progress";
  node: string;
  status: "active" | "done" | "error";
  message: string;
}

export interface StartEvent {
  type: "start";
  company: string;
  demo?: boolean;
}

export interface CompleteEvent {
  type: "complete";
  result: ResearchResult;
}

export interface AmbiguousEvent {
  type: "ambiguous";
  company: string;
  candidates: CompanyCandidate[];
  explanation?: string;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type StreamEvent =
  | StartEvent
  | ProgressEvent
  | CompleteEvent
  | AmbiguousEvent
  | ErrorEvent;
