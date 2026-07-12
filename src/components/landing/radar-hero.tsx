import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const DEMO_DATA = [
  { dimension: "Growth", score: 82, fullMark: 100 },
  { dimension: "Moat", score: 76, fullMark: 100 },
  { dimension: "Value", score: 68, fullMark: 100 },
  { dimension: "Sentiment", score: 74, fullMark: 100 },
  { dimension: "Risk", score: 71, fullMark: 100 },
];

export function RadarHeroVisual() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Animated radar rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-primary/20"
            style={{ width: `${ring * 120}px`, height: `${ring * 120}px` }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, delay: ring * 0.4, repeat: Infinity }}
          />
        ))}
        <motion.div
          className="absolute w-[280px] h-[280px] origin-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0deg, rgba(79,70,229,0.15) 30deg, transparent 60deg)",
            }}
          />
        </motion.div>
      </div>

      <Card className="relative z-10 p-6 glass shadow-[var(--shadow-lg)] animate-float">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Live Analysis</p>
            <p className="font-bold text-lg">Reliance Industries</p>
          </div>
          <Badge variant="invest">INVEST · 88%</Badge>
        </div>

        <div className="h-[260px] radar-glow">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={DEMO_DATA} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: "Composite", value: "82" },
            { label: "Confidence", value: "88%" },
            { label: "Horizon", value: "Long" },
          ].map((m) => (
            <div key={m.label} className="text-center p-2 rounded-lg bg-secondary/80">
              <div className="text-lg font-bold tabular text-primary">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Floating stat pills */}
      <motion.div
        className="absolute -left-4 top-1/4 glass rounded-xl px-3 py-2 shadow-[var(--shadow-md)] text-sm"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-invest font-semibold tabular">+24%</span>
        <span className="text-muted-foreground ml-1.5">Growth</span>
      </motion.div>
      <motion.div
        className="absolute -right-2 bottom-1/4 glass rounded-xl px-3 py-2 shadow-[var(--shadow-md)] text-sm"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      >
        <span className="text-primary font-semibold">5 Agents</span>
        <span className="text-muted-foreground ml-1.5">Active</span>
      </motion.div>
    </div>
  );
}
