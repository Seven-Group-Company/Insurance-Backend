/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `policy` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "policy" ALTER COLUMN "code" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "policy_code_key" ON "policy"("code");
