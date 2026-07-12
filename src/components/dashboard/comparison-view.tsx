import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compositeScore, extractScores } from "@/lib/types/dashboard";
import type { ResearchResult } from "@/lib/types/research";

interface ComparisonViewProps {
  results: ResearchResult[];
}

export function ComparisonView({ results }: ComparisonViewProps) {
  if (results.length < 2) return null;

  const dimensions = ["Growth", "Moat", "Valuation", "Sentiment", "Risk"];

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-base">Side-by-Side Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/40">
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Metric
                </th>
                {results.map((r) => (
                  <th
                    key={r.company}
                    className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {r.company}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="p-3 font-medium">Verdict</td>
                {results.map((r) => (
                  <td key={r.company} className="p-3">
                    <Badge
                      variant={
                        r.verdictData?.verdict === "INVEST" ? "invest" : "pass"
                      }
                    >
                      {r.verdictData?.verdict as string}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/60">
                <td className="p-3 font-medium">Confidence</td>
                {results.map((r) => (
                  <td key={r.company} className="p-3 tabular">
                    {(r.verdictData?.confidence as number) || 0}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/60">
                <td className="p-3 font-medium">Composite Score</td>
                {results.map((r) => (
                  <td key={r.company} className="p-3 tabular font-semibold">
                    {compositeScore(extractScores(r as unknown as Record<string, unknown>))}
                  </td>
                ))}
              </tr>
              {dimensions.map((dim) => (
                <tr key={dim} className="border-b border-border/60">
                  <td className="p-3 text-muted-foreground">{dim}</td>
                  {results.map((r) => {
                    const scores = extractScores(r as unknown as Record<string, unknown>);
                    const score = scores.find((s) => s.label === dim);
                    return (
                      <td key={r.company} className="p-3 tabular">
                        {Math.round(score?.value ?? 0)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
