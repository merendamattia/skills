import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { itemRepository } from "../../repositories/items.ts";
import { createItemSchema, updateItemSchema } from "../../schemas/items.ts";
import { createItem, deleteItem, updateItem } from "../../services/items.ts";
import { requireAuth } from "../middlewares/auth.ts";
import type { AppEnv } from "../types.ts";

export const itemRoutes = new Hono<AppEnv>()
  .use("*", requireAuth)
  .get("/", async (c) => c.json(await itemRepository.list(c.get("user").id)))
  .post("/", zValidator("json", createItemSchema), async (c) =>
    c.json(await createItem(c.get("user").id, c.req.valid("json").name), 201))
  .patch("/:id", zValidator("json", updateItemSchema), async (c) =>
    c.json(await updateItem(c.req.param("id"), c.get("user").id, c.req.valid("json").name)))
  .delete("/:id", async (c) =>
    c.json(await deleteItem(c.req.param("id"), c.get("user").id)));
