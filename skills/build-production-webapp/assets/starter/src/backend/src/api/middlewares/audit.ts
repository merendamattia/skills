import { createMiddleware } from "hono/factory";
import { auth } from "../../core/auth.ts";
import { logger } from "../../core/logger.ts";
import { auditRepository } from "../../repositories/audit.ts";
import type { AppEnv } from "../types.ts";

export const auditRequests = createMiddleware<AppEnv>(async (c, next) => {
  const started = performance.now();
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null);
  let statusCode = 500;
  try {
    await next();
    statusCode = c.res.status;
  } finally {
    const path = new URL(c.req.url).pathname;
    await auditRepository.create({
      requestId: c.get("requestId"),
      userId: session?.user.id ?? null,
      method: c.req.method,
      path,
      statusCode,
      ipAddress: c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: c.req.header("user-agent"),
      durationMs: Math.round(performance.now() - started),
    }).catch((error) => logger.error("Audit log write failed", { path, error: String(error) }));
  }
});
