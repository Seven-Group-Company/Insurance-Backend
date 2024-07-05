/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `employeeInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `employeeInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employeeinfo` ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `employeeInfo_email_key` ON `employeeInfo`(`email`);

-- AddForeignKey
ALTER TABLE `employeeInfo` ADD CONSTRAINT `employeeInfo_email_fkey` FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;
