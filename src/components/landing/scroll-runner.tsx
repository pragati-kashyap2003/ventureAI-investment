import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const HURDLES = [
  { label: "Name", sub: "Enter company", color: "#4f46e5", tint: "rgba(79, 70, 229, 0.14)" },
  { label: "Research", sub: "5 AI agents", color: "#7c3aed", tint: "rgba(124, 58, 237, 0.14)" },
  { label: "INVEST", sub: "Strong thesis", color: "#16a34a", tint: "rgba(22, 163, 74, 0.14)" },
  { label: "PASS", sub: "Skip weak picks", color: "#dc2626", tint: "rgba(220, 38, 38, 0.14)" },
  { label: "Hold", sub: "Track & revisit", color: "#d97706", tint: "rgba(217, 119, 6, 0.14)" },
] as const;

const VIEW_W = 1400;
/** Fixed hurdle positions across the long strip */
const HURDLE_X = [220, 420, 620, 820, 1020];
const LOOP_DURATION = 22;

function GroundSegment({ offset }: { offset: number }) {
  return (
    <g transform={`translate(${offset}, 0)`}>
      <line x1={0} y1={108} x2={VIEW_W} y2={108} stroke="#e5e7eb" strokeWidth={1.5} />
      <rect x={0} y={109} width={VIEW_W} height={40} fill="#f7f8fa" />
      <rect x={0} y={112} width={VIEW_W} height={3} fill="url(#groundDash)" />
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={i}
          x1={30 + i * 76}
          y1={96}
          x2={54 + i * 76}
          y2={96}
          stroke="rgba(79,70,229,0.09)"
          strokeWidth={1}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function RunnerBody() {
  return (
    <g className="runner-running">
      <ellipse cx={0} cy={92} rx={14} ry={4} fill="rgba(79,70,229,0.18)" className="runner-shadow" />
      <rect x={-8} y={48} width={16} height={20} rx={5} fill="#4f46e5" />
      <circle cx={0} cy={38} r={10} fill="#6366f1" />
      <circle cx={3} cy={36} r={2} fill="#fff" />
      <circle cx={3.5} cy={36} r={1} fill="#111827" />
      <g className="runner-arm-back" style={{ transformOrigin: "-11px 54px" }}>
        <rect x={-14} y={52} width={6} height={3} rx={1.5} fill="#4338ca" />
      </g>
      <g className="runner-arm-front" style={{ transformOrigin: "11px 54px" }}>
        <rect x={8} y={52} width={6} height={3} rx={1.5} fill="#4338ca" />
      </g>
      <g className="runner-leg-back" style={{ transformOrigin: "-3px 68px" }}>
        <rect x={-6} y={68} width={5} height={16} rx={2.5} fill="#3730a3" />
      </g>
      <g className="runner-leg-front" style={{ transformOrigin: "4px 68px" }}>
        <rect x={1} y={68} width={5} height={16} rx={2.5} fill="#3730a3" />
      </g>
      <rect x={9} y={56} width={9} height={8} rx={2} fill="#16a34a" />
      <rect x={10} y={54} width={6} height={2.5} rx={1} fill="#15803d" />
    </g>
  );
}

function Hurdle({
  x,
  label,
  sub,
  color,
  tint,
  active,
}: {
  x: number;
  label: string;
  sub: string;
  color: string;
  tint: string;
  active: boolean;
}) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect
        x={-2}
        y={44}
        width={4}
        height={38}
        rx={2}
        fill={color}
        opacity={active ? 1 : 0.85}
      />
      <rect x={-40} y={44} width={80} height={4} rx={2} fill={color} opacity={active ? 1 : 0.85} />
      <rect
        x={-36}
        y={20}
        width={72}
        height={24}
        rx={7}
        fill={tint}
        stroke={color}
        strokeWidth={active ? 2 : 1.2}
      />
      {active && (
        <rect x={-36} y={20} width={72} height={24} rx={7} fill={color} opacity={0.08} />
      )}
      <text
        x={0}
        y={32}
        textAnchor="middle"
        fill={color}
        fontSize={11}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {label}
      </text>
      <text
        x={0}
        y={42}
        textAnchor="middle"
        fill="#6b7280"
        fontSize={8}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {sub}
      </text>
    </g>
  );
}

