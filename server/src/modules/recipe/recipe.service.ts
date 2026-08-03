import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';

type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: {
    product: {
      select: {
        id: true;
        name: true;
        price: true;
        costPrice: true;
        image: true;
        status: true;
      };
    };
    recipeIngredients: {
      include: {
        ingredient: { select: { id: true; name: true; stock: true } };
        unit: { select: { id: true; name: true; symbol: true } };
      };
    };
  };
}>;

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    product: {
      select: {
        id: true,
        name: true,
        price: true,
        costPrice: true,
        image: true,
        status: true,
      },
    },
    recipeIngredients: {
      include: {
        ingredient: { select: { id: true, name: true, stock: true } },
        unit: { select: { id: true, name: true, symbol: true } },
      },
    },
  } satisfies Prisma.RecipeInclude;

  private toResponse(recipe: RecipeWithRelations) {
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      image: recipe.image,
      active: recipe.active,
      productId: recipe.productId,
      product: recipe.product ?? null,
      ingredients: recipe.recipeIngredients.map((ri) => ({
        id: ri.id,
        ingredientId: ri.ingredientId,
        ingredientName: ri.ingredient.name,
        ingredientStock: ri.ingredient.stock,
        unitId: ri.unitId,
        unitName: ri.unit.name,
        unitSymbol: ri.unit.symbol,
        quantity: ri.quantity,
        note: ri.note,
      })),
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  async findAll(query: QueryRecipeDto) {
    const where: Prisma.RecipeWhereInput = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.active !== undefined) {
      where.active = query.active;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { product: { name: { contains: query.search } } },
      ];
    }

    const recipes = await this.prisma.recipe.findMany({
      where,
      include: this.includeRelations,
      orderBy: { name: 'asc' },
    });

    return recipes.map((r) => this.toResponse(r));
  }

  async findOne(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!recipe) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    return this.toResponse(recipe);
  }

  private async validateProduct(productId: number, excludeRecipeId?: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new BadRequestException('Món không tồn tại');
    }

    const existingRecipe = await this.prisma.recipe.findFirst({
      where: {
        productId,
        ...(excludeRecipeId ? { id: { not: excludeRecipeId } } : {}),
      },
    });
    if (existingRecipe) {
      throw new ConflictException('Món này đã có công thức');
    }
  }

  private async validateIngredients(ingredients: { ingredientId: number; unitId: number; quantity: number }[]) {
    const ingredientIds = [...new Set(ingredients.map((i) => i.ingredientId))];
    const unitIds = [...new Set(ingredients.map((i) => i.unitId))];

    const foundIngredients = await this.prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } },
    });
    if (foundIngredients.length !== ingredientIds.length) {
      throw new BadRequestException('Một hoặc nhiều nguyên liệu không tồn tại');
    }

    const foundUnits = await this.prisma.unit.findMany({
      where: { id: { in: unitIds } },
    });
    if (foundUnits.length !== unitIds.length) {
      throw new BadRequestException('Một hoặc nhiều đơn vị không tồn tại');
    }

    for (const ing of ingredients) {
      if (ing.quantity <= 0) {
        throw new BadRequestException('Định lượng phải lớn hơn 0');
      }
    }

    const ingredientIdSet = new Set<number>();
    for (const ing of ingredients) {
      if (ingredientIdSet.has(ing.ingredientId)) {
        throw new BadRequestException('Trùng nguyên liệu trong cùng công thức');
      }
      ingredientIdSet.add(ing.ingredientId);
    }
  }

  async create(dto: CreateRecipeDto) {
    if (dto.productId) {
      await this.validateProduct(dto.productId);
    }

    if (!dto.ingredients || dto.ingredients.length === 0) {
      throw new BadRequestException('Công thức phải có ít nhất 1 nguyên liệu');
    }

    await this.validateIngredients(dto.ingredients);

    return this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          name: dto.name,
          description: dto.description,
          instructions: dto.instructions,
          image: dto.image,
          productId: dto.productId,
          active: dto.active ?? true,
        },
      });

      await tx.recipeIngredient.createMany({
        data: dto.ingredients.map((ing) => ({
          recipeId: recipe.id,
          ingredientId: ing.ingredientId,
          unitId: ing.unitId,
          quantity: ing.quantity,
          note: ing.note,
        })),
      });

      return this.toResponse(
        await tx.recipe.findUnique({
          where: { id: recipe.id },
          include: this.includeRelations,
        }) as RecipeWithRelations,
      );
    });
  }

  async update(id: number, dto: UpdateRecipeDto) {
    const existing = await this.prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    if (dto.productId !== undefined && dto.productId !== existing.productId) {
      await this.validateProduct(dto.productId, id);
    }

    if (dto.ingredients) {
      if (dto.ingredients.length === 0) {
        throw new BadRequestException('Công thức phải có ít nhất 1 nguyên liệu');
      }
      await this.validateIngredients(dto.ingredients);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.recipe.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          instructions: dto.instructions,
          image: dto.image,
          productId: dto.productId,
          active: dto.active,
        },
      });

      if (dto.ingredients) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
        await tx.recipeIngredient.createMany({
          data: dto.ingredients.map((ing) => ({
            recipeId: id,
            ingredientId: ing.ingredientId,
            unitId: ing.unitId,
            quantity: ing.quantity,
            note: ing.note,
          })),
        });
      }

      return this.toResponse(
        await tx.recipe.findUnique({
          where: { id },
          include: this.includeRelations,
        }) as RecipeWithRelations,
      );
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy công thức');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      await tx.recipe.delete({ where: { id } });
    });

    return { id };
  }
}
