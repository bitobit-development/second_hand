-- CreateEnum for AdminAction
CREATE TYPE "AdminAction" AS ENUM (
    'APPROVE_LISTING',
    'REJECT_LISTING',
    'PAUSE_LISTING',
    'RESTORE_LISTING',
    'DELETE_LISTING',
    'CREATE_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'UPDATE_USER_ROLE',
    'BAN_USER',
    'UNBAN_USER',
    'CREATE_CATEGORY',
    'UPDATE_CATEGORY',
    'MERGE_CATEGORIES',
    'DELETE_CATEGORY',
    'TOGGLE_CATEGORY_STATUS',
    'UPDATE_SETTINGS',
    'VIEW_AUDIT_LOG',
    'EXPORT_DATA'
);

-- CreateEnum for AuditTargetType
CREATE TYPE "AuditTargetType" AS ENUM (
    'LISTING',
    'USER',
    'CATEGORY',
    'TRANSACTION',
    'SYSTEM'
);

-- CreateTable AdminAuditLog
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "targetType" "AuditTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_userId_idx" ON "AdminAuditLog"("userId");
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX "AdminAuditLog_targetType_idx" ON "AdminAuditLog"("targetType");
CREATE INDEX "AdminAuditLog_targetId_idx" ON "AdminAuditLog"("targetId");
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
CREATE INDEX "AdminAuditLog_userId_action_idx" ON "AdminAuditLog"("userId", "action");
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
