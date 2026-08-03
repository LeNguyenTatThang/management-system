import { Module } from '@nestjs/common';
import { InventoryStocktakeController } from './inventory-stocktake.controller';
import { InventoryStocktakeService } from './inventory-stocktake.service';

@Module({
  controllers: [InventoryStocktakeController],
  providers: [InventoryStocktakeService],
  exports: [InventoryStocktakeService],
})
export class InventoryStocktakeModule {}
