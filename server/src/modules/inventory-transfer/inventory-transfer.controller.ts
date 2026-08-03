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
import { InventoryTransferService } from './inventory-transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferStatus } from '@prisma/client';

@Controller('inventory-transfer')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class InventoryTransferController {
  constructor(private transferService: InventoryTransferService) {}

  @Get()
  @RequirePermission('inventory.transfer.read')
  findAll(
    @Query('status') status?: TransferStatus,
    @Query('keyword') keyword?: string,
  ) {
    return this.transferService.findAll({ status, keyword });
  }

  @Get(':id')
  @RequirePermission('inventory.transfer.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transferService.findOne(id);
  }

  @Post()
  @RequirePermission('inventory.transfer.create')
  create(
    @Body() dto: CreateTransferDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.transferService.create(dto, user.id, user.name);
  }

  @Patch(':id')
  @RequirePermission('inventory.transfer.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTransferDto,
  ) {
    return this.transferService.update(id, dto);
  }

  @Patch(':id/confirm')
  @RequirePermission('inventory.transfer.update')
  confirm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.transferService.confirm(id, user.id);
  }

  @Patch(':id/transfer')
  @RequirePermission('inventory.transfer.update')
  transfer(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.transferService.transfer(id, user.id);
  }

  @Patch(':id/cancel')
  @RequirePermission('inventory.transfer.delete')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.transferService.cancel(id);
  }

  @Delete(':id')
  @RequirePermission('inventory.transfer.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transferService.remove(id);
  }
}
