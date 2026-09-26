import { auth } from "./auth.ts";
import { internalEmail } from "./auth-utils.ts";
import { config } from "./config.ts";
import { prisma } from "./db.ts";
import { logger } from "./logger.ts";

export async function bootstrap() {
  if (await prisma.user.count()) return;
  await auth.api.createUser({
    body: {
      email: internalEmail(config.ADMIN_USERNAME),
      password: config.ADMIN_PASSWORD,
      name: "Admin",
      role: "admin",
      data: { username: config.ADMIN_USERNAME, displayUsername: config.ADMIN_USERNAME },
    },
  });
  logger.info("Initial admin created", { username: config.ADMIN_USERNAME });
}
