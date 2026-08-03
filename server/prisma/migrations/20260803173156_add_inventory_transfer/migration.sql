-- AlterTable
ALTER TABLE `stock_movements` MODIFY `type` ENUM('IMPORT', 'EXPORT', 'ADJUSTMENT', 'TRANSFER') NOT NULL,
    MODIFY `referenceType` ENUM('INVENTORY_IMPORT', 'INVENTORY_EXPORT', 'INVENTORY_ADJUSTMENT', 'INVENTORY_STOCKTAKE', 'INVENTORY_TRANSFER') NOT NULL;

-- CreateTable
CREATE TABLE `inventory_transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `transferDate` DATETIME(3) NOT NULL,
    `note` TEXT NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'TRANSFERRED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdById` INTEGER NULL,
    `createdByName` VARCHAR(191) NOT NULL,
    `confirmedById` INTEGER NULL,
    `confirmedAt` DATETIME(3) NULL,
    `transferredById` INTEGER NULL,
    `transferredAt` DATETIME(3) NULL,
    `cancelledById` INTEGER NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_transfers_code_key`(`code`),
    INDEX `inventory_transfers_createdById_idx`(`createdById`),
    INDEX `inventory_transfers_confirmedById_idx`(`confirmedById`),
    INDEX `inventory_transfers_transferredById_idx`(`transferredById`),
    INDEX `inventory_transfers_cancelledById_idx`(`cancelledById`),
    INDEX `inventory_transfers_status_idx`(`status`),
    INDEX `inventory_transfers_transferDate_idx`(`transferDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_transfer_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transferId` INTEGER NOT NULL,
    `ingredientId` INTEGER NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `unitId` INTEGER NOT NULL,
    `note` VARCHAR(191) NULL,

    INDEX `inventory_transfer_items_transferId_idx`(`transferId`),
    INDEX `inventory_transfer_items_ingredientId_idx`(`ingredientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_transfers` ADD CONSTRAINT `inventory_transfers_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transfers` ADD CONSTRAINT `inventory_transfers_confirmedById_fkey` FOREIGN KEY (`confirmedById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transfers` ADD CONSTRAINT `inventory_transfers_transferredById_fkey` FOREIGN KEY (`transferredById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transfers` ADD CONSTRAINT `inventory_transfers_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transfer_items` ADD CONSTRAINT `inventory_transfer_items_transferId_fkey` FOREIGN KEY (`transferId`) REFERENCES `inventory_transfers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transfer_items` ADD CONSTRAINT `inventory_transfer_items_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transfer_items` ADD CONSTRAINT `inventory_transfer_items_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
