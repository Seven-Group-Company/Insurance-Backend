/*
  Warnings:

  - You are about to drop the `policyFiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "policyFiles" DROP CONSTRAINT "policyFiles_attachment_id_fkey";

-- DropForeignKey
ALTER TABLE "policyFiles" DROP CONSTRAINT "policyFiles_policy_id_fkey";

-- DropTable
DROP TABLE "policyFiles";

-- CreateTable
CREATE TABLE "policy_files" (
    "id" SERIAL NOT NULL,
    "policy_id" INTEGER,
    "attachment_id" INTEGER,

    CONSTRAINT "policy_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "policy_files" ADD CONSTRAINT "policy_files_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_files" ADD CONSTRAINT "policy_files_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
