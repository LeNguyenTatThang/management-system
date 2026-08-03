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
import { InventoryAdjustmentService } from './inventory-adjustment.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { AdjustmentStatus } from '@prisma/client';

@Controller('inventory-adjustment')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class InventoryAdjustmentController {
  constructor(private adjustmentService: InventoryAdjustmentService) {}

  @Get()
  @RequirePermission('inventory.adjustment.read')
  findAll(
    @Query('status') status?: AdjustmentStatus,
    @Query('keyword') keyword?: string,
  ) {
    return this.adjustmentService.findAll({ status, keyword });
  }

  @Get(':id')
  @RequirePermission('inventory.adjustment.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adjustmentService.findOne(id);
  }

  @Post()
  @RequirePermission('inventory.adjustment.create')
  create(
    @Body() dto: CreateAdjustmentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adjustmentService.create(dto, user.id, user.name);
  }

  @Patch(':id')
  @RequirePermission('inventory.adjustment.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAdjustmentDto,
  ) {
    return this.adjustmentService.update(id, dto);
  }

  @Patch(':id/confirm')
  @RequirePermission('inventory.adjustment.update')
  confirm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adjustmentService.updateStatus(id, AdjustmentStatus.CONFIRMED, user.id, user.name);
  }

  @Patch(':id/cancel')
  @RequirePermission('inventory.adjustment.delete')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.adjustmentService.updateStatus(id, AdjustmentStatus.CANCELLED);
  }

  @Delete(':id')
  @RequirePermission('inventory.adjustment.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adjustmentService.remove(id);
  }
}
