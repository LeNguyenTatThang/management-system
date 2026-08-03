import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { AdjustmentStatus } from '@prisma/client';

@Injectable()
export class InventoryAdjustmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: AdjustmentStatus; keyword?: string }) {
    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.keyword) {
      where.OR = [
        { code: { contains: query.keyword } },
        { reason: { contains: query.keyword } },
        { note: { contains: query.keyword } },
      ];
    }
    return this.prisma.inventoryAdjustment.findMany({
      where,
      include: {
        items: {
          include: {
            ingredient: true,
            unit: true,
          },
        },
        createdBy: { select: { id: true, name: true } },
        confirmedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const adjustment = await this.prisma.inventoryAdjustment.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            ingredient: true,
            unit: true,
          },
        },
        createdBy: { select: { id: true, name: true } },
        confirmedBy: { select: { id: true, name: true } },
      },
    });
    if (!adjustment) {
      throw new NotFoundException('Không tìm thấy phiếu điều chỉnh kho');
    }
    return adjustment;
  }

  async generateCode() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `DC-${y}${m}${d}`;
    const count = await this.prisma.inventoryAdjustment.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateAdjustmentDto, userId: number, userName: string) {
    const code = await this.generateCode();
    const adjustmentDate = dto.adjustmentDate
      ? new Date(dto.adjustmentDate)
      : new Date();

    return this.prisma.$transaction(async (tx) => {
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          code,
          adjustmentDate,
          type: dto.items[0]?.direction || 'INCREASE',
          reason: dto.reason,
          note: dto.note,
          status: AdjustmentStatus.DRAFT,
          createdById: userId,
          createdByName: userName,
        },
      });

      for (const item of dto.items) {
        const ingredient = await tx.ingredient.findUnique({
          where: { id: item.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(
            `Nguyên liệu #${item.ingredientId} không tồn tại`,
          );
        }

        const unit = await tx.unit.findUnique({ where: { id: item.unitId } });
        if (!unit) {
          throw new NotFoundException(`Đơn vị #${item.unitId} không tồn tại`);
        }

        await tx.inventoryAdjustmentItem.create({
          data: {
            adjustmentId: adjustment.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitId: item.unitId,
            direction: item.direction,
            note: item.note,
          },
        });
      }

      return this.findOne(adjustment.id);
    });
  }

  async update(id: number, dto: CreateAdjustmentDto) {
    const existing = await this.findOne(id);
    if (existing.status !== AdjustmentStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể chỉnh sửa phiếu nháp');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryAdjustmentItem.deleteMany({
        where: { adjustmentId: id },
      });

      for (const item of dto.items) {
        const ingredient = await tx.ingredient.findUnique({
          where: { id: item.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(
            `Nguyên liệu #${item.ingredientId} không tồn tại`,
          );
        }

        const unit = await tx.unit.findUnique({ where: { id: item.unitId } });
        if (!unit) {
          throw new NotFoundException(`Đơn vị #${item.unitId} không tồn tại`);
        }

        await tx.inventoryAdjustmentItem.create({
          data: {
            adjustmentId: id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitId: item.unitId,
            direction: item.direction,
            note: item.note,
          },
        });
      }

      const updateData: any = {};
      if (dto.reason !== undefined) updateData.reason = dto.reason;
      if (dto.note !== undefined) updateData.note = dto.note;
      if (dto.items.length > 0) updateData.type = dto.items[0].direction;

      if (Object.keys(updateData).length > 0) {
        await tx.inventoryAdjustment.update({ where: { id }, data: updateData });
      }

      return this.findOne(id);
    });
  }

  async updateStatus(
    id: number,
    status: AdjustmentStatus,
    userId?: number,
    userName?: string,
  ) {
    const existing = await this.findOne(id);

    if (status === AdjustmentStatus.CONFIRMED && existing.status !== AdjustmentStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xác nhận phiếu nháp');
    }
    if (status === AdjustmentStatus.CANCELLED && existing.status === AdjustmentStatus.CONFIRMED) {
      throw new BadRequestException('Không thể hủy phiếu đã xác nhận');
    }

    const now = new Date();
    const data: any = { status };
    if (status === AdjustmentStatus.CONFIRMED) {
      data.confirmedAt = now;
      data.confirmedById = userId;
    }
    if (status === AdjustmentStatus.CANCELLED) {
      data.cancelledAt = now;
    }

    if (status === AdjustmentStatus.CONFIRMED) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of existing.items) {
          const ingredient = await tx.ingredient.findUnique({
            where: { id: item.ingredientId },
          });
          if (!ingredient) {
            throw new NotFoundException(
              `Nguyên liệu #${item.ingredientId} không tồn tại`,
            );
          }

          const currentStock = Number(ingredient.stock);
          const adjustQty = Number(item.quantity);

          if (item.direction === 'DECREASE' && currentStock < adjustQty) {
            throw new ConflictException(
              `Nguyên liệu "${ingredient.name}" không đủ tồn kho để giảm (hiện có: ${currentStock}, cần giảm: ${adjustQty})`,
            );
          }
        }

        for (const item of existing.items) {
          const qty = Number(item.quantity);
          if (item.direction === 'INCREASE') {
            await tx.ingredient.update({
              where: { id: item.ingredientId },
              data: { stock: { increment: qty } },
            });
          } else {
            await tx.ingredient.update({
              where: { id: item.ingredientId },
              data: { stock: { decrement: qty } },
            });
          }
        }

        await tx.inventoryAdjustment.update({ where: { id }, data });

        return this.findOne(id);
      });
    }

    await this.prisma.inventoryAdjustment.update({ where: { id }, data });
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (existing.status !== AdjustmentStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xóa phiếu nháp');
    }
    await this.prisma.inventoryAdjustmentItem.deleteMany({
      where: { adjustmentId: id },
    });
    await this.prisma.inventoryAdjustment.delete({ where: { id } });
  }
}
