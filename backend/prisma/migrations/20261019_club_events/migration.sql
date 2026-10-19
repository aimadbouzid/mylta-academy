-- Événements du club scientifique : open days, ateliers, rencontres.
CREATE TABLE "ClubEvent" (
  "id" SERIAL NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL DEFAULT '',
  "date" TEXT NOT NULL,
  "startTime" TEXT NOT NULL DEFAULT '',
  "endTime" TEXT NOT NULL DEFAULT '',
  "place" TEXT NOT NULL DEFAULT '',
  "poster" TEXT NOT NULL DEFAULT '',
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "programme" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClubEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClubEvent_slug_key" ON "ClubEvent"("slug");
CREATE INDEX "ClubEvent_date_idx" ON "ClubEvent"("date");

CREATE TABLE "ClubEventRegistration" (
  "id" SERIAL NOT NULL,
  "eventId" INTEGER NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "club" TEXT NOT NULL DEFAULT '',
  "token" TEXT NOT NULL,
  "checkedInAt" TIMESTAMP(3),
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClubEventRegistration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClubEventRegistration_token_key" ON "ClubEventRegistration"("token");
CREATE UNIQUE INDEX "ClubEventRegistration_phone_eventId_key" ON "ClubEventRegistration"("phone", "eventId");
CREATE INDEX "ClubEventRegistration_eventId_createdAt_idx" ON "ClubEventRegistration"("eventId", "createdAt");
ALTER TABLE "ClubEventRegistration" ADD CONSTRAINT "ClubEventRegistration_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "ClubEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
