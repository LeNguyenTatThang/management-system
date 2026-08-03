import { Module } from '@nestjs/common';
import { InventoryTransferController } from './inventory-transfer.controller';
import { InventoryTransferService } from './inventory-transfer.service';

@Module({
  controllers: [InventoryTransferController],
  providers: [InventoryTransferService],
})
export class InventoryTransferModule {}
