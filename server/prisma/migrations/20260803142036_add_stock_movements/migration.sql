-- CreateTable
CREATE TABLE `stock_movements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ingredientId` INTEGER NOT NULL,
    `type` ENUM('IMPORT', 'EXPORT', 'ADJUSTMENT') NOT NULL,
    `direction` ENUM('IN', 'OUT') NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `stockBefore` DECIMAL(12, 3) NOT NULL,
    `stockAfter` DECIMAL(12, 3) NOT NULL,
    `unitId` INTEGER NOT NULL,
    `referenceType` ENUM('INVENTORY_IMPORT', 'INVENTORY_EXPORT', 'INVENTORY_ADJUSTMENT') NOT NULL,
    `referenceId` INTEGER NOT NULL,
    `referenceCode` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `performedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_movements_ingredientId_idx`(`ingredientId`),
    INDEX `stock_movements_unitId_idx`(`unitId`),
    INDEX `stock_movements_performedById_idx`(`performedById`),
    INDEX `stock_movements_referenceType_referenceId_idx`(`referenceType`, `referenceId`),
    INDEX `stock_movements_type_idx`(`type`),
    INDEX `stock_movements_direction_idx`(`direction`),
    INDEX `stock_movements_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
