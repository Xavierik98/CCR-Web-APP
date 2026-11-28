-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "updatedBy" TEXT;

-- CreateTable
CREATE TABLE "ContentEvent" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "byEmail" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentEvent_at_idx" ON "ContentEvent"("at");

ALTER TABLE "ContentEvent" ENABLE ROW LEVEL SECURITY;
