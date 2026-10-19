-- Comptes nominatifs des organisateurs du club, séparés des comptes de l'académie.
CREATE TABLE "ClubOrganizer" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "login" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClubOrganizer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClubOrganizer_login_key" ON "ClubOrganizer"("login");
