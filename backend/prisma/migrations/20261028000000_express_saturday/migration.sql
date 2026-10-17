ALTER TABLE "InPersonRegistration" ADD COLUMN "formation" TEXT NOT NULL DEFAULT '';
ALTER TABLE "InPersonRegistration" ADD COLUMN "day" TEXT NOT NULL DEFAULT '';
CREATE INDEX "InPersonRegistration_formation_day_idx" ON "InPersonRegistration"("formation", "day");
