import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Radar,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadarHeroVisual } from "./radar-hero";
import { ScrollRunnerSection } from "./scroll-runner";
import {
  RevealSection,
  GlowCard,
  SectionHeader,
  staggerContainer,
  fadeUpItem,
} from "./scroll-section";

const FEATURES = [
  {
    icon: Brain,
    title: "5-Agent LangGraph Pipeline",
    description: "Specialized AI agents research, analyze sentiment, assess finances, evaluate risk, and deliver a CIO-level verdict.",
    accent: "violet" as const,
    span: "lg:col-span-2",
  },
  {
    icon: Radar,
    title: "Investment Score Matrix",
    description: "Growth, moat, valuation, sentiment, and risk scored 0–100 with interactive radar charts.",
    accent: "primary" as const,
    span: "",
  },
  {
    icon: Zap,
    title: "Real-Time SSE Streaming",
    description: "Watch each agent complete live with real-time progress tracking.",
    accent: "invest" as const,
    span: "",
  },
  {
    icon: Shield,
    title: "Source-Cited Evidence",
    description: "Every claim backed by live web research. Full audit trail for due diligence.",
    accent: "pass" as const,
    span: "lg:col-span-2",
  },
];

const SAMPLE_SCORES = [
  { company: "Reliance Industries", verdict: "INVEST", score: 88, growth: 82, moat: 91, risk: 76 },
  { company: "Zepto", verdict: "PASS", score: 62, growth: 78, moat: 45, risk: 38 },
  { company: "Razorpay", verdict: "INVEST", score: 79, growth: 74, moat: 83, risk: 71 },
];

const STEPS = [
  { step: "01", title: "Enter company", desc: "Type any company name or pick from popular suggestions", icon: "◈" },
  { step: "02", title: "AI agents research", desc: "5 specialized agents analyze live web data in sequence", icon: "◎" },
  { step: "03", title: "Get verdict", desc: "Receive INVEST/PASS with scores, radar chart, and PDF report", icon: "✦" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-primary text-xl">◈</span>
            VentureScope
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#journey" className="hover:text-foreground transition-colors">Journey</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#preview" className="hover:text-foreground transition-colors">Preview</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button size="sm" asChild>
              <Link to="/dashboard">
                Launch Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-hero" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-orb" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-invest/10 rounded-full blur-3xl animate-orb-delayed" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
              Invest smarter with{" "}
              <span className="text-gradient">multi-agent AI</span>{" "}
              intelligence
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              VentureScope analyzes any company in real time using a LangGraph pipeline of 5 specialized agents.
              Get a decisive INVEST or PASS verdict with quantified scores, radar analytics, and source-cited evidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="shadow-[0_8px_32px_rgba(79,70,229,0.35)]">
                <Link to="/dashboard">
                  Start Research
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <a href="#journey">See the journey</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center"
            style={{ perspective: 1200 }}
          >
            <RadarHeroVisual />
          </motion.div>
        </div>
      </section>

      {/* Runner strip — fully autonomous */}
      <div id="journey">
        <ScrollRunnerSection />
      </div>

      {/* Features — bento grid */}
      <RevealSection id="features" className="relative py-24 px-6">
        <div className="absolute inset-0 -z-10 section-mesh-features" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <SectionHeader
              badge="Multi-agent analytics"
              title="Research any company with AI"
              subtitle="Every dimension quantified, every claim backed by live web sources."
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <GlowCard key={f.title} accent={f.accent} delay={i * 0.08} className={f.span}>
                  <div className="p-7 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-5 ring-1 ring-primary/10">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.description}</p>
                  </div>
                </GlowCard>
              ))}
            </div>
          </motion.div>
        </div>
      </RevealSection>

      {/* Preview */}
      <RevealSection id="preview" className="relative py-24 px-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <SectionHeader
              badge="Live preview"
              title="Analytics in action"
              subtitle="See how VentureScope scores companies across every dimension"
            />

            <motion.div variants={fadeUpItem} className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-violet-500/20 to-invest/30 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative rounded-3xl border border-white/50 bg-white/60 backdrop-blur-2xl overflow-hidden shadow-[0_20px_80px_rgba(79,70,229,0.12)]">
                <div className="bg-gradient-to-r from-primary/8 via-violet-500/5 to-invest/8 border-b border-white/40 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Investment Score Matrix</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/60">Sample Data</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-secondary/30">
                        {["Company", "Verdict", "Score", "Growth", "Moat", "Risk Adj."].map((h) => (
                          <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_SCORES.map((row, i) => (
                        <motion.tr
                          key={row.company}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="border-b border-border/30 hover:bg-primary/[0.03] transition-colors"
                        >
                          <td className="p-4 font-medium">{row.company}</td>
                          <td className="p-4">
                            <Badge variant={row.verdict === "INVEST" ? "invest" : "pass"}>{row.verdict}</Badge>
                          </td>
                          <td className="p-4 tabular font-bold text-primary">{row.score}</td>
                          <td className="p-4 tabular text-muted-foreground">{row.growth}</td>
                          <td className="p-4 tabular text-muted-foreground">{row.moat}</td>
                          <td className="p-4 tabular text-muted-foreground">{row.risk}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUpItem} className="text-center mt-12">
              <Button size="lg" asChild className="shadow-[0_8px_32px_rgba(79,70,229,0.25)]">
                <Link to="/dashboard">
                  Run your own analysis
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </RevealSection>

      {/* How it works — timeline */}
      <RevealSection id="how-it-works" className="relative py-24 px-6">
        <div className="absolute inset-0 -z-10 section-mesh-steps" />
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <SectionHeader badge="3 steps" title="How it works" />

            <div className="relative grid md:grid-cols-3 gap-6">
              <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              {STEPS.map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={fadeUpItem}
                  whileHover={{ y: -8 }}
                  className="relative text-center group"
                >
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10 border border-primary/15 flex items-center justify-center mb-5 text-2xl shadow-[0_8px_32px_rgba(79,70,229,0.1)] group-hover:shadow-[0_16px_48px_rgba(79,70,229,0.2)] transition-shadow duration-500">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-primary/40 tabular mb-2">{item.step}</div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-3 top-16 w-5 h-5 text-primary/25" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </RevealSection>

      {/* CTA */}
      <RevealSection className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-primary via-violet-500 to-invest opacity-20 blur-2xl group-hover:opacity-35 transition-opacity duration-700" />
            <div className="relative rounded-[1.75rem] border border-white/40 bg-gradient-to-br from-white/90 via-primary/[0.04] to-invest/[0.04] backdrop-blur-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <div className="p-10 md:p-16 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                  Ready to research your{" "}
                  <span className="text-gradient">next investment?</span>
                </h2>
                <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
                  Run AI-powered due diligence on any company in minutes.
                </p>
                <Button size="lg" asChild className="h-13 px-8 text-base shadow-[0_12px_40px_rgba(79,70,229,0.4)]">
                  <Link to="/dashboard">
                    Open Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm">
                  {["Real-time streaming", "PDF export", "Session history", "Source citations"].map((t) => (
                    <span key={t} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-invest" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
              <div className="absolute -left-20 -top-20 w-60 h-60 bg-invest/10 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </RevealSection>
    </div>
  );
}
