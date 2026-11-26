-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'MERGED', 'CREATED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PASTOR';
ALTER TYPE "Role" ADD VALUE 'TREASURER';
ALTER TYPE "Role" ADD VALUE 'COMMUNICATION';

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "functions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "MemberSubmission" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "birthDate" TIMESTAMP(3),
    "neighborhood" TEXT,
    "category" "MemberCategory",
    "professionalStatus" "ProfessionalStatus",
    "functions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "departments" JSONB NOT NULL DEFAULT '[]',
    "message" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "memberId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemberSubmission" ADD CONSTRAINT "MemberSubmission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Même règle que les autres tables : aucune lecture par la clé publique.
ALTER TABLE "MemberSubmission" ENABLE ROW LEVEL SECURITY;
