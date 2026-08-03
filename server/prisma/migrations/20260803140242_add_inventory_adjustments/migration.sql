-- CreateTable
CREATE TABLE `inventory_adjustments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `adjustmentDate` DATETIME(3) NOT NULL,
    `type` ENUM('INCREASE', 'DECREASE') NOT NULL,
    `reason` TEXT NULL,
    `note` TEXT NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdById` INTEGER NULL,
    `createdByName` VARCHAR(191) NOT NULL,
    `confirmedById` INTEGER NULL,
    `confirmedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_adjustments_code_key`(`code`),
    INDEX `inventory_adjustments_createdById_idx`(`createdById`),
    INDEX `inventory_adjustments_confirmedById_idx`(`confirmedById`),
    INDEX `inventory_adjustments_status_idx`(`status`),
    INDEX `inventory_adjustments_adjustmentDate_idx`(`adjustmentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_adjustment_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adjustmentId` INTEGER NOT NULL,
    `ingredientId` INTEGER NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `unitId` INTEGER NOT NULL,
    `direction` ENUM('INCREASE', 'DECREASE') NOT NULL,
    `note` VARCHAR(191) NULL,

    INDEX `inventory_adjustment_items_adjustmentId_idx`(`adjustmentId`),
    INDEX `inventory_adjustment_items_ingredientId_idx`(`ingredientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_adjustments` ADD CONSTRAINT `inventory_adjustments_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_adjustments` ADD CONSTRAINT `inventory_adjustments_confirmedById_fkey` FOREIGN KEY (`confirmedById`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_adjustment_items` ADD CONSTRAINT `inventory_adjustment_items_adjustmentId_fkey` FOREIGN KEY (`adjustmentId`) REFERENCES `inventory_adjustments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_adjustment_items` ADD CONSTRAINT `inventory_adjustment_items_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_adjustment_items` ADD CONSTRAINT `inventory_adjustment_items_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
