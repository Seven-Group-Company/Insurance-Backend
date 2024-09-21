-- CreateEnum
CREATE TYPE "clientPolicyStatus" AS ENUM ('Draft', 'Pending_Review', 'Under_Review', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "clientInfo" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "otherName" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "maritalStatus" "maritalStatus",
    "nationality" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "clientInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_policy" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "policy_id" INTEGER,
    "date_enrolled" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_expires" TIMESTAMP(3),
    "status" "clientPolicyStatus" NOT NULL DEFAULT 'Draft',

    CONSTRAINT "client_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_files" (
    "id" SERIAL NOT NULL,
    "client_policy_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "attachment_id" INTEGER,

    CONSTRAINT "client_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientInfo_email_key" ON "clientInfo"("email");

-- AddForeignKey
ALTER TABLE "clientInfo" ADD CONSTRAINT "clientInfo_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_policy" ADD CONSTRAINT "client_policy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_policy" ADD CONSTRAINT "client_policy_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_files" ADD CONSTRAINT "client_files_client_policy_id_fkey" FOREIGN KEY ("client_policy_id") REFERENCES "client_policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_files" ADD CONSTRAINT "client_files_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
