ALTER TABLE "InPersonRegistration" ADD COLUMN "isStudent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "InPersonRegistration" ADD COLUMN "studentCard" TEXT;

CREATE TABLE "ContestEntry" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "prize" TEXT NOT NULL DEFAULT '',
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContestEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ContestEntry_phone_key" ON "ContestEntry"("phone");
