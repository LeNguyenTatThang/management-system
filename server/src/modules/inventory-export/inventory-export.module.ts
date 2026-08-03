import { Module } from '@nestjs/common';
import { InventoryExportController } from './inventory-export.controller';
import { InventoryExportService } from './inventory-export.service';

@Module({
  controllers: [InventoryExportController],
  providers: [InventoryExportService],
  exports: [InventoryExportService],
})
export class InventoryExportModule {}
