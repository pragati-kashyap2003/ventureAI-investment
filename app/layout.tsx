import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentureScope AI — Investment Research Agent",
  description:
    "AI-powered investment research agent that analyzes companies and delivers INVEST/PASS verdicts using real-time data and multi-agent AI reasoning.",
  keywords: ["investment research", "AI agent", "LangGraph", "company analysis", "venture capital"],
  openGraph: {
    title: "VentureScope AI — Investment Research Agent",
    description: "AI-powered investment research with multi-agent reasoning",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
