import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferStatus } from '@prisma/client';

@Injectable()
export class InventoryTransferService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { status?: TransferStatus; keyword?: string }) {
    const where: Record<string, unknown> = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.keyword) {
      where.OR = [
        { code: { contains: query.keyword } },
        { note: { contains: query.keyword } },
      ];
    }
    return this.prisma.inventoryTransfer.findMany({
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
        transferredBy: { select: { id: true, name: true } },
        cancelledBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const transfer = await this.prisma.inventoryTransfer.findUnique({
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
        transferredBy: { select: { id: true, name: true } },
        cancelledBy: { select: { id: true, name: true } },
      },
    });
    if (!transfer) {
      throw new NotFoundException('Không tìm thấy phiếu chuyển kho');
    }
    return transfer;
  }

  async generateCode() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `CK-${y}${m}${d}`;
    const count = await this.prisma.inventoryTransfer.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateTransferDto, userId: number, userName: string) {
    const code = await this.generateCode();
    const transferDate = dto.transferDate ? new Date(dto.transferDate) : new Date();

    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.inventoryTransfer.create({
        data: {
          code,
          transferDate,
          note: dto.note,
          status: TransferStatus.DRAFT,
          createdById: userId,
          createdByName: userName,
        },
      });

      for (const item of dto.items) {
        const ingredient = await tx.ingredient.findUnique({
          where: { id: item.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(`Nguyên liệu #${item.ingredientId} không tồn tại`);
        }

        const unit = await tx.unit.findUnique({ where: { id: item.unitId } });
        if (!unit) {
          throw new NotFoundException(`Đơn vị #${item.unitId} không tồn tại`);
        }

        await tx.inventoryTransferItem.create({
          data: {
            transferId: transfer.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitId: item.unitId || ingredient.unitId,
            note: item.note,
          },
        });
      }

      return this.findOne(transfer.id);
    });
  }

  async update(id: number, dto: CreateTransferDto) {
    const existing = await this.findOne(id);
    if (existing.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể chỉnh sửa phiếu nháp');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryTransferItem.deleteMany({
        where: { transferId: id },
      });

      for (const item of dto.items) {
        const ingredient = await tx.ingredient.findUnique({
          where: { id: item.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(`Nguyên liệu #${item.ingredientId} không tồn tại`);
        }

        const unit = await tx.unit.findUnique({ where: { id: item.unitId } });
        if (!unit) {
          throw new NotFoundException(`Đơn vị #${item.unitId} không tồn tại`);
        }

        await tx.inventoryTransferItem.create({
          data: {
            transferId: id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitId: item.unitId || ingredient.unitId,
            note: item.note,
          },
        });
      }

      const updateData: Record<string, unknown> = {};
      if (dto.note !== undefined) updateData.note = dto.note;

      if (Object.keys(updateData).length > 0) {
        await tx.inventoryTransfer.update({ where: { id }, data: updateData });
      }

      return this.findOne(id);
    });
  }

  async confirm(id: number, userId?: number) {
    const existing = await this.findOne(id);

    if (existing.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xác nhận phiếu nháp');
    }

    if (!existing.items || existing.items.length === 0) {
      throw new BadRequestException('Phiếu chuyển kho phải có ít nhất một mục');
    }

    const now = new Date();
    const data: Record<string, unknown> = {
      status: TransferStatus.CONFIRMED,
      confirmedAt: now,
      confirmedById: userId,
    };

    await this.prisma.inventoryTransfer.update({ where: { id }, data });
    return this.findOne(id);
  }

  async transfer(id: number, userId?: number) {
    const existing = await this.findOne(id);

    if (existing.status !== TransferStatus.CONFIRMED) {
      throw new BadRequestException('Chỉ có thể thực hiện chuyển kho từ phiếu đã xác nhận');
    }

    if (!existing.items || existing.items.length === 0) {
      throw new BadRequestException('Phiếu chuyển kho phải có ít nhất một mục');
    }

    const now = new Date();
    const data: Record<string, unknown> = {
      status: TransferStatus.TRANSFERRED,
      transferredAt: now,
      transferredById: userId,
    };

    await this.prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        const ingredient = await tx.ingredient.findUnique({
          where: { id: item.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(`Nguyên liệu #${item.ingredientId} không tồn tại`);
        }

        const stockBefore = Number(ingredient.stock);

        await tx.stockMovement.create({
          data: {
            ingredientId: item.ingredientId,
            type: 'TRANSFER',
            direction: 'IN',
            quantity: item.quantity,
            stockBefore,
            stockAfter: stockBefore,
            unitId: item.unitId,
            referenceType: 'INVENTORY_TRANSFER',
            referenceId: existing.id,
            referenceCode: existing.code,
            performedById: userId,
          },
        });
      }

      await tx.inventoryTransfer.update({ where: { id }, data });
    });

    return this.findOne(id);
  }

  async cancel(id: number) {
    const existing = await this.findOne(id);

    if (existing.status === TransferStatus.TRANSFERRED) {
      throw new BadRequestException('Không thể hủy phiếu đã thực hiện chuyển kho');
    }
    if (existing.status === TransferStatus.CANCELLED) {
      throw new BadRequestException('Phiếu đã bị hủy');
    }

    const now = new Date();
    const data: Record<string, unknown> = {
      status: TransferStatus.CANCELLED,
      cancelledAt: now,
    };

    await this.prisma.inventoryTransfer.update({ where: { id }, data });
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (existing.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xóa phiếu nháp');
    }
    await this.prisma.inventoryTransferItem.deleteMany({
      where: { transferId: id },
    });
    await this.prisma.inventoryTransfer.delete({ where: { id } });
  }
}
