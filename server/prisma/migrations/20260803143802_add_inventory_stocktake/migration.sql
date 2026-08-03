-- AlterTable
ALTER TABLE `stock_movements` MODIFY `referenceType` ENUM('INVENTORY_IMPORT', 'INVENTORY_EXPORT', 'INVENTORY_ADJUSTMENT', 'INVENTORY_STOCKTAKE') NOT NULL;

-- CreateTable
CREATE TABLE `inventory_stocktakes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `stocktakeDate` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `note` TEXT NULL,
    `createdById` INTEGER NULL,
    `createdByName` VARCHAR(191) NOT NULL,
    `confirmedById` INTEGER NULL,
    `confirmedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_stocktakes_code_key`(`code`),
    INDEX `inventory_stocktakes_createdById_idx`(`createdById`),
    INDEX `inventory_stocktakes_confirmedById_idx`(`confirmedById`),
    INDEX `inventory_stocktakes_status_idx`(`status`),
    INDEX `inventory_stocktakes_stocktakeDate_idx`(`stocktakeDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_stocktake_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stocktakeId` INTEGER NOT NULL,
    `ingredientId` INTEGER NOT NULL,
    `unitId` INTEGER NOT NULL,
    `systemQuantity` DECIMAL(12, 3) NOT NULL,
    `actualQuantity` DECIMAL(12, 3) NOT NULL,
    `difference` DECIMAL(12, 3) NOT NULL,
    `note` VARCHAR(191) NULL,

    INDEX `inventory_stocktake_items_stocktakeId_idx`(`stocktakeId`),
    INDEX `inventory_stocktake_items_ingredientId_idx`(`ingredientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_stocktakes` ADD CONSTRAINT `inventory_stocktakes_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stocktakes` ADD CONSTRAINT `inventory_stocktakes_confirmedById_fkey` FOREIGN KEY (`confirmedById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stocktake_items` ADD CONSTRAINT `inventory_stocktake_items_stocktakeId_fkey` FOREIGN KEY (`stocktakeId`) REFERENCES `inventory_stocktakes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stocktake_items` ADD CONSTRAINT `inventory_stocktake_items_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stocktake_items` ADD CONSTRAINT `inventory_stocktake_items_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
