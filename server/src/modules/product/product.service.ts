import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: { select: { id: true; name: true } };
    productSetups: { include: { setup: { select: { id: true; name: true; description: true } } } };
  };
}>;

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    category: { select: { id: true, name: true } },
    productSetups: {
      include: { setup: { select: { id: true, name: true, description: true } } },
    },
  } satisfies Prisma.ProductInclude;

  private toResponse(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      image: product.image,
      size: product.size,
      categoryId: product.categoryId,
      category: product.category ?? null,
      status: product.status,
      setups: product.productSetups.map((ps) => ({
        id: ps.setup.id,
        name: ps.setup.name,
        description: ps.setup.description,
        quantity: ps.quantity,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async findAll(query: QueryProductDto) {
    const where: Prisma.ProductWhereInput = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: this.includeRelations,
      orderBy: { name: 'asc' },
    });

    return products.map((p) => this.toResponse(p));
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy món');
    }

    return this.toResponse(product);
  }

  private async validateCategory(categoryId?: number | null) {
    if (categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        throw new BadRequestException('Danh mục không tồn tại');
      }
    }
  }

  private async validateSetups(setupIds: number[]) {
    if (setupIds.length > 0) {
      const setups = await this.prisma.setup.findMany({
        where: { id: { in: setupIds } },
      });
      if (setups.length !== setupIds.length) {
        throw new BadRequestException('Một hoặc nhiều setup không tồn tại');
      }
    }
  }

  private async syncSetups(productId: number, setupIds: number[]) {
    await this.prisma.productSetup.deleteMany({ where: { productId } });

    if (setupIds.length > 0) {
      await this.prisma.productSetup.createMany({
        data: setupIds.map((setupId) => ({
          productId,
          setupId,
          quantity: 1,
        })),
      });
    }
  }

  async create(dto: CreateProductDto) {
    await this.validateCategory(dto.categoryId);

    if (dto.setupIds && dto.setupIds.length > 0) {
      await this.validateSetups(dto.setupIds);
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        costPrice: dto.costPrice,
        image: dto.image,
        size: dto.size,
        categoryId: dto.categoryId,
        status: dto.status ?? 'ACTIVE',
      },
      include: this.includeRelations,
    });

    if (dto.setupIds && dto.setupIds.length > 0) {
      await this.syncSetups(product.id, dto.setupIds);
    }

    return this.toResponse(
      await this.prisma.product.findUnique({
        where: { id: product.id },
        include: this.includeRelations,
      }) as ProductWithRelations,
    );
  }

  async update(id: number, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy món');
    }

    if (dto.categoryId) {
      await this.validateCategory(dto.categoryId);
    }

    if (dto.setupIds) {
      await this.validateSetups(dto.setupIds);
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        costPrice: dto.costPrice,
        image: dto.image,
        size: dto.size,
        categoryId: dto.categoryId,
        status: dto.status,
      },
    });

    if (dto.setupIds !== undefined) {
      await this.syncSetups(id, dto.setupIds);
    }

    return this.toResponse(
      await this.prisma.product.findUnique({
        where: { id },
        include: this.includeRelations,
      }) as ProductWithRelations,
    );
  }

  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            promotionProducts: true,
          },
        },
        recipe: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy món');
    }

    if (existing._count.orderItems > 0) {
      throw new ConflictException('Không thể xóa món đã có trong đơn hàng');
    }

    if (existing.recipe) {
      throw new ConflictException('Không thể xóa món đang có công thức');
    }

    if (existing._count.promotionProducts > 0) {
      throw new ConflictException('Không thể xóa món đang trong chương trình khuyến mãi');
    }

    await this.prisma.productSetup.deleteMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });
    return { id };
  }
}
