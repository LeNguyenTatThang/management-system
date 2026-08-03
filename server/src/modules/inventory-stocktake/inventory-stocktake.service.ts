import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStocktakeDto } from './dto/create-stocktake.dto';
import { StocktakeStatus } from '@prisma/client';

@Injectable()
export class InventoryStocktakeService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: StocktakeStatus; keyword?: string }) {
    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.keyword) {
      where.OR = [
        { code: { contains: query.keyword } },
        { note: { contains: query.keyword } },
      ];
    }
    return this.prisma.inventoryStocktake.findMany({
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
    const stocktake = await this.prisma.inventoryStocktake.findUnique({
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
    if (!stocktake) {
      throw new NotFoundException('Không tìm thấy phiếu kiểm kê kho');
    }
    return stocktake;
  }

  async generateCode() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `KT-${y}${m}${d}`;
    const count = await this.prisma.inventoryStocktake.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateStocktakeDto, userId: number, userName: string) {
    const code = await this.generateCode();
    const stocktakeDate = dto.stocktakeDate
      ? new Date(dto.stocktakeDate)
      : new Date();

    return this.prisma.$transaction(async (tx) => {
      const stocktake = await tx.inventoryStocktake.create({
        data: {
          code,
          stocktakeDate,
          note: dto.note,
          status: StocktakeStatus.DRAFT,
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

        const systemQuantity = Number(ingredient.stock);
        const actualQuantity = Number(item.actualQuantity);
        const difference = actualQuantity - systemQuantity;

        await tx.inventoryStocktakeItem.create({
          data: {
            stocktakeId: stocktake.id,
            ingredientId: item.ingredientId,
            unitId: item.unitId,
            systemQuantity,
            actualQuantity,
            difference,
            note: item.note,
          },
        });
      }

      return this.findOne(stocktake.id);
    });
  }

  async update(id: number, dto: CreateStocktakeDto) {
    const existing = await this.findOne(id);
    if (existing.status !== StocktakeStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể chỉnh sửa phiếu nháp');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryStocktakeItem.deleteMany({
        where: { stocktakeId: id },
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

        const systemQuantity = Number(ingredient.stock);
        const actualQuantity = Number(item.actualQuantity);
        const difference = actualQuantity - systemQuantity;

        await tx.inventoryStocktakeItem.create({
          data: {
            stocktakeId: id,
            ingredientId: item.ingredientId,
            unitId: item.unitId,
            systemQuantity,
            actualQuantity,
            difference,
            note: item.note,
          },
        });
      }

      const updateData: any = {};
      if (dto.note !== undefined) updateData.note = dto.note;

      if (Object.keys(updateData).length > 0) {
        await tx.inventoryStocktake.update({ where: { id }, data: updateData });
      }

      return this.findOne(id);
    });
  }

  async updateStatus(
    id: number,
    status: StocktakeStatus,
    userId?: number,
  ) {
    const existing = await this.findOne(id);

    if (status === StocktakeStatus.CONFIRMED && existing.status !== StocktakeStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xác nhận phiếu nháp');
    }
    if (status === StocktakeStatus.CANCELLED && existing.status === StocktakeStatus.CONFIRMED) {
      throw new BadRequestException('Không thể hủy phiếu đã xác nhận');
    }

    const now = new Date();
    const data: any = { status };
    if (status === StocktakeStatus.CONFIRMED) {
      data.confirmedAt = now;
      data.confirmedById = userId;
    }
    if (status === StocktakeStatus.CANCELLED) {
      data.cancelledAt = now;
    }

    if (status === StocktakeStatus.CONFIRMED) {
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

          const diff = Number(item.difference);
          if (diff === 0) continue;

          const currentStock = Number(ingredient.stock);

          if (diff < 0) {
            const requiredDecrease = Math.abs(diff);
            if (currentStock < requiredDecrease) {
              throw new ConflictException(
                `Nguyên liệu "${ingredient.name}" không đủ tồn kho để giảm (hiện có: ${currentStock}, cần giảm: ${requiredDecrease})`,
              );
            }
          }
        }

        for (const item of existing.items) {
          const diff = Number(item.difference);
          if (diff === 0) continue;

          const ingredient = await tx.ingredient.findUnique({
            where: { id: item.ingredientId },
          });
          if (!ingredient) {
            throw new NotFoundException(
              `Nguyên liệu #${item.ingredientId} không tồn tại`,
            );
          }

          const stockBefore = Number(ingredient.stock);
          const stockAfter = stockBefore + diff;

          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: { stock: stockAfter },
          });

          await tx.stockMovement.create({
            data: {
              ingredientId: item.ingredientId,
              type: 'ADJUSTMENT',
              direction: diff > 0 ? 'IN' : 'OUT',
              quantity: Math.abs(diff),
              stockBefore,
              stockAfter,
              unitId: item.unitId,
              referenceType: 'INVENTORY_STOCKTAKE',
              referenceId: existing.id,
              referenceCode: existing.code,
              performedById: userId,
            },
          });
        }

        await tx.inventoryStocktake.update({ where: { id }, data });

        return this.findOne(id);
      });
    }

    await this.prisma.inventoryStocktake.update({ where: { id }, data });
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (existing.status !== StocktakeStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xóa phiếu nháp');
    }
    await this.prisma.inventoryStocktakeItem.deleteMany({
      where: { stocktakeId: id },
    });
    await this.prisma.inventoryStocktake.delete({ where: { id } });
  }
}
