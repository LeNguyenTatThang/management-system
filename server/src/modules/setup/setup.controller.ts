import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { SetupService } from './setup.service';

@ApiTags('setups')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('setups')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get()
  @RequirePermission('product.setup.read')
  @ApiOperation({ summary: 'Danh sách setup' })
  findAll() {
    return this.setupService.findAll();
  }

  @Get(':id')
  @RequirePermission('product.setup.read')
  @ApiOperation({ summary: 'Chi tiết setup' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.setupService.findOne(id);
  }

  @Post()
  @RequirePermission('product.setup.create')
  @ApiOperation({ summary: 'Tạo setup' })
  create(@Body() dto: CreateSetupDto) {
    return this.setupService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('product.setup.update')
  @ApiOperation({ summary: 'Cập nhật setup' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSetupDto) {
    return this.setupService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('product.setup.delete')
  @ApiOperation({ summary: 'Xóa setup' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.setupService.remove(id);
  }
}
