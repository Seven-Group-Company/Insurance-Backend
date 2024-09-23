/*
  Warnings:

  - You are about to drop the column `address` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `maritalStatus` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `otherName` on the `clientInfo` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `clientInfo` table. All the data in the column will be lost.
  - The primary key for the `employeeInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `maritalStatus` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `otherName` on the `employeeInfo` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `employeeInfo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_policy" DROP CONSTRAINT "client_policy_client_email_fkey";

-- AlterTable
ALTER TABLE "clientInfo" DROP COLUMN "address",
DROP COLUMN "dateOfBirth",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "lastName",
DROP COLUMN "maritalStatus",
DROP COLUMN "nationality",
DROP COLUMN "otherName",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "employeeInfo" DROP CONSTRAINT "employeeInfo_pkey",
DROP COLUMN "address",
DROP COLUMN "dateOfBirth",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "id",
DROP COLUMN "lastName",
DROP COLUMN "maritalStatus",
DROP COLUMN "nationality",
DROP COLUMN "otherName",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "maritalStatus" "maritalStatus",
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "otherName" TEXT,
ADD COLUMN     "phone" TEXT;
