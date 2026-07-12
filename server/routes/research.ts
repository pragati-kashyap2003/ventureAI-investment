import { Router, type Request, type Response } from "express";
import { runInvestmentResearch } from "../lib/agents/investmentGraph";
import { isDemoMode } from "../lib/config";
import { DEMO_PROGRESS_STEPS, generateDemoResult } from "../lib/demo-data";
import type { CompanyCandidate } from "../lib/types/research";

export const researchRouter = Router();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runDemoResearch(company: string, res: Response) {
  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send({ type: "start", company, demo: true });

  for (const step of DEMO_PROGRESS_STEPS) {
    send({ type: "progress", node: step.node, status: "active", message: step.message });
    await sleep(600 + Math.random() * 400);
    send({
      type: "progress",
      node: step.node,
      status: "done",
      message: `Completed: ${step.message}`,
    });
  }

  send({ type: "complete", result: generateDemoResult(company) });
}

researchRouter.post("/", async (req: Request, res: Response) => {
  const { company } = req.body ?? {};

  if (!company || typeof company !== "string" || !company.trim()) {
    res.status(400).json({ error: "Company name required" });
    return;
  }

  const trimmed = company.trim();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    if (isDemoMode()) {
      await runDemoResearch(trimmed, res);
      res.end();
      return;
    }

    send({ type: "start", company: trimmed });

    const finalState = await runInvestmentResearch(trimmed, (update) => {
      send({ type: "progress", ...update });
    });

    if (finalState.resolutionStatus === "AMBIGUOUS") {
      send({
        type: "ambiguous",
        company: trimmed,
        candidates: (finalState.companyCandidates || []) as CompanyCandidate[],
        explanation: "Multiple companies match your search. Please select one.",
      });
      res.end();
      return;
    }

    send({
      type: "complete",
      result: {
        company: trimmed,
        resolvedCompany: finalState.resolvedCompany || trimmed,
        resolutionStatus: finalState.resolutionStatus || "RESOLVED",
        researchData: finalState.researchData || {},
        sentimentData: finalState.sentimentData || {},
        financialData: finalState.financialData || {},
        riskData: finalState.riskData || {},
        verdictData: finalState.verdictData || {},
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Research error:", error);
    send({
      type: "error",
      message: error instanceof Error ? error.message : "Research failed. Please try again.",
    });
  } finally {
    res.end();
  }
});
