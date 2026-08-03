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
import { InventoryExportService } from './inventory-export.service';
import { CreateExportDto } from './dto/create-export.dto';
import { ExportStatus } from '@prisma/client';

@Controller('inventory-export')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class InventoryExportController {
  constructor(private exportService: InventoryExportService) {}

  @Get()
  @RequirePermission('inventory.export.read')
  findAll(
    @Query('status') status?: ExportStatus,
    @Query('keyword') keyword?: string,
  ) {
    return this.exportService.findAll({ status, keyword });
  }

  @Get(':id')
  @RequirePermission('inventory.export.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exportService.findOne(id);
  }

  @Post()
  @RequirePermission('inventory.export.create')
  create(
    @Body() dto: CreateExportDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.exportService.create(dto, user.id, user.name);
  }

  @Patch(':id')
  @RequirePermission('inventory.export.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateExportDto,
  ) {
    return this.exportService.update(id, dto);
  }

  @Patch(':id/confirm')
  @RequirePermission('inventory.export.update')
  confirm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.exportService.updateStatus(id, ExportStatus.CONFIRMED, user.id, user.name);
  }

  @Patch(':id/export')
  @RequirePermission('inventory.export.update')
  executeExport(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.exportService.updateStatus(id, ExportStatus.EXPORTED, user.id, user.name);
  }

  @Patch(':id/cancel')
  @RequirePermission('inventory.export.delete')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.exportService.updateStatus(id, ExportStatus.CANCELLED);
  }

  @Delete(':id')
  @RequirePermission('inventory.export.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exportService.remove(id);
  }
}
