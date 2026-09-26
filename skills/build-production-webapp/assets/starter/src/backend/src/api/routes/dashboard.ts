import { Hono } from "hono";
import { getDashboard } from "../../services/dashboard.ts";
import { requireAuth } from "../middlewares/auth.ts";
import type { AppEnv } from "../types.ts";

export const dashboardRoutes = new Hono<AppEnv>()
  .use("*", requireAuth)
  .get("/", async (c) => c.json(await getDashboard({
    userId: c.get("user").id,
    isAdmin: c.get("user").role === "admin",
  })));
