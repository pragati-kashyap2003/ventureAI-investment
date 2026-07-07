# VentureScope AI — Investment Research Agent

> **InsideIIM × Altuni AI Labs — Take-Home Assignment**
> Built by: [Your Name] | AI Product Development Engineer (Intern) Submission

---

## Overview

**VentureScope AI** is a full-stack AI Investment Research Agent that takes a company name, performs deep real-time research using a multi-agent LangGraph pipeline, and delivers a decisive **INVEST** or **PASS** verdict with quantified reasoning.

**Live Demo:** _[Deploy to Vercel and add URL]_

---

## How to Run

### 1. Clone & Install
```bash
git clone <repo-url>
cd ai-investment-agent
npm install
```

### 2. Set Up API Keys
Copy `.env.local.example` to `.env.local` and fill in your keys:
```bash
cp .env.local.example .env.local
```

Required keys:
- `GOOGLE_GENERATIVE_AI_API_KEY` — Get free at [aistudio.google.com](https://aistudio.google.com)
- `TAVILY_API_KEY` — Get free at [tavily.com](https://tavily.com) (1000 searches/month free)

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — search any company name and watch the AI work in real-time.

---

## How It Works — Architecture

### Multi-Agent LangGraph Pipeline

```
User Input (Company Name)
         │
         ▼
Next.js API Route (/api/research) — SSE Stream
         │
         ▼
┌─────────────────────────────────────────────────┐
│            LangGraph State Machine               │
│                                                  │
│  ┌──────────────┐                               │
│  │ webResearcher │ ← Tavily Search (3 queries)  │
│  └──────┬───────┘                               │
│         │                                        │
│  ┌──────▼──────────┐                            │
│  │ sentimentAnalyst │ ← News sentiment scoring  │
│  └──────┬──────────┘                            │
│         │                                        │
│  ┌──────▼──────────┐                            │
│  │ financialAnalyst │ ← Growth, moat, valuation │
│  └──────┬──────────┘                            │
│         │                                        │
│  ┌──────▼───────┐                               │
│  │ riskAssessor  │ ← Market, competitive, reg.  │
│  └──────┬───────┘                               │
│         │                                        │
│  ┌──────▼───────────┐                           │
│  │  verdictWriter    │ ← CIO-level final verdict │
│  └──────────────────┘                           │
└─────────────────────────────────────────────────┘
         │
         ▼
Results Dashboard (Radar Chart + Scorecard + Evidence)
```

### Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Frontend | Next.js 14 (App Router) | Assignment requirement, production-grade |
| Backend | Next.js API Routes | Co-located with frontend, easy Vercel deploy |
| AI Orchestration | LangGraph.js | Assignment requirement; graph-based agent control flow |
| LLM | Gemini 1.5 Pro (verdict) + Flash (sub-agents) | Pro for quality, Flash for speed/cost in sub-agents |
| Web Search | Tavily Search API | Purpose-built for AI agents, structured results |
| Streaming | Server-Sent Events (SSE) | Native HTTP streaming, no WebSocket overhead |
| State | LangGraph `StateGraph` with `Annotation.Root` | Type-safe state management across nodes |

---

## Flagship Features

### 1. 🧠 LangGraph Multi-Agent Pipeline
5 specialized agents run sequentially using `StateGraph`. Each node receives the accumulated state from all previous agents. The `webResearcher` node runs 3 parallel Tavily queries. The `verdictWriter` (CIO agent) uses Gemini 1.5 Pro for highest-quality reasoning.

### 2. ⚡ Real-Time SSE Streaming
The API route streams `progress` events via Server-Sent Events as each agent completes. The frontend renders a live pipeline visualization showing which agent is active, with typewriter-effect message streaming.

### 3. 📊 Animated Investment Scorecard
Five quantified dimensions (Growth, Moat, Valuation, Sentiment, Risk), each scored 0–100, rendered as:
- An SVG spider/radar chart with glow effects
- Individual circular progress indicators with color coding (green ≥65, amber ≥40, red <40)

### 4. 🎯 INVEST / PASS Verdict with Confidence
Clear verdict with:
- CIO-level executive summary
- Bull case / Bear case point breakdown
- Time horizon recommendation
- Comparable companies
- Final memorable insight

### 5. 🔗 Source-Cited Evidence
Every claim is backed by real web sources fetched by Tavily. Sources are displayed as clickable chips linking to the original articles.

### 6. 📋 Export Report
One-click export of the full research report as a `.txt` file with all sections formatted for sharing.

### 7. 🔄 Comparison Mode
UI toggle to queue multiple companies for sequential analysis. Side-by-side UI comparison planned.

### 8. 🕐 Session History
Analyses are stored in `localStorage` and shown as a recent history panel. Click any item to re-run the analysis.

---

## Example Runs

### Zepto
**Verdict: PASS (62% confidence)**
- High growth, but burn rate and competitive pressure from Blinkit/Swiggy Instamart are red flags
- Regulatory ambiguity around 10-minute delivery model in urban areas

### Reliance Industries
**Verdict: INVEST (88% confidence)**
- Diversified revenue, strong moat across telecom/retail/energy
- Jio Platforms positioning as AI infrastructure play is bullish

### WeWork
**Verdict: PASS (91% confidence)**
- Bankruptcy proceedings, fundamental unit economics issues
- Flexible workspace sector attractive but WeWork execution is a red flag

---

## Key Trade-offs & What I Left Out

### Trade-offs
1. **Gemini Flash for sub-agents**: Using Flash (not Pro) for all sub-agents except the verdict writer speeds up the pipeline significantly. Pro would give richer reasoning but 2-3x slower.
2. **Sequential vs. parallel agents**: Sentiment/Financial could run in parallel, but sequential makes state passing simpler and avoids race conditions in the LangGraph state. With more time, I'd use parallel edges.
3. **SSE over WebSocket**: SSE is simpler to implement and works natively in browsers and Vercel edge functions. WebSocket would allow bidirectional communication (e.g., mid-research course correction) but isn't needed here.

### What I'd Improve with More Time
1. **Parallel agent execution** — Run sentiment + financial simultaneously using LangGraph parallel edges
2. **LangSmith tracing** — Add full observability for agent reasoning chains
3. **Vector DB memory** — Cache company research in Pinecone/Qdrant for follow-up questions
4. **Interactive verdict** — Let users ask follow-up questions about the analysis (RAG on the research output)
5. **Financial API integration** — Connect Alpha Vantage or Yahoo Finance for actual financial data
6. **PDF export** — True PDF with charts using @react-pdf/renderer
7. **Comparison table** — Full side-by-side comparison of multiple companies

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Vanilla CSS |
| Backend | Next.js API Routes (Node.js) |
| AI Orchestration | LangGraph.js 0.2, LangChain.js 0.3 |
| LLM | Google Gemini 1.5 Pro + Flash (via `@langchain/google-genai`) |
| Web Search | Tavily Search API (via `@langchain/community`) |
| Streaming | Server-Sent Events (SSE) |
| Deployment | Vercel |
| Fonts | Inter, Outfit, JetBrains Mono (Google Fonts) |

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Set these env vars in Vercel dashboard:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `TAVILY_API_KEY`

---

## LLM Chat Transcript (Bonus Points)

> _[Include your AI/LLM chat session transcript here as per assignment requirement]_
> I used Claude/Gemini/ChatGPT to help with: [describe specifically]

---

## Project Structure

```
ai-investment-agent/
├── app/
│   ├── api/research/route.ts   # SSE streaming endpoint
│   ├── globals.css             # Design system
│   ├── layout.tsx
│   └── page.tsx                # Main UI + ResultsDashboard
├── lib/
│   ├── agents/
│   │   ├── investmentGraph.ts  # LangGraph StateGraph
│   │   └── nodes/
│   │       ├── webResearcher.ts
│   │       ├── sentimentAnalyst.ts
│   │       ├── financialAnalyst.ts
│   │       ├── riskAssessor.ts
│   │       └── verdictWriter.ts
│   └── prompts/index.ts        # All LLM prompt templates
├── .env.local.example
└── README.md
```
