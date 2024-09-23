/*
  Warnings:

  - The primary key for the `clientInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `clientInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clientInfo" DROP CONSTRAINT "clientInfo_pkey",
DROP COLUMN "id";
