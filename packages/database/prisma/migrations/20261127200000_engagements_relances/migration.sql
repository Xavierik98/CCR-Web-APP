-- AlterTable
ALTER TABLE "Pledge" ADD COLUMN     "amountPaid" DECIMAL(65,30),
ADD COLUMN     "lastReminderAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "reminderCount" INTEGER NOT NULL DEFAULT 0;

