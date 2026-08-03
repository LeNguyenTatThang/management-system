import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';

@Injectable()
export class SetupService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.setup.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const setup = await this.prisma.setup.findUnique({ where: { id } });
    if (!setup) {
      throw new NotFoundException('Không tìm thấy setup');
    }
    return setup;
  }

  async create(dto: CreateSetupDto) {
    const existing = await this.prisma.setup.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Tên setup đã tồn tại');
    }

    return this.prisma.setup.create({
      data: {
        name: dto.name,
        description: dto.description,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateSetupDto) {
    const existing = await this.prisma.setup.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy setup');
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.setup.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('Tên setup đã tồn tại');
      }
    }

    return this.prisma.setup.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        active: dto.active,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.setup.findUnique({
      where: { id },
      include: { _count: { select: { productSetups: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy setup');
    }

    if (existing._count.productSetups > 0) {
      throw new ConflictException('Không thể xóa setup đang được sử dụng bởi món');
    }

    await this.prisma.setup.delete({ where: { id } });
    return { id };
  }
}
