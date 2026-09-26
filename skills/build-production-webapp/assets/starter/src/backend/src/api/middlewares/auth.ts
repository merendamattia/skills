import { createMiddleware } from "hono/factory";
import { auth } from "../../core/auth.ts";
import type { AppEnv } from "../types.ts";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const data = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!data) return c.json({ error: "Unauthorized" }, 401);
  c.set("user", data.user);
  c.set("session", data.session);
  await next();
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get("user").role !== "admin") return c.json({ error: "Admin access required" }, 403);
  await next();
});
