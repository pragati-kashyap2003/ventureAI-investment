import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function RevealSection({ children, className = "", id }: RevealSectionProps) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "end 0.08"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [64, 0, 0, -32]);
  const scale = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0.94, 1, 1, 0.97]);
  const blur = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [6, 0, 0, 2]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, y, scale, filter }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 36, rotateX: 12, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

type GlowCardProps = {
  children: ReactNode;
  className?: string;
  accent?: "primary" | "invest" | "pass" | "violet";
  delay?: number;
};

const ACCENT_MAP = {
  primary: "from-primary/50 via-violet-500/30 to-primary/10",
  invest: "from-invest/50 via-emerald-400/30 to-primary/10",
  pass: "from-pass/40 via-orange-400/20 to-primary/10",
  violet: "from-violet-500/50 via-primary/30 to-invest/10",
};

export function GlowCard({ children, className = "", accent = "primary", delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`group relative ${className}`}
      style={{ perspective: 1000 }}
    >
      <div
        className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${ACCENT_MAP[accent]} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
      />
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/80 via-white/40 to-transparent opacity-60" />
      <div className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(79,70,229,0.06)] group-hover:shadow-[0_12px_48px_rgba(79,70,229,0.14)] transition-shadow duration-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay, duration: 0.5 }}
          className="relative"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}

type SectionHeaderProps = {
  badge?: string;
  title: string;
  subtitle?: string;
};

export function SectionHeader({ badge, title, subtitle }: SectionHeaderProps) {
  return (
    <motion.div
      variants={fadeUpItem}
      className="text-center mb-14 relative"
    >
      {badge && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/8 text-primary border border-primary/15 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-muted-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

/** @deprecated use RevealSection */
export function ScrollSection({ children, className = "", id }: RevealSectionProps) {
  return (
    <RevealSection id={id} className={className}>
      {children}
    </RevealSection>
  );
}
