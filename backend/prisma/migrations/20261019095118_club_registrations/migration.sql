-- CreateTable
CREATE TABLE "ClubRegistration" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "training" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubRegistration_training_createdAt_idx" ON "ClubRegistration"("training", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClubRegistration_phone_training_key" ON "ClubRegistration"("phone", "training");
