-- AlterTable
ALTER TABLE "ClubRegistration" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClubRegistration_token_key" ON "ClubRegistration"("token");

