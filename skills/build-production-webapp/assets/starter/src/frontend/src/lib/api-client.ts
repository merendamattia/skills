import { hc } from "hono/client";
import type { AppType } from "production-webapp-backend/api";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:17421";
export const api = hc<AppType>(API_URL, { init: { credentials: "include" } }).api;

export async function json<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body as T;
}
