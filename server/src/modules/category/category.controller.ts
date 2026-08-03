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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';

@ApiTags('categories')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @RequirePermission('product.category.read')
  @ApiOperation({ summary: 'Danh sách danh mục' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @RequirePermission('product.category.read')
  @ApiOperation({ summary: 'Chi tiết danh mục' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @RequirePermission('product.category.create')
  @ApiOperation({ summary: 'Tạo danh mục' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('product.category.update')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('product.category.delete')
  @ApiOperation({ summary: 'Xóa danh mục' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
