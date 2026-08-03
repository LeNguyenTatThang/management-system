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
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';
import { IngredientService } from './ingredient.service';

@ApiTags('ingredients')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  @RequirePermission('product.ingredient.read')
  @ApiOperation({ summary: 'Danh sách nguyên liệu' })
  findAll(@Query() query: QueryIngredientDto) {
    return this.ingredientService.findAll(query);
  }

  @Get('units')
  @RequirePermission('product.ingredient.read')
  @ApiOperation({ summary: 'Danh sách đơn vị' })
  findUnits() {
    return this.ingredientService.findUnits();
  }

  @Get(':id')
  @RequirePermission('product.ingredient.read')
  @ApiOperation({ summary: 'Chi tiết nguyên liệu' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientService.findOne(id);
  }

  @Post()
  @RequirePermission('product.ingredient.create')
  @ApiOperation({ summary: 'Tạo nguyên liệu' })
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('product.ingredient.update')
  @ApiOperation({ summary: 'Cập nhật nguyên liệu' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIngredientDto) {
    return this.ingredientService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('product.ingredient.delete')
  @ApiOperation({ summary: 'Xóa nguyên liệu' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientService.remove(id);
  }
}
