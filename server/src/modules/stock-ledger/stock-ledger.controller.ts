import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { StockLedgerService } from './stock-ledger.service';
import { StockMovementType, StockMovementDirection, ReferenceType } from '@prisma/client';

@Controller('stock-ledger')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class StockLedgerController {
  constructor(private ledgerService: StockLedgerService) {}

  @Get()
  @RequirePermission('inventory.stockLedger.read')
  findAll(
    @Query('ingredientId') ingredientId?: string,
    @Query('type') type?: StockMovementType,
    @Query('direction') direction?: StockMovementDirection,
    @Query('referenceType') referenceType?: ReferenceType,
    @Query('keyword') keyword?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ledgerService.findAll({
      ingredientId: ingredientId ? Number(ingredientId) : undefined,
      type,
      direction,
      referenceType,
      keyword,
      dateFrom,
      dateTo,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get('summary')
  @RequirePermission('inventory.stockLedger.read')
  getSummary(
    @Query('ingredientId') ingredientId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.ledgerService.getSummary({
      ingredientId: ingredientId ? Number(ingredientId) : undefined,
      dateFrom,
      dateTo,
    });
  }

  @Get('ingredient/:ingredientId')
  @RequirePermission('inventory.stockLedger.read')
  findByIngredient(
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ledgerService.findByIngredient(ingredientId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get('consistency/:ingredientId')
  @RequirePermission('inventory.stockLedger.read')
  checkConsistency(@Param('ingredientId', ParseIntPipe) ingredientId: number) {
    return this.ledgerService.checkConsistency(ingredientId);
  }

  @Get(':id')
  @RequirePermission('inventory.stockLedger.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ledgerService.findOne(id);
  }
}
