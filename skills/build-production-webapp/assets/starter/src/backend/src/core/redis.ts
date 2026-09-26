import Redis from "ioredis";
import { config } from "./config.ts";
import { logger } from "./logger.ts";

export const redis = new Redis(config.REDIS_URL, { lazyConnect: false, maxRetriesPerRequest: 3 });
const namespaced = (value: string) => `production-webapp:${config.APP_ENV}:${value}`;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(namespaced(key));
    return value ? JSON.parse(value) as T : null;
  } catch (error) {
    logger.warn("Cache read failed", { error: String(error) });
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  try {
    await redis.set(namespaced(key), JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    logger.warn("Cache write failed", { error: String(error) });
  }
}

export async function cacheInvalidate(pattern: string) {
  try {
    const stream = redis.scanStream({ match: namespaced(pattern), count: 100 });
    for await (const keys of stream) {
      const entries = keys as string[];
      if (entries.length) await redis.del(...entries);
    }
  } catch (error) {
    logger.warn("Cache invalidation failed", { error: String(error) });
  }
}
