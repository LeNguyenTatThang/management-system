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
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { RecipeService } from './recipe.service';

@ApiTags('recipes')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  @RequirePermission('product.recipe.read')
  @ApiOperation({ summary: 'Danh sách công thức' })
  findAll(@Query() query: QueryRecipeDto) {
    return this.recipeService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('product.recipe.read')
  @ApiOperation({ summary: 'Chi tiết công thức' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipeService.findOne(id);
  }

  @Post()
  @RequirePermission('product.recipe.create')
  @ApiOperation({ summary: 'Tạo công thức' })
  create(@Body() dto: CreateRecipeDto) {
    return this.recipeService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('product.recipe.update')
  @ApiOperation({ summary: 'Cập nhật công thức' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecipeDto) {
    return this.recipeService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('product.recipe.delete')
  @ApiOperation({ summary: 'Xóa công thức' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recipeService.remove(id);
  }
}
