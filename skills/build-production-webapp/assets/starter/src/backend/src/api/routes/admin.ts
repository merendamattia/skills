import { Hono } from "hono";
import { auditRepository } from "../../repositories/audit.ts";
import { queueMonitor } from "../../services/monitoring.ts";
import { requireAdmin, requireAuth } from "../middlewares/auth.ts";
import type { AppEnv } from "../types.ts";

export const adminRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireAdmin)
  .get("/queues", async (c) => c.json(await queueMonitor()))
  .get("/audit-logs", async (c) => c.json(await auditRepository.list()));
