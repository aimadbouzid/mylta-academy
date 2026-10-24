-- MYLTA LIVE: sessions, participants, questions, réponses, votes

CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "maxParticipants" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LiveParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'poll',
    "options" TEXT[],
    "correctAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveVote" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LiveParticipant_sessionId_email_key" ON "LiveParticipant"("sessionId", "email");
CREATE INDEX "LiveParticipant_sessionId_idx" ON "LiveParticipant"("sessionId");
CREATE INDEX "LiveSession_createdBy_status_idx" ON "LiveSession"("createdBy", "status");
CREATE INDEX "LiveQuestion_sessionId_createdAt_idx" ON "LiveQuestion"("sessionId", "createdAt");
CREATE UNIQUE INDEX "LiveAnswer_questionId_participantId_key" ON "LiveAnswer"("questionId", "participantId");
CREATE INDEX "LiveAnswer_questionId_answeredAt_idx" ON "LiveAnswer"("questionId", "answeredAt");
CREATE UNIQUE INDEX "LiveVote_questionId_participantId_key" ON "LiveVote"("questionId", "participantId");
CREATE INDEX "LiveVote_sessionId_votedAt_idx" ON "LiveVote"("sessionId", "votedAt");

ALTER TABLE "LiveParticipant" ADD CONSTRAINT "LiveParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveQuestion" ADD CONSTRAINT "LiveQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveAnswer" ADD CONSTRAINT "LiveAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LiveQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveAnswer" ADD CONSTRAINT "LiveAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "LiveParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveVote" ADD CONSTRAINT "LiveVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LiveQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveVote" ADD CONSTRAINT "LiveVote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveVote" ADD CONSTRAINT "LiveVote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "LiveParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
