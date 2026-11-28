-- CreateEnum
CREATE TYPE "NeedStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'PARTIAL', 'REJECTED', 'DONE');

-- CreateTable
CREATE TABLE "NeedsStatement" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "total" DECIMAL(65,30),
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "neededBy" TIMESTAMP(3),
    "status" "NeedStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NeedsStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NeedsStatement_status_createdAt_idx" ON "NeedsStatement"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "NeedsStatement" ADD CONSTRAINT "NeedsStatement_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NeedsStatement" ENABLE ROW LEVEL SECURITY;
