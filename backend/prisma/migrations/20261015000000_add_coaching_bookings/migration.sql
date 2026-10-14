-- CreateTable
CREATE TABLE "CoachingBooking" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "topicLabel" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL DEFAULT '',
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingBooking_date_idx" ON "CoachingBooking"("date");
