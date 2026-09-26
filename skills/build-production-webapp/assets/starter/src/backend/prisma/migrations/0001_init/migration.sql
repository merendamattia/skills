CREATE TYPE "AppJobStatus" AS ENUM ('PENDING', 'QUEUED', 'RUNNING', 'RETRYING', 'COMPLETED', 'FAILED', 'CANCELLED', 'STALE');

CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false, "image" TEXT,
  "username" TEXT, "displayUsername" TEXT, "role" TEXT NOT NULL DEFAULT 'user',
  "banned" BOOLEAN NOT NULL DEFAULT false, "banReason" TEXT, "banExpires" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

CREATE TABLE "session" (
  "id" TEXT PRIMARY KEY, "expiresAt" TIMESTAMP(3) NOT NULL, "token" TEXT NOT NULL,
  "ipAddress" TEXT, "userAgent" TEXT, "impersonatedBy" TEXT, "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE INDEX "session_userId_idx" ON "session"("userId");

CREATE TABLE "account" (
  "id" TEXT PRIMARY KEY, "accountId" TEXT NOT NULL, "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL, "accessToken" TEXT, "refreshToken" TEXT, "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3), "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT, "password" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
CREATE INDEX "account_userId_idx" ON "account"("userId");

CREATE TABLE "verification" (
  "id" TEXT PRIMARY KEY, "identifier" TEXT NOT NULL, "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

CREATE TABLE "item" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE INDEX "item_userId_createdAt_idx" ON "item"("userId", "createdAt");

CREATE TABLE "app_job" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "environment" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'EXAMPLE', "status" "AppJobStatus" NOT NULL DEFAULT 'PENDING',
  "input" JSONB NOT NULL, "result" JSONB, "queueJobId" TEXT, "workerId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0, "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "queuedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3), "heartbeatAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "app_job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "app_job_queueJobId_key" ON "app_job"("queueJobId");
CREATE INDEX "app_job_userId_createdAt_idx" ON "app_job"("userId", "createdAt");
CREATE INDEX "app_job_environment_status_createdAt_idx" ON "app_job"("environment", "status", "createdAt");

CREATE TABLE "service_heartbeat" (
  "id" TEXT PRIMARY KEY, "serviceName" TEXT NOT NULL, "environment" TEXT NOT NULL,
  "instanceId" TEXT NOT NULL, "metadata" JSONB,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "service_heartbeat_serviceName_environment_instanceId_key" ON "service_heartbeat"("serviceName", "environment", "instanceId");
CREATE INDEX "service_heartbeat_environment_lastSeenAt_idx" ON "service_heartbeat"("environment", "lastSeenAt");

CREATE TABLE "audit_log" (
  "id" TEXT PRIMARY KEY, "requestId" TEXT NOT NULL, "userId" TEXT, "method" TEXT NOT NULL,
  "path" TEXT NOT NULL, "statusCode" INTEGER NOT NULL, "ipAddress" TEXT,
  "userAgent" TEXT, "durationMs" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL
);
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");
CREATE INDEX "audit_log_userId_createdAt_idx" ON "audit_log"("userId", "createdAt");
