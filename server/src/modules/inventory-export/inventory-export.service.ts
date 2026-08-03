import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExportDto } from './dto/create-export.dto';
import { ExportStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryExportService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: ExportStatus; keyword?: string }) {
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
    return this.prisma.inventoryExport.findMany({
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
        exportedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const receipt = await this.prisma.inventoryExport.findUnique({
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
        exportedBy: { select: { id: true, name: true } },
      },
    });
    if (!receipt) {
      throw new NotFoundException('Không tìm thấy phiếu xuất kho');
    }
    return receipt;
  }

  async generateCode() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `XK-${y}${m}${d}`;
    const count = await this.prisma.inventoryExport.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateExportDto, userId: number, userName: string) {
    const code = await this.generateCode();
    const exportDate = dto.exportDate ? new Date(dto.exportDate) : new Date();

    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.inventoryExport.create({
        data: {
          code,
          exportDate,
          exportType: dto.exportType,
          note: dto.note,
          status: ExportStatus.DRAFT,
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

        const unitId = item.unitId || ingredient.unitId;
        const unit = await tx.unit.findUnique({ where: { id: unitId } });
        if (!unit) {
          throw new NotFoundException(`Đơn vị #${unitId} không tồn tại`);
        }

        await tx.inventoryExportItem.create({
          data: {
            exportId: receipt.id,
            ingredientId: item.ingredientId,
            requestedQuantity: item.quantity,
            unitId,
            note: item.note,
          },
        });
      }

      return this.findOne(receipt.id);
    });
  }

  async update(id: number, dto: CreateExportDto) {
    const existing = await this.findOne(id);
    if (existing.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể chỉnh sửa phiếu nháp');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryExportItem.deleteMany({
        where: { exportId: id },
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

        const unitId = item.unitId || ingredient.unitId;
        const unit = await tx.unit.findUnique({ where: { id: unitId } });
        if (!unit) {
          throw new NotFoundException(`Đơn vị #${unitId} không tồn tại`);
        }

        await tx.inventoryExportItem.create({
          data: {
            exportId: id,
            ingredientId: item.ingredientId,
            requestedQuantity: item.quantity,
            unitId,
            note: item.note,
          },
        });
      }

      if (dto.note !== undefined) {
        await tx.inventoryExport.update({
          where: { id },
          data: { note: dto.note },
        });
      }

      if (dto.exportType !== undefined) {
        await tx.inventoryExport.update({
          where: { id },
          data: { exportType: dto.exportType },
        });
      }

      return this.findOne(id);
    });
  }

  async updateStatus(id: number, status: ExportStatus, userId?: number, userName?: string) {
    const existing = await this.findOne(id);

    if (status === ExportStatus.CONFIRMED && existing.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xác nhận phiếu nháp');
    }
    if (status === ExportStatus.EXPORTED && existing.status !== ExportStatus.CONFIRMED) {
      throw new BadRequestException('Chỉ có thể xuất kho từ phiếu đã xác nhận');
    }
    if (status === ExportStatus.CANCELLED && existing.status === ExportStatus.EXPORTED) {
      throw new BadRequestException('Không thể hủy phiếu đã xuất kho');
    }

    const now = new Date();
    const data: any = { status };
    if (status === ExportStatus.CONFIRMED) {
      data.confirmedAt = now;
      data.confirmedById = userId;
    }
    if (status === ExportStatus.EXPORTED) {
      data.exportedAt = now;
      data.exportedById = userId;
    }
    if (status === ExportStatus.CANCELLED) {
      data.cancelledAt = now;
    }

    if (status === ExportStatus.EXPORTED) {
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
          const exportQty = Number(item.requestedQuantity);

          if (currentStock < exportQty) {
            throw new ConflictException(
              `Nguyên liệu "${ingredient.name}" không đủ tồn kho (hiện có: ${currentStock}, cần: ${exportQty})`,
            );
          }
        }

        for (const item of existing.items) {
          const ingredient = await tx.ingredient.findUnique({
            where: { id: item.ingredientId },
          });
          if (!ingredient) {
            throw new NotFoundException(
              `Nguyên liệu #${item.ingredientId} không tồn tại`,
            );
          }
          const stockBefore = Number(ingredient.stock);
          const exportQty = Number(item.requestedQuantity);
          const stockAfter = stockBefore - exportQty;

          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: { stock: stockAfter },
          });

          await tx.stockMovement.create({
            data: {
              ingredientId: item.ingredientId,
              type: 'EXPORT',
              direction: 'OUT',
              quantity: exportQty,
              stockBefore,
              stockAfter,
              unitId: item.unitId,
              referenceType: 'INVENTORY_EXPORT',
              referenceId: existing.id,
              referenceCode: existing.code,
              performedById: userId,
            },
          });
        }

        await tx.inventoryExport.update({ where: { id }, data });

        return this.findOne(id);
      });
    }

    await this.prisma.inventoryExport.update({ where: { id }, data });
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (existing.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xóa phiếu nháp');
    }
    await this.prisma.inventoryExportItem.deleteMany({
      where: { exportId: id },
    });
    await this.prisma.inventoryExport.delete({ where: { id } });
  }
}
