import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductService } from './product.service';

@ApiTags('products')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @RequirePermission('product.product.read')
  @ApiOperation({ summary: 'Danh sách món' })
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('product.product.read')
  @ApiOperation({ summary: 'Chi tiết món' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  @RequirePermission('product.product.create')
  @ApiOperation({ summary: 'Tạo món' })
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('product.product.update')
  @ApiOperation({ summary: 'Cập nhật món' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('product.product.delete')
  @ApiOperation({ summary: 'Xóa món' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
