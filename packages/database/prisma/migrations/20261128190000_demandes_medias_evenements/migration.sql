-- AlterEnum
ALTER TYPE "SupportRequestStatus" ADD VALUE 'WAITLIST';

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "eventAt" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "SupportRequest" ADD COLUMN     "decisionNote" TEXT;

