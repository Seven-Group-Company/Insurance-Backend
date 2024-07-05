/*
  Warnings:

  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employeeinfo` MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL,
    MODIFY `otherName` VARCHAR(191) NULL,
    MODIFY `dateOfBirth` VARCHAR(191) NULL,
    MODIFY `gender` VARCHAR(191) NULL,
    MODIFY `maritalStatus` ENUM('Single', 'Married') NULL,
    MODIFY `nationality` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `photo` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `password`,
    MODIFY `userType` ENUM('admin', 'employee', 'client') NOT NULL DEFAULT 'employee';
