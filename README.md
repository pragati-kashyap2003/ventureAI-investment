# VentureAI – AI Investment Research Agent

An AI-powered investment research platform that helps users evaluate whether to invest in a company by generating structured investment reports using Large Language Models (LLMs).

🌐 **Live Demo:** https://venture-ai-investment.vercel.app/

💻 **GitHub Repository:** https://github.com/pragati-kashyap2003/ventureAI-investment

---

## Application Preview

### Home Page

<img src="docs/screenshots/landing page.png" width="900"/>

### Analysis Dashboard

<img src="docs/screenshots/dashboard.png" width="900"/>

### Generated Investment Report

<img src="docs/screenshots/report.png" width="900"/>
# Overview

VentureAI is a web application that simplifies investment research by generating professional reports for publicly listed companies.

Instead of manually reading financial reports and news articles, users simply enter a company name and receive an AI-generated investment report containing:

- Executive Summary
- Company Snapshot
- Financial Overview
- SWOT Analysis
- Bull Case
- Bear Case
- Risk Assessment
- Final Investment Recommendation
- Source References

The goal of the project is to help users make informed investment decisions through structured AI-generated insights.

---

# Features

- AI-powered company analysis
- Professional investment report generation
- Executive dashboard
- SWOT analysis
- Bull & Bear investment cases
- Risk assessment
- Final Buy / Hold / Sell recommendation
- PDF report generation
- Clean and responsive user interface

---

# Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### AI

- OpenRouter API
- Large Language Models (LLMs)
- Prompt Engineering

### Deployment

- Vercel

---

# How to Run

## 1. Clone the Repository

```bash
git clone https://github.com/pragati-kashyap2003/ventureAI-investment.git

cd ventureAI-investment
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment Variables

Create a file named

```
.env.local
```

Copy the following values:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_model_name
```

Obtain your API key from:

https://openrouter.ai

## 4. Run the Project

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# How It Works

The application follows the workflow below:

1. User enters a company name.
2. The application validates the company.
3. Company-related information is collected.
4. The LLM analyzes the available information.
5. The AI generates:
   - Executive Summary
   - Financial Overview
   - SWOT Analysis
   - Bull Case
   - Bear Case
   - Risk Assessment
6. A final Buy / Hold / Sell recommendation is generated.
7. The report is displayed in the dashboard.
8. Users can export the report as a PDF.

---

# Project Architecture

```
                User

                  │

                  ▼

          Company Search

                  │

                  ▼

        Investment Analysis

       ┌────────┼────────┐

       ▼        ▼        ▼

 Financial   Market    Risk
 Analysis   Analysis  Analysis

       └────────┼────────┘

                ▼

      Investment Report

                ▼

          PDF Generation
```

---

# Design Decisions

### Why OpenRouter?

OpenRouter provides access to multiple Large Language Models through a single API, making it easy to experiment with different models without changing the application's architecture.

### Why Next.js?

Next.js provides a modern React framework with fast development, routing, and deployment capabilities.

### Why Tailwind CSS?

Tailwind CSS enabled rapid development while maintaining a clean and responsive user interface.

### Why PDF Reports?

Investment reports are easier to read, save, and share in PDF format compared to raw AI responses.

---

# Trade-offs

During development, the following trade-offs were made:

- Publicly available information was used instead of paid financial APIs.
- The focus was on generating structured reports rather than advanced financial visualizations.
- Simplicity and readability were prioritized over adding numerous complex features.
- Report generation speed was optimized to provide results within a short duration.

---

# Example Runs

## Apple Inc.

Recommendation

**BUY**

Reasons

- Strong financial performance
- Growing services business
- Healthy cash flow
- Strong brand loyalty

---

## NVIDIA

Recommendation

**BUY**

Reasons

- Leader in AI hardware
- High revenue growth
- Strong demand for GPUs
- Excellent market position

---

## Infosys

Recommendation

**HOLD**

Reasons

- Stable enterprise business
- Consistent revenue growth
- Moderate valuation
- Strong long-term outlook

---

# Future Improvements

Given additional development time, the following enhancements would be added:

- Real-time financial data APIs
- Interactive stock charts
- Historical company comparisons
- Portfolio tracking
- Personalized watchlists
- Offline AI support using local language models
- More detailed financial metrics
- Faster report generation through response caching

---

# Repository Structure

```
ventureAI-investment/

├── src/
├── public/
├── docs/
├── examples/
├── transcripts/
├── README.md
├── package.json
├── .env.example
```

---

# AI Development Process

This project was developed using Large Language Models to assist throughout the software development lifecycle.

LLMs were used for:

- Project planning
- Architecture design
- Prompt refinement
- UI improvements
- Code debugging
- Documentation writing

---

# Screenshots

Add screenshots inside:

```
docs/screenshots/
```

Suggested screenshots:

- Home Page
- Analysis Dashboard
- Generated Investment Report

---

# Sample Reports

Sample reports are included in:

```
examples/
```

Recommended files:

- apple-report.pdf
- nvidia-report.pdf
- infosys-report.pdf

---

# Author

**Pragati Kashyap**

GitHub

https://github.com/pragati-kashyap2003

LinkedIn

https://www.linkedin.com/in/pragati-kashyap01/

---

# License

This project is intended for educational and assessment purposes.
