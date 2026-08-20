-- AlterTable
ALTER TABLE "InstructorPayout" ADD COLUMN     "identityFullName" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedBy" TEXT,
ADD COLUMN     "reference" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "identityDocPath" TEXT,
ADD COLUMN     "identityFullName" TEXT,
ADD COLUMN     "identityNotes" TEXT,
ADD COLUMN     "identityStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "identitySubmittedAt" TIMESTAMP(3),
ADD COLUMN     "identityVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "identityVerifiedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InstructorPayout_reference_key" ON "InstructorPayout"("reference");

-- CreateIndex
CREATE INDEX "InstructorPayout_instructorId_status_idx" ON "InstructorPayout"("instructorId", "status");

