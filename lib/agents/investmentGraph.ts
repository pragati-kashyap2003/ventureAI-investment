import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
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

// Define the state annotation for LangGraph
const AgentStateAnnotation = Annotation.Root({
  company: Annotation<string>(),
  researchData: Annotation<Record<string, unknown>>(),
  sentimentData: Annotation<Record<string, unknown>>(),
  financialData: Annotation<Record<string, unknown>>(),
  riskData: Annotation<Record<string, unknown>>(),
  verdictData: Annotation<Record<string, unknown>>(),
  onProgress: Annotation<((update: ProgressUpdate) => void) | undefined>(),
});

export type AgentState = typeof AgentStateAnnotation.State;

// Build the LangGraph state machine
function buildInvestmentGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode("webResearcher", webResearcherNode)
    .addNode("sentimentAnalyst", sentimentAnalystNode)
    .addNode("financialAnalyst", financialAnalystNode)
    .addNode("riskAssessor", riskAssessorNode)
    .addNode("verdictWriter", verdictWriterNode)
    // Sequential pipeline: research → sentiment → financial → risk → verdict
    .addEdge(START, "webResearcher")
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
  const initialState: AgentState = {
    company,
    researchData: {},
    sentimentData: {},
    financialData: {},
    riskData: {},
    verdictData: {},
    onProgress,
  };

  const finalState = await investmentGraph.invoke(initialState);
  return finalState;
}
