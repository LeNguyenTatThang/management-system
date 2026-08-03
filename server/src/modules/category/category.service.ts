import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Tên danh mục đã tồn tại');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        description: dto.description,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.category.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('Tên danh mục đã tồn tại');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        active: dto.active,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    if (existing._count.products > 0) {
      throw new ConflictException('Không thể xóa danh mục đang được sử dụng bởi món');
    }

    await this.prisma.category.delete({ where: { id } });
    return { id };
  }
}
