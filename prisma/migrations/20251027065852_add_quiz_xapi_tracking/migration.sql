-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('THEORY', 'INTERACTIVE');

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "type" "PageType" NOT NULL DEFAULT 'THEORY';

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "maxScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "quiz_configs" (
    "id" TEXT NOT NULL,
    "pageBlockId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxAttempts" INTEGER,
    "timeLimit" INTEGER,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "showFeedback" BOOLEAN NOT NULL DEFAULT true,
    "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT true,
    "allowReview" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizConfigId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "h5pContentId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_responses" (
    "id" TEXT NOT NULL,
    "quizAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "pointsEarned" DOUBLE PRECISION NOT NULL,
    "timeSpent" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xapi_statements" (
    "id" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "verbId" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "resultScore" DOUBLE PRECISION,
    "resultScoreMin" DOUBLE PRECISION,
    "resultScoreMax" DOUBLE PRECISION,
    "resultSuccess" BOOLEAN,
    "resultCompletion" BOOLEAN,
    "resultDuration" TEXT,
    "resultResponse" JSONB,
    "contextJson" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stored" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authority" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0.3',
    "attachments" JSONB,
    "quizAttemptId" TEXT,
    "h5pContentId" TEXT,
    "pageBlockId" TEXT,

    CONSTRAINT "xapi_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xapi_verbs" (
    "id" TEXT NOT NULL,
    "verbIri" TEXT NOT NULL,
    "display" JSONB NOT NULL,

    CONSTRAINT "xapi_verbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_analytics" (
    "id" TEXT NOT NULL,
    "pageBlockId" TEXT NOT NULL,
    "userId" TEXT,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "highestScore" DOUBLE PRECISION,
    "lowestScore" DOUBLE PRECISION,
    "passRate" DOUBLE PRECISION,
    "averageTimeSpent" INTEGER,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_configs_pageBlockId_key" ON "quiz_configs"("pageBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "xapi_statements_statementId_key" ON "xapi_statements"("statementId");

-- CreateIndex
CREATE INDEX "xapi_statements_actorId_timestamp_idx" ON "xapi_statements"("actorId", "timestamp");

-- CreateIndex
CREATE INDEX "xapi_statements_verbId_idx" ON "xapi_statements"("verbId");

-- CreateIndex
CREATE INDEX "xapi_statements_objectId_idx" ON "xapi_statements"("objectId");

-- CreateIndex
CREATE UNIQUE INDEX "xapi_verbs_verbIri_key" ON "xapi_verbs"("verbIri");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_analytics_pageBlockId_userId_key" ON "quiz_analytics"("pageBlockId", "userId");

-- AddForeignKey
ALTER TABLE "quiz_configs" ADD CONSTRAINT "quiz_configs_pageBlockId_fkey" FOREIGN KEY ("pageBlockId") REFERENCES "page_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizConfigId_fkey" FOREIGN KEY ("quizConfigId") REFERENCES "quiz_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_h5pContentId_fkey" FOREIGN KEY ("h5pContentId") REFERENCES "h5p_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xapi_statements" ADD CONSTRAINT "xapi_statements_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xapi_statements" ADD CONSTRAINT "xapi_statements_verbId_fkey" FOREIGN KEY ("verbId") REFERENCES "xapi_verbs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xapi_statements" ADD CONSTRAINT "xapi_statements_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xapi_statements" ADD CONSTRAINT "xapi_statements_h5pContentId_fkey" FOREIGN KEY ("h5pContentId") REFERENCES "h5p_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