function ProgressPill({
  label,
  color,
  active,
}: {
  label: string;
  color: string;
  active: boolean;
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1.08 : 1, opacity: active ? 1 : 0.55 }}
      transition={{ duration: 0.35 }}
      className={`px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${
        active ? "border-current shadow-sm" : "border-border/50 bg-background/60"
      }`}
      style={{ color: active ? color : undefined }}
    >
      {label}
    </motion.div>
  );
}

export function ScrollRunnerSection() {
  const [activeHurdle, setActiveHurdle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHurdle((prev) => (prev + 1) % HURDLES.length);
    }, LOOP_DURATION * 1000 / HURDLES.length);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative py-16 px-4 md:px-6 overflow-hidden"
      aria-label="Investment journey animation"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.04] via-transparent to-invest/[0.03]" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">
            Your investment sprint
          </p>
          <h2 className="text-2xl md:text-3xl font-bold">Run the pipeline</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Always on — hurdles stay put, runner never stops
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {HURDLES.map((h, i) => (
            <ProgressPill
              key={h.label}
              label={h.label}
              color={h.color}
              active={activeHurdle === i}
            />
          ))}
        </div>

        <div className="relative rounded-3xl border border-primary/10 bg-gradient-to-br from-white via-secondary/40 to-primary/[0.03] overflow-hidden shadow-[0_8px_40px_rgba(79,70,229,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(79,70,229,0.08),transparent_60%)] pointer-events-none" />

          <svg
            viewBox={`0 0 ${VIEW_W} 150`}
            className="w-full h-[180px] md:h-[220px] block"
            role="img"
            aria-hidden
          >
            <defs>
              <clipPath id="trackClip">
                <rect x={0} y={82} width={VIEW_W} height={68} />
              </clipPath>
              <pattern id="groundDash" width={36} height={3} patternUnits="userSpaceOnUse">
                <rect width={18} height={2} y={0.5} rx={1} fill="rgba(79,70,229,0.35)" />
              </pattern>
              <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(79,70,229,0.05)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            <rect width={VIEW_W} height={150} fill="url(#skyFade)" />

            {/* Ground — always scrolling */}
            <g clipPath="url(#trackClip)">
              <g className="track-scroll-loop-long">
                <GroundSegment offset={0} />
                <GroundSegment offset={VIEW_W} />
              </g>
            </g>

            {/* Hurdles — fixed in place */}
            {HURDLES.map((h, i) => (
              <Hurdle
                key={h.label}
                x={HURDLE_X[i]}
                label={h.label}
                sub={h.sub}
                color={h.color}
                tint={h.tint}
                active={activeHurdle === i}
              />
            ))}

            {/* Finish flag — fixed */}
            <g transform={`translate(${1180}, 0)`}>
              <rect x={-1.5} y={34} width={3} height={58} fill="#4f46e5" />
              <polygon points="1.5,34 42,48 1.5,62" fill="#16a34a" />
              <text x={20} y={88} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="Inter, system-ui, sans-serif">
                Finish
              </text>
            </g>

            {/* Runner — auto-travels + auto-jumps, no scroll */}
            <motion.g
              animate={{ x: [60, 1120] }}
              transition={{ duration: LOOP_DURATION, repeat: Infinity, ease: "linear" }}
            >
              <motion.g
                animate={{
                  y: [
                    0, 0, -38, 0, 0,
                    0, -38, 0, 0,
                    0, -38, 0, 0,
                    0, -38, 0, 0,
                    0, -38, 0, 0,
                    0,
                  ],
                }}
                transition={{
                  duration: LOOP_DURATION,
                  repeat: Infinity,
                  times: [
                    0, 0.07, 0.09, 0.11, 0.14,
                    0.21, 0.23, 0.25, 0.28,
                    0.35, 0.37, 0.39, 0.42,
                    0.49, 0.51, 0.53, 0.56,
                    0.63, 0.65, 0.67, 0.70,
                    1,
                  ],
                  ease: "easeInOut",
                }}
              >
                <RunnerBody />
              </motion.g>
            </motion.g>
          </svg>

          {/* Ambient speed lines */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background/80 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />
        </div>

        <div className="mt-4 h-1.5 rounded-full bg-border/80 overflow-hidden max-w-2xl mx-auto">
          <motion.div
            className="h-full w-full rounded-full bg-gradient-to-r from-primary via-invest to-amber origin-left"
            animate={{ scaleX: [0, 1] }}
            transition={{ duration: LOOP_DURATION, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </section>
  );
}
