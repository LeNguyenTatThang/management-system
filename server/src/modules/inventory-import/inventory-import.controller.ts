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
import { InventoryImportService } from './inventory-import.service';
import { CreateImportDto } from './dto/create-import.dto';
import { ImportStatus } from '@prisma/client';

@Controller('inventory-import')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class InventoryImportController {
  constructor(private importService: InventoryImportService) {}

  @Get()
  @RequirePermission('inventory.import.read')
  findAll(@Query('status') status?: ImportStatus, @Query('keyword') keyword?: string) {
    return this.importService.findAll({ status, keyword });
  }

  @Get(':id')
  @RequirePermission('inventory.import.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.importService.findOne(id);
  }

  @Post()
  @RequirePermission('inventory.import.create')
  create(
    @Body() dto: CreateImportDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.importService.create(dto, user.id, user.name);
  }

  @Patch(':id')
  @RequirePermission('inventory.import.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateImportDto,
  ) {
    return this.importService.update(id, dto);
  }

  @Patch(':id/confirm')
  @RequirePermission('inventory.import.update')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.importService.updateStatus(id, ImportStatus.CONFIRMED);
  }

  @Patch(':id/receive')
  @RequirePermission('inventory.import.update')
  receive(@Param('id', ParseIntPipe) id: number) {
    return this.importService.updateStatus(id, ImportStatus.RECEIVED);
  }

  @Patch(':id/cancel')
  @RequirePermission('inventory.import.delete')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.importService.updateStatus(id, ImportStatus.CANCELLED);
  }

  @Delete(':id')
  @RequirePermission('inventory.import.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.importService.remove(id);
  }
}
