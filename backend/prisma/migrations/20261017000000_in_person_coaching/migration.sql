-- CreateTable
CREATE TABLE "InPersonSession" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '',
    "endTime" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "place" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InPersonSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InPersonRegistration" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InPersonRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InPersonSession_date_idx" ON "InPersonSession"("date");

-- CreateIndex
CREATE INDEX "InPersonRegistration_sessionId_idx" ON "InPersonRegistration"("sessionId");

-- AddForeignKey
ALTER TABLE "InPersonRegistration" ADD CONSTRAINT "InPersonRegistration_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InPersonSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
