-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "formOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "monthly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "Pledge" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fromForm" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PledgePayment" (
    "id" TEXT NOT NULL,
    "pledgeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "byEmail" TEXT,
    "note" TEXT,

    CONSTRAINT "PledgePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PledgePayment_pledgeId_month_idx" ON "PledgePayment"("pledgeId", "month");

-- AddForeignKey
ALTER TABLE "PledgePayment" ADD CONSTRAINT "PledgePayment_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "Pledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PledgePayment" ENABLE ROW LEVEL SECURITY;
