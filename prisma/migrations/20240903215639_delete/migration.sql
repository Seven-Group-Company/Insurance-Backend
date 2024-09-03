-- DropForeignKey
ALTER TABLE "policy_files" DROP CONSTRAINT "policy_files_attachment_id_fkey";

-- AddForeignKey
ALTER TABLE "policy_files" ADD CONSTRAINT "policy_files_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
