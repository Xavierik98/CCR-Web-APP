-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Pledge" DROP CONSTRAINT "Pledge_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Pledge" DROP CONSTRAINT "Pledge_memberId_fkey";

-- DropForeignKey
ALTER TABLE "SocialSupportRecord" DROP CONSTRAINT "SocialSupportRecord_memberId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "neighborhood" TEXT;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "departmentId",
DROP COLUMN "departmentRole",
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "category" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Pledge" ADD COLUMN     "donorName" TEXT NOT NULL,
ALTER COLUMN "memberId" DROP NOT NULL,
ALTER COLUMN "amountPromised" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash";

-- CreateTable
CREATE TABLE "DepartmentMembership" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "DepartmentMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentMembership_memberId_departmentId_key" ON "DepartmentMembership"("memberId", "departmentId");

-- AddForeignKey
ALTER TABLE "DepartmentMembership" ADD CONSTRAINT "DepartmentMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentMembership" ADD CONSTRAINT "DepartmentMembership_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ServiceEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialSupportRecord" ADD CONSTRAINT "SocialSupportRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Même règle que les autres tables : aucune lecture par la clé publique.
ALTER TABLE "DepartmentMembership" ENABLE ROW LEVEL SECURITY;
