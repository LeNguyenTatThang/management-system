import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateImportDto } from './dto/create-import.dto';
import { ImportStatus } from '@prisma/client';

@Injectable()
export class InventoryImportService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: ImportStatus; keyword?: string }) {
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
    return this.prisma.inventoryImport.findMany({
      where,
      include: {
        items: {
          include: {
            ingredient: true,
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const receipt = await this.prisma.inventoryImport.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            ingredient: true,
            unit: true,
          },
        },
      },
    });
    if (!receipt) {
      throw new NotFoundException('Không tìm thấy phiếu nhập kho');
    }
    return receipt;
  }

  async generateCode() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `NK-${y}${m}${d}`;
    const count = await this.prisma.inventoryImport.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateImportDto, userId: number, userName: string) {
    const code = await this.generateCode();
    const importDate = dto.importDate ? new Date(dto.importDate) : new Date();

    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.inventoryImport.create({
        data: {
          code,
          importDate,
          note: dto.note,
          status: ImportStatus.DRAFT,
          createdById: userId,
          createdByName: userName,
        },
      });

      for (const item of dto.items) {
        const ingredient = await tx.ingredient.findUnique({ where: { id: item.ingredientId } });
        if (!ingredient) {
          throw new NotFoundException(`Nguyên liệu #${item.ingredientId} không tồn tại`);
        }
        const amount = (item.quantity || 0) * (item.unitPrice || 0);
        await tx.inventoryImportItem.create({
          data: {
            importId: receipt.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitId: item.unitId || ingredient.unitId,
            unitPrice: item.unitPrice || 0,
            amount,
            expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
            note: item.note,
          },
        });
      }

      return this.findOne(receipt.id);
    });
  }

  async updateStatus(id: number, status: ImportStatus, userId?: number) {
    const existing = await this.findOne(id);

    if (status === ImportStatus.CONFIRMED && existing.status !== ImportStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xác nhận phiếu nháp');
    }
    if (status === ImportStatus.RECEIVED && existing.status !== ImportStatus.CONFIRMED) {
      throw new BadRequestException('Chỉ có thể nhận hàng từ phiếu đã xác nhận');
    }
    if (status === ImportStatus.CANCELLED && existing.status === ImportStatus.RECEIVED) {
      throw new BadRequestException('Không thể hủy phiếu đã nhận hàng');
    }

    const now = new Date();
    const data: any = { status };
    if (status === ImportStatus.CONFIRMED) data.confirmedAt = now;
    if (status === ImportStatus.RECEIVED) data.receivedAt = now;
    if (status === ImportStatus.CANCELLED) data.cancelledAt = now;

    if (status === ImportStatus.RECEIVED) {
      return this.prisma.$transaction(async (tx) => {
        await tx.inventoryImport.update({ where: { id }, data });

        for (const item of existing.items) {
          const ingredient = await tx.ingredient.findUnique({
            where: { id: item.ingredientId },
          });
          if (!ingredient) {
            throw new NotFoundException(`Nguyên liệu #${item.ingredientId} không tồn tại`);
          }

          const stockBefore = Number(ingredient.stock);
          const importQty = Number(item.quantity);
          const stockAfter = stockBefore + importQty;

          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: { stock: stockAfter },
          });

          await tx.stockMovement.create({
            data: {
              ingredientId: item.ingredientId,
              type: 'IMPORT',
              direction: 'IN',
              quantity: importQty,
              stockBefore,
              stockAfter,
              unitId: item.unitId,
              referenceType: 'INVENTORY_IMPORT',
              referenceId: existing.id,
              referenceCode: existing.code,
              performedById: userId,
            },
          });
        }

        return this.findOne(id);
      });
    }

    await this.prisma.inventoryImport.update({ where: { id }, data });
    return this.findOne(id);
  }

  async update(id: number, dto: CreateImportDto) {
    const existing = await this.findOne(id);
    if (existing.status !== ImportStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể chỉnh sửa phiếu nháp');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryImportItem.deleteMany({ where: { importId: id } });

      for (const item of dto.items) {
        const ingredient = await tx.ingredient.findUnique({ where: { id: item.ingredientId } });
        if (!ingredient) {
          throw new NotFoundException(`Nguyên liệu #${item.ingredientId} không tồn tại`);
        }
        const amount = (item.quantity || 0) * (item.unitPrice || 0);
        await tx.inventoryImportItem.create({
          data: {
            importId: id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitId: item.unitId || ingredient.unitId,
            unitPrice: item.unitPrice || 0,
            amount,
            expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
            note: item.note,
          },
        });
      }

      if (dto.note !== undefined) {
        await tx.inventoryImport.update({ where: { id }, data: { note: dto.note } });
      }

      return this.findOne(id);
    });
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (existing.status !== ImportStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xóa phiếu nháp');
    }
    await this.prisma.inventoryImportItem.deleteMany({ where: { importId: id } });
    await this.prisma.inventoryImport.delete({ where: { id } });
  }
}
