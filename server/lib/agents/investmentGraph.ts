import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
import { companyResolverNode } from "./nodes/companyResolver";
import { webResearcherNode } from "./nodes/webResearcher";
import { sentimentAnalystNode } from "./nodes/sentimentAnalyst";
import { financialAnalystNode } from "./nodes/financialAnalyst";
import { riskAssessorNode } from "./nodes/riskAssessor";
import { verdictWriterNode } from "./nodes/verdictWriter";

export interface ProgressUpdate {
  node: string;
  status: "active" | "done" | "error";
  message: string;
}

// Structured state for the research workflow.
// This keeps the current graph behavior intact while introducing a nested report model.
const AgentStateAnnotation = Annotation.Root({
  // Raw user input before resolution.
  companyInput: Annotation<string>(),
  // Resolved entity name once ambiguity has been handled.
  resolvedCompany: Annotation<string>(),
  // Candidate companies returned by the resolver when the input is ambiguous.
  companyCandidates: Annotation<unknown[]>(),
  // Resolution outcome from the resolver: RESOLVED, AMBIGUOUS, NOT_FOUND, or FAILED.
  resolutionStatus: Annotation<string>(),

  // Structured company profile section.
  company: Annotation<Record<string, unknown>>(),
  // Structured financial section.
  financial: Annotation<Record<string, unknown>>(),
  // Structured market section.
  market: Annotation<Record<string, unknown>>(),
  // Structured competitor section.
  competitors: Annotation<Record<string, unknown>>(),
  // Structured news section.
  news: Annotation<Record<string, unknown>>(),
  // Structured SWOT section.
  swot: Annotation<Record<string, unknown>>(),
  // Structured scoring section.
  scores: Annotation<Record<string, unknown>>(),
  // Structured investment thesis section.
  thesis: Annotation<Record<string, unknown>>(),
  // Structured final report section.
  report: Annotation<Record<string, unknown>>(),
  // Aggregated research sources.
  sources: Annotation<string[]>(),
  // Progress events emitted during execution.
  progress: Annotation<ProgressUpdate[]>(),

  // Legacy compatibility fields used by the existing nodes and API contract.
  researchData: Annotation<Record<string, unknown>>(),
  sentimentData: Annotation<Record<string, unknown>>(),
  financialData: Annotation<Record<string, unknown>>(),
  riskData: Annotation<Record<string, unknown>>(),
  verdictData: Annotation<Record<string, unknown>>(),
  onProgress: Annotation<((update: ProgressUpdate) => void) | undefined>(),
});

export type AgentState = typeof AgentStateAnnotation.State;

