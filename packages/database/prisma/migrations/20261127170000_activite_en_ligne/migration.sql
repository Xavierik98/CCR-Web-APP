-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "lastSeenCity" TEXT,
ADD COLUMN     "lastSeenCountry" TEXT,
ADD COLUMN     "lastSeenDevice" TEXT,
ADD COLUMN     "lastSeenIp" TEXT,
ADD COLUMN     "lastSessionId" TEXT;

