import { Module } from '@nestjs/common';
import { InventoryImportController } from './inventory-import.controller';
import { InventoryImportService } from './inventory-import.service';

@Module({
  controllers: [InventoryImportController],
  providers: [InventoryImportService],
  exports: [InventoryImportService],
})
export class InventoryImportModule {}
