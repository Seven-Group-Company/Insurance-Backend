/*
  Warnings:

  - You are about to drop the column `user_id` on the `client_policy` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_policy" DROP CONSTRAINT "client_policy_user_id_fkey";

-- AlterTable
ALTER TABLE "client_policy" DROP COLUMN "user_id",
ADD COLUMN     "user_email" TEXT;

-- AddForeignKey
ALTER TABLE "client_policy" ADD CONSTRAINT "client_policy_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;
