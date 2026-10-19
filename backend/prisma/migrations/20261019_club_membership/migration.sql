-- Accès aux formations réservé aux membres du club, cochés par l'administration.
ALTER TABLE "User" ADD COLUMN "isClubMember" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "clubSince" TIMESTAMP(3);