export function createStructuredStateUpdate(
  state: AgentState,
  update: Partial<AgentState> = {}
): Partial<AgentState> {
  const companyName = state.resolvedCompany || state.companyInput || "Unknown";
  const nextState: Partial<AgentState> = {};

  if (state.company) {
    nextState.company = { ...(state.company as Record<string, unknown>) };
  }
  if (state.financial) {
    nextState.financial = { ...(state.financial as Record<string, unknown>) };
  }
  if (state.market) {
    nextState.market = { ...(state.market as Record<string, unknown>) };
  }
  if (state.competitors) {
    nextState.competitors = { ...(state.competitors as Record<string, unknown>) };
  }
  if (state.news) {
    nextState.news = { ...(state.news as Record<string, unknown>) };
  }
  if (state.swot) {
    nextState.swot = { ...(state.swot as Record<string, unknown>) };
  }
  if (state.scores) {
    nextState.scores = { ...(state.scores as Record<string, unknown>) };
  }
  if (state.thesis) {
    nextState.thesis = { ...(state.thesis as Record<string, unknown>) };
  }
  if (state.report) {
    nextState.report = { ...(state.report as Record<string, unknown>) };
  }
  if (state.sources) {
    nextState.sources = [...state.sources];
  }

  if (update.researchData !== undefined) {
    const researchData = update.researchData as Record<string, unknown>;
    nextState.company = {
      ...(nextState.company || {}),
      name: companyName,
      input: state.companyInput || companyName,
      resolvedName: state.resolvedCompany || state.companyInput || companyName,
      ...(researchData as Record<string, unknown>),
    };
    nextState.competitors = {
      competitors: ((researchData.competitors as string[]) || []).slice(),
      marketPosition: (researchData.marketPosition as string) || "",
    };
    nextState.news = {
      articles: ((researchData.recentNews as string[]) || []).slice(),
    };
    nextState.report = {
      ...(nextState.report || {}),
      companyName,
      sources: Array.isArray(researchData.sources) ? researchData.sources : [],
    };
    nextState.sources = Array.isArray(researchData.sources) ? researchData.sources : [];
    nextState.researchData = researchData;
  }

  if (update.financialData !== undefined) {
    const financialData = update.financialData as Record<string, unknown>;
    nextState.financial = {
      ...(nextState.financial || {}),
      ...financialData,
    };
    nextState.scores = {
      ...(nextState.scores || {}),
      financialScore: (financialData.financialScore as number) || 0,
    };
    nextState.researchData = update.researchData ?? nextState.researchData;
    nextState.financialData = financialData;
  }

  if (update.sentimentData !== undefined) {
    const sentimentData = update.sentimentData as Record<string, unknown>;
    nextState.market = {
      ...(nextState.market || {}),
      ...sentimentData,
    };
    nextState.scores = {
      ...(nextState.scores || {}),
      sentimentScore: (sentimentData.sentimentScore as number) || 0,
    };
    nextState.sentimentData = sentimentData;
  }

  if (update.riskData !== undefined) {
    const riskData = update.riskData as Record<string, unknown>;
    nextState.scores = {
      ...(nextState.scores || {}),
      riskScore: (riskData.riskScore as number) || 0,
    };
    nextState.riskData = riskData;
  }

  if (update.verdictData !== undefined) {
    const verdictData = update.verdictData as Record<string, unknown>;
    nextState.thesis = {
      ...(nextState.thesis || {}),
      ...verdictData,
    };
    nextState.report = {
      ...(nextState.report || {}),
      recommendation: (verdictData.verdict as string) || "PASS",
    };
    nextState.verdictData = verdictData;
  }

  if (update.resolvedCompany !== undefined) {
    nextState.resolvedCompany = update.resolvedCompany;
  }
  if (update.companyCandidates !== undefined) {
    nextState.companyCandidates = update.companyCandidates;
  }
  if (update.resolutionStatus !== undefined) {
    nextState.resolutionStatus = update.resolutionStatus;
  }

  return nextState;
}

function shouldContinueAfterResolver(state: AgentState) {
  if (state.resolutionStatus === "AMBIGUOUS") {
    return END;
  }
  return "webResearcher";
}

// Sequential pipeline so each analyst receives prior agent outputs.
function buildInvestmentGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode("companyResolver", companyResolverNode)
    .addNode("webResearcher", webResearcherNode)
    .addNode("sentimentAnalyst", sentimentAnalystNode)
    .addNode("financialAnalyst", financialAnalystNode)
    .addNode("riskAssessor", riskAssessorNode)
    .addNode("verdictWriter", verdictWriterNode)
    .addEdge(START, "companyResolver")
    .addConditionalEdges("companyResolver", shouldContinueAfterResolver)
    .addEdge("webResearcher", "sentimentAnalyst")
    .addEdge("sentimentAnalyst", "financialAnalyst")
    .addEdge("financialAnalyst", "riskAssessor")
    .addEdge("riskAssessor", "verdictWriter")
    .addEdge("verdictWriter", END);

  return graph.compile();
}

export const investmentGraph = buildInvestmentGraph();

export async function runInvestmentResearch(
  company: string,
  onProgress?: (update: ProgressUpdate) => void
) {
  const progress: ProgressUpdate[] = [];
  const progressHandler = (update: ProgressUpdate) => {
    progress.push(update);
    onProgress?.(update);
  };

  const initialState: AgentState = {
    companyInput: company,
    resolvedCompany: company,
    companyCandidates: [],
    resolutionStatus: "PENDING",
    company: { name: company, input: company, resolvedName: company },
    financial: {},
    market: {},
    competitors: {},
    news: {},
    swot: {},
    scores: {},
    thesis: {},
    report: {},
    sources: [],
    progress,
    researchData: {},
    sentimentData: {},
    financialData: {},
    riskData: {},
    verdictData: {},
    onProgress: progressHandler,
  };

  const finalState = await investmentGraph.invoke(initialState);
  return {
    ...finalState,
    progress,
    researchData: finalState.researchData || {},
    sentimentData: finalState.sentimentData || {},
    financialData: finalState.financialData || {},
    riskData: finalState.riskData || {},
    verdictData: finalState.verdictData || {},
  };
}
