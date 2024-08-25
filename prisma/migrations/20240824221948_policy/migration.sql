-- CreateEnum
CREATE TYPE "policyStatus" AS ENUM ('Published', 'Approved', 'Pending', 'Rejected', 'Draft', 'Archived');

-- AlterTable
ALTER TABLE "policy" ADD COLUMN     "status" "policyStatus" DEFAULT 'Draft';
