-- AlterTable
ALTER TABLE `users` ADD COLUMN `accessLevelId` INTEGER NULL;

-- CreateTable
CREATE TABLE `accessLevel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `permissions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,

    UNIQUE INDEX `accessLevel_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessLevelId_fkey` FOREIGN KEY (`accessLevelId`) REFERENCES `accessLevel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
