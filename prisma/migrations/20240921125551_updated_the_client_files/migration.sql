/*
  Warnings:

  - You are about to drop the column `user_email` on the `client_files` table. All the data in the column will be lost.
  - Added the required column `client_email` to the `client_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client_files" DROP COLUMN "user_email",
ADD COLUMN     "client_email" TEXT NOT NULL;
