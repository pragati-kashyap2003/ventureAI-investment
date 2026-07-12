import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyCandidate } from "@/lib/types/research";

interface CompanyDisambiguationProps {
  company: string;
  candidates: CompanyCandidate[];
  onSelect: (name: string) => void;
  onCancel: () => void;
}

export function CompanyDisambiguation({
  company,
  candidates,
  onSelect,
  onCancel,
}: CompanyDisambiguationProps) {
  return (
    <Card className="border-primary/30 bg-[var(--primary-tint)]">
      <CardHeader>
        <CardTitle className="text-base">Multiple companies found</CardTitle>
        <CardDescription>
          &quot;{company}&quot; matches several companies. Select the one you want to research.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No candidates returned. Try a more specific company name.
          </p>
        ) : (
          candidates.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelect(c.name)}
              className="w-full text-left p-4 rounded-[10px] border border-border bg-card hover:border-primary/40 hover:bg-secondary/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.oneLineDescription}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                    {c.industry && <span>{c.industry}</span>}
                    {c.headquarters && <span>· {c.headquarters}</span>}
                    {c.confidence > 0 && <span>· {c.confidence}% match</span>}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
        <Button variant="ghost" onClick={onCancel} className="mt-2">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
