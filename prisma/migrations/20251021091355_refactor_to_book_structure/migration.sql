/*
  Warnings:

  - You are about to drop the column `courseId` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `lessonStepId` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_steps` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,pageBlockId]` on the table `student_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pageBlockId` to the `student_progress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PageBlockType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'H5P');

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_classId_fkey";

-- DropForeignKey
ALTER TABLE "lesson_steps" DROP CONSTRAINT "lesson_steps_h5pContentId_fkey";

-- DropForeignKey
ALTER TABLE "lesson_steps" DROP CONSTRAINT "lesson_steps_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_courseId_fkey";

-- DropForeignKey
ALTER TABLE "student_progress" DROP CONSTRAINT "student_progress_lessonStepId_fkey";

-- DropIndex
DROP INDEX "student_progress_userId_lessonStepId_key";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "courseId",
ADD COLUMN     "bookId" TEXT,
ADD COLUMN     "chapterId" TEXT;

-- AlterTable
ALTER TABLE "student_progress" DROP COLUMN "lessonStepId",
ADD COLUMN     "pageBlockId" TEXT NOT NULL;

-- DropTable
DROP TABLE "courses";

-- DropTable
DROP TABLE "lesson_steps";

-- DropEnum
DROP TYPE "LessonStepType";

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "publisher" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "layout" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_blocks" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "blockType" "PageBlockType" NOT NULL,
    "contentJson" JSONB,
    "h5pContentId" TEXT,

    CONSTRAINT "page_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookClasses_AB_unique" ON "_BookClasses"("A", "B");

-- CreateIndex
CREATE INDEX "_BookClasses_B_index" ON "_BookClasses"("B");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_userId_pageBlockId_key" ON "student_progress"("userId", "pageBlockId");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_h5pContentId_fkey" FOREIGN KEY ("h5pContentId") REFERENCES "h5p_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_pageBlockId_fkey" FOREIGN KEY ("pageBlockId") REFERENCES "page_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookClasses" ADD CONSTRAINT "_BookClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookClasses" ADD CONSTRAINT "_BookClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
