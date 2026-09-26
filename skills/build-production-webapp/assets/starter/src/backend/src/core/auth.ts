import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { username } from "better-auth/plugins/username";
import { config } from "./config.ts";
import { prisma } from "./db.ts";

export const auth = betterAuth({
  appName: "Production Web App",
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128 },
  disabledPaths: ["/sign-up/email", "/is-username-available"],
  trustedOrigins: [config.FRONTEND_URL],
  advanced: { useSecureCookies: config.NODE_ENV === "production" },
  plugins: [username(), admin()],
});

export type Session = typeof auth.$Infer.Session;
