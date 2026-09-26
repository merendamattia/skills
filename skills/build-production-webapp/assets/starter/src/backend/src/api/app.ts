import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "../core/auth.ts";
import { config } from "../core/config.ts";
import { AppError } from "../core/errors.ts";
import { logger } from "../core/logger.ts";
import { auditRequests } from "./middlewares/audit.ts";
import { adminRoutes } from "./routes/admin.ts";
import { dashboardRoutes } from "./routes/dashboard.ts";
import { itemRoutes } from "./routes/items.ts";
import { jobRoutes } from "./routes/jobs.ts";
import type { AppEnv } from "./types.ts";

const app = new Hono<AppEnv>().basePath("/api");
app.use("*", requestId(), secureHeaders());
app.use("*", cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.use("*", auditRequests);
app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));
app.onError((error, c) => {
  if (error instanceof AppError) return c.json({ error: error.message }, error.status);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return c.json({ error: "Not found" }, 404);
  }
  logger.error("Unhandled request error", { requestId: c.get("requestId"), error: String(error) });
  return c.json({ error: "Internal server error" }, 500);
});
app.notFound((c) => c.json({ error: "Not found" }, 404));

const routes = app
  .get("/health", (c) => c.json({ status: "ok" as const }))
  .route("/dashboard", dashboardRoutes)
  .route("/items", itemRoutes)
  .route("/jobs", jobRoutes)
  .route("/admin", adminRoutes);

export type AppType = typeof routes;
export { app };
