import { NextRequest } from "next/server";
import { runInvestmentResearch } from "@/lib/agents/investmentGraph";

export const maxDuration = 120; // 2 minutes for Vercel
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { company } = await req.json();

  if (!company || typeof company !== "string") {
    return new Response(JSON.stringify({ error: "Company name required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send({ type: "start", company });

        const finalState = await runInvestmentResearch(
          company.trim(),
          (update) => {
            send({ type: "progress", ...update });
          }
        );

        const result = {
          company,
          researchData: finalState.researchData,
          sentimentData: finalState.sentimentData,
          financialData: finalState.financialData,
          riskData: finalState.riskData,
          verdictData: finalState.verdictData,
          timestamp: new Date().toISOString(),
        };

        send({ type: "complete", result });
      } catch (error) {
        console.error("Research error:", error);
        send({
          type: "error",
          message:
            error instanceof Error ? error.message : "Research failed. Please try again.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
