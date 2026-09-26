import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jobRepository } from "../../repositories/jobs.ts";
import { createJobSchema, type JobScope } from "../../schemas/jobs.ts";
import { cancelAppJob, createAppJob, getAppJob } from "../../services/jobs.ts";
import { requireAuth } from "../middlewares/auth.ts";
import type { AppEnv } from "../types.ts";

const scope = (user: { id: string; role?: string | null }): JobScope => ({
  userId: user.id,
  isAdmin: user.role === "admin",
});

export const jobRoutes = new Hono<AppEnv>()
  .use("*", requireAuth)
  .get("/", async (c) => c.json(await jobRepository.list(scope(c.get("user")))))
  .post("/", zValidator("json", createJobSchema), async (c) =>
    c.json(await createAppJob(c.get("user").id, c.req.valid("json")), 202))
  .get("/:id", async (c) =>
    c.json(await getAppJob(c.req.param("id"), scope(c.get("user")))))
  .post("/:id/cancel", async (c) =>
    c.json(await cancelAppJob(c.req.param("id"), scope(c.get("user")))));
