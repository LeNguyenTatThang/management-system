import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';

type IngredientWithRelations = Prisma.IngredientGetPayload<{
  include: {
    unit: { select: { id: true; name: true; symbol: true } };
    supplier: { select: { id: true; name: true } };
  };
}>;

@Injectable()
export class IngredientService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    unit: { select: { id: true, name: true, symbol: true } },
    supplier: { select: { id: true, name: true } },
  } satisfies Prisma.IngredientInclude;

  private toResponse(ingredient: IngredientWithRelations) {
    return {
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description,
      unitId: ingredient.unitId,
      unit: ingredient.unit,
      category: ingredient.category,
      supplierId: ingredient.supplierId,
      supplier: ingredient.supplier ?? null,
      stock: ingredient.stock,
      minStock: ingredient.minStock,
      averageImportPrice: ingredient.averageImportPrice,
      costPrice: ingredient.costPrice,
      isFreeIngredient: ingredient.isFreeIngredient,
      status: ingredient.status,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }

  async findAll(query: QueryIngredientDto) {
    const where: Prisma.IngredientWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.unitId) {
      where.unitId = query.unitId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    const ingredients = await this.prisma.ingredient.findMany({
      where,
      include: this.includeRelations,
      orderBy: { name: 'asc' },
    });

    return ingredients.map((i) => this.toResponse(i));
  }

  async findUnits() {
    return this.prisma.unit.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!ingredient) {
      throw new NotFoundException('Không tìm thấy nguyên liệu');
    }

    return this.toResponse(ingredient);
  }

  async create(dto: CreateIngredientDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
    if (!unit) {
      throw new BadRequestException('Đơn vị không tồn tại');
    }

    const ingredient = await this.prisma.ingredient.create({
      data: {
        name: dto.name,
        description: dto.description,
        unitId: dto.unitId,
        category: dto.category,
        supplierId: dto.supplierId,
        stock: dto.stock ?? 0,
        minStock: dto.minStock,
        costPrice: dto.costPrice,
        isFreeIngredient: dto.isFreeIngredient ?? false,
        status: dto.status ?? 'ACTIVE',
      },
      include: this.includeRelations,
    });

    return this.toResponse(ingredient);
  }

  async update(id: number, dto: UpdateIngredientDto) {
    const existing = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nguyên liệu');
    }

    if (dto.unitId) {
      const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
      if (!unit) {
        throw new BadRequestException('Đơn vị không tồn tại');
      }
    }

    const ingredient = await this.prisma.ingredient.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        unitId: dto.unitId,
        category: dto.category,
        supplierId: dto.supplierId,
        stock: dto.stock,
        minStock: dto.minStock,
        costPrice: dto.costPrice,
        isFreeIngredient: dto.isFreeIngredient,
        status: dto.status,
      },
      include: this.includeRelations,
    });

    return this.toResponse(ingredient);
  }

  async remove(id: number) {
    const existing = await this.prisma.ingredient.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            recipeIngredients: true,
            importItems: true,
            exportItems: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy nguyên liệu');
    }

    if (existing._count.recipeIngredients > 0) {
      throw new ConflictException('Không thể xóa nguyên liệu đang được sử dụng trong công thức');
    }

    if (existing._count.importItems > 0) {
      throw new ConflictException('Không thể xóa nguyên liệu đã có phiếu nhập');
    }

    if (existing._count.exportItems > 0) {
      throw new ConflictException('Không thể xóa nguyên liệu đã có phiếu xuất');
    }

    await this.prisma.ingredient.delete({ where: { id } });
    return { id };
  }
}
