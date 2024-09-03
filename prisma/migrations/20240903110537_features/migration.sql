/*
  Warnings:

  - The `documents_required` column on the `policy` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "policy" ADD COLUMN     "cover_image" TEXT,
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "documents_required",
ADD COLUMN     "documents_required" TEXT[] DEFAULT ARRAY[]::TEXT[];
