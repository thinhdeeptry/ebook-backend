/*
  Warnings:

  - You are about to drop the column `height` on the `page_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `page_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `page_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `page_blocks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "page_blocks" DROP COLUMN "height",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "heightPercent" DOUBLE PRECISION,
ADD COLUMN     "widthPercent" DOUBLE PRECISION,
ADD COLUMN     "xPercent" DOUBLE PRECISION,
ADD COLUMN     "yPercent" DOUBLE PRECISION;
