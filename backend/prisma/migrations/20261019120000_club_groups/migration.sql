-- AlterTable
ALTER TABLE "ClubRegistration" ADD COLUMN     "club" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ClubGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubGroup_name_key" ON "ClubGroup"("name");

