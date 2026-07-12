import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, scoreBg, scoreLabel } from "@/lib/utils";
import type { ScoreRow } from "@/lib/types/dashboard";

interface MatrixRow extends ScoreRow {
  id: string;
  level: string;
  weight: string;
  impact: string;
}

function buildMatrixRows(scores: ScoreRow[]): MatrixRow[] {
  const weights: Record<string, string> = {
    Growth: "25%",
    Moat: "20%",
    Valuation: "20%",
    Sentiment: "15%",
    Risk: "20%",
  };

  return scores.map((s) => ({
    ...s,
    id: s.label,
    level: scoreLabel(s.value),
    weight: weights[s.label] ?? "—",
    impact: s.value >= 65 ? "Positive" : s.value >= 40 ? "Neutral" : "Negative",
  }));
}

const columns: ColumnDef<MatrixRow>[] = [
  {
    accessorKey: "label",
    header: "Dimension",
    cell: ({ row }) => <span className="font-medium">{row.getValue("label")}</span>,
  },
  {
    accessorKey: "value",
    header: "Score",
    cell: ({ row }) => {
      const val = row.getValue("value") as number;
      return (
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]">
            <div
              className={cn("h-full rounded-full", scoreBg(val))}
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="tabular font-semibold w-8">{Math.round(val)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "level",
    header: "Rating",
    cell: ({ row }) => {
      const val = row.original.value;
      return (
        <Badge
          variant={val >= 65 ? "invest" : val >= 40 ? "amber" : "pass"}
        >
          {row.getValue("level")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "weight",
    header: "Weight",
    cell: ({ row }) => <span className="tabular text-muted-foreground">{row.getValue("weight")}</span>,
  },
  {
    accessorKey: "impact",
    header: "Impact",
    cell: ({ row }) => {
      const impact = row.getValue("impact") as string;
      return (
        <span
          className={cn(
            "text-sm font-medium",
            impact === "Positive" && "text-invest",
            impact === "Neutral" && "text-amber",
            impact === "Negative" && "text-pass"
          )}
        >
          {impact}
        </span>
      );
    },
  },
];

export function ScoreMatrixTable({ scores }: { scores: ScoreRow[] }) {
  const data = buildMatrixRows(scores);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-[10px] border border-border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
