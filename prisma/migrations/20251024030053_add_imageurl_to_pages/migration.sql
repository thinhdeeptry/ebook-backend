/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "imageUrl" TEXT;
