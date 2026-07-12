import { Router } from "express";
import { hasApiKeys, isDemoMode } from "../lib/config";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    demoMode: isDemoMode(),
    hasApiKeys: hasApiKeys(),
    timestamp: new Date().toISOString(),
  });
});
