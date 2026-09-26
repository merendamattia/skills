import { prisma } from "../core/db.ts";

export const itemRepository = {
  list: (userId: string) => prisma.item.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  create: (userId: string, name: string) => prisma.item.create({ data: { userId, name } }),
  update: (id: string, userId: string, name: string | undefined) =>
    prisma.item.update({ where: { id, userId }, data: { name } }),
  delete: (id: string, userId: string) => prisma.item.delete({ where: { id, userId } }),
};
