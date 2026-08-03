import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.service';
import { InventoryStocktakeService } from './inventory-stocktake.service';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
import { StocktakeStatus } from '@prisma/client';

@Controller('inventory-stocktake')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class InventoryStocktakeController {
  constructor(private stocktakeService: InventoryStocktakeService) {}

  @Get()
  @RequirePermission('inventory.stocktake.read')
  findAll(
    @Query('status') status?: StocktakeStatus,
    @Query('keyword') keyword?: string,
  ) {
    return this.stocktakeService.findAll({ status, keyword });
  }

  @Get(':id')
  @RequirePermission('inventory.stocktake.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stocktakeService.findOne(id);
  }

  @Post()
  @RequirePermission('inventory.stocktake.create')
  create(
    @Body() dto: CreateStocktakeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.stocktakeService.create(dto, user.id, user.name);
  }

  @Patch(':id')
  @RequirePermission('inventory.stocktake.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateStocktakeDto,
  ) {
    return this.stocktakeService.update(id, dto);
  }

  @Patch(':id/confirm')
  @RequirePermission('inventory.stocktake.update')
  confirm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.stocktakeService.updateStatus(id, StocktakeStatus.CONFIRMED, user.id);
  }

  @Patch(':id/cancel')
  @RequirePermission('inventory.stocktake.delete')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.stocktakeService.updateStatus(id, StocktakeStatus.CANCELLED);
  }

  @Delete(':id')
  @RequirePermission('inventory.stocktake.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stocktakeService.remove(id);
  }
}
