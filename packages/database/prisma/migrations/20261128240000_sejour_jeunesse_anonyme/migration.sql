-- AlterEnum
ALTER TYPE "ResidencyStatus" ADD VALUE 'IN_PROGRESS';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'YOUTH_LEADER';

-- AlterTable
ALTER TABLE "MemberSubmission" ADD COLUMN     "residencyExpiry" TIMESTAMP(3),
ADD COLUMN     "residencyMissing" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "residencyNote" TEXT,
ADD COLUMN     "residencyStatus" "ResidencyStatus",
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Pledge" ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SocialSupportRecord" ADD COLUMN     "documentExpiry" TIMESTAMP(3),
ADD COLUMN     "lastProgressAt" TIMESTAMP(3),
ADD COLUMN     "lastReportedAt" TIMESTAMP(3),
ADD COLUMN     "missingDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "procedureStartedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT;

