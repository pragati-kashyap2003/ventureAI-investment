import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@langchain/core",
    "@langchain/openai",
    "@langchain/community",
    "@langchain/langgraph",
    "langchain",
  ],
  turbopack: {},
};

export default nextConfig;

