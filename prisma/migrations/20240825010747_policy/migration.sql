-- CreateTable
CREATE TABLE "policyFiles" (
    "id" SERIAL NOT NULL,
    "policy_id" INTEGER,
    "attachment_id" INTEGER,

    CONSTRAINT "policyFiles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "policyFiles" ADD CONSTRAINT "policyFiles_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policyFiles" ADD CONSTRAINT "policyFiles_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
