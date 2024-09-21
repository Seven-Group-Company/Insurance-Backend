/*
  Warnings:

  - You are about to drop the column `user_email` on the `client_policy` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_policy" DROP CONSTRAINT "client_policy_user_email_fkey";

-- AlterTable
ALTER TABLE "client_policy" DROP COLUMN "user_email",
ADD COLUMN     "agent_id" INTEGER,
ADD COLUMN     "client_email" TEXT;

-- AlterTable
ALTER TABLE "employeeInfo" ADD COLUMN     "isAgent" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "client_policy" ADD CONSTRAINT "client_policy_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "clientInfo"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_policy" ADD CONSTRAINT "client_policy_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
