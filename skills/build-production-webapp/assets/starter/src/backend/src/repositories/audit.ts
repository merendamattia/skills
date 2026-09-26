import { prisma } from "../core/db.ts";

export const auditRepository = {
  create: (entry: {
    requestId: string;
    userId: string | null;
    method: string;
    path: string;
    statusCode: number;
    ipAddress?: string;
    userAgent?: string;
    durationMs: number;
  }) => prisma.auditLog.create({ data: entry }),
  list: () => prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, username: true, displayUsername: true } } },
  }),
};
