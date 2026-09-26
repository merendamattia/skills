import { cacheInvalidate } from "../core/redis.ts";
import { itemRepository } from "../repositories/items.ts";

export async function createItem(userId: string, name: string) {
  const item = await itemRepository.create(userId, name);
  await cacheInvalidate(`dashboard:${userId}`);
  return item;
}

export async function updateItem(id: string, userId: string, name?: string) {
  const item = await itemRepository.update(id, userId, name);
  await cacheInvalidate(`dashboard:${userId}`);
  return item;
}

export async function deleteItem(id: string, userId: string) {
  const item = await itemRepository.delete(id, userId);
  await cacheInvalidate(`dashboard:${userId}`);
  return item;
}
