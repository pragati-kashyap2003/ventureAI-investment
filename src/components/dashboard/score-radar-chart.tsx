import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ScoreRow } from "@/lib/types/dashboard";

interface ScoreRadarChartProps {
  scores: ScoreRow[];
  isInvest: boolean;
  className?: string;
}

export function ScoreRadarChart({ scores, isInvest, className }: ScoreRadarChartProps) {
  const data = scores.map((s) => ({
    dimension: s.label,
    score: Math.round(s.value),
    fullMark: 100,
  }));

  const strokeColor = isInvest ? "#16a34a" : "#dc2626";
  const fillColor = isInvest ? "#16a34a" : "#dc2626";

  return (
    <div className={cn("h-[280px] w-full radar-glow", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={strokeColor}
            fill={fillColor}
            fillOpacity={0.18}
            strokeWidth={2.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CircularGauge({ value, isInvest }: { value: number; isInvest: boolean }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (value / 100) * circumference;
  const color = isInvest ? "#16a34a" : "#dc2626";

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className="mx-auto">
      <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="64" y="60" textAnchor="middle" fontSize="26" fontWeight="700" fill="#111827" fontFamily="Inter, sans-serif">
        {value}
      </text>
      <text x="64" y="80" textAnchor="middle" fontSize="11" fill="#6b7280" fontFamily="Inter, sans-serif">
        / 100
      </text>
    </svg>
  );
}
