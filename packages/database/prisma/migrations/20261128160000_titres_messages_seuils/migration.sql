-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('CONTACT', 'BESOIN');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('NEW', 'DONE');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "threshold" DECIMAL(65,30) NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "kind" "MessageKind" NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "subject" TEXT,
    "department" TEXT,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "handledBy" TEXT,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");


-- Accès refusé à la clé publique Supabase (aucune politique) : seul le serveur lit cette table.
ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;
