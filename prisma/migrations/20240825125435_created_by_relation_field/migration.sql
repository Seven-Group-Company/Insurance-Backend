-- AlterTable
ALTER TABLE "policy" ADD COLUMN     "usersId" INTEGER;

-- AddForeignKey
ALTER TABLE "policy" ADD CONSTRAINT "policy_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy" ADD CONSTRAINT "policy_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
