import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockMovementType, StockMovementDirection, ReferenceType } from '@prisma/client';

@Injectable()
export class StockLedgerService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    ingredientId?: number;
    type?: StockMovementType;
    direction?: StockMovementDirection;
    referenceType?: ReferenceType;
    keyword?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (query?.ingredientId) {
      where.ingredientId = query.ingredientId;
    }
    if (query?.type) {
      where.type = query.type;
    }
    if (query?.direction) {
      where.direction = query.direction;
    }
    if (query?.referenceType) {
      where.referenceType = query.referenceType;
    }
    if (query?.keyword) {
      where.OR = [
        { ingredient: { name: { contains: query.keyword } } },
        { referenceCode: { contains: query.keyword } },
        { note: { contains: query.keyword } },
      ];
    }
    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        const dateTo = new Date(query.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        where.createdAt.lte = dateTo;
      }
    }

    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          ingredient: { select: { id: true, name: true, stock: true } },
          unit: { select: { id: true, name: true, symbol: true } },
          performedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        ingredient: true,
        unit: true,
        performedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!movement) {
      throw new Error('Không tìm thấy biến động kho');
    }
    return movement;
  }

  async findByIngredient(ingredientId: number, query?: { page?: number; limit?: number }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const where = { ingredientId };

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          ingredient: { select: { id: true, name: true, stock: true } },
          unit: { select: { id: true, name: true, symbol: true } },
          performedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSummary(query?: { ingredientId?: number; dateFrom?: string; dateTo?: string }) {
    const where: any = {};

    if (query?.ingredientId) {
      where.ingredientId = query.ingredientId;
    }
    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        const dateTo = new Date(query.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        where.createdAt.lte = dateTo;
      }
    }

    const [totalImported, totalExported, totalAdjustedIn, totalAdjustedOut, movementCount] =
      await Promise.all([
        this.prisma.stockMovement.aggregate({
          where: { ...where, type: 'IMPORT', direction: 'IN' },
          _sum: { quantity: true },
        }),
        this.prisma.stockMovement.aggregate({
          where: { ...where, type: 'EXPORT', direction: 'OUT' },
          _sum: { quantity: true },
        }),
        this.prisma.stockMovement.aggregate({
          where: { ...where, type: 'ADJUSTMENT', direction: 'IN' },
          _sum: { quantity: true },
        }),
        this.prisma.stockMovement.aggregate({
          where: { ...where, type: 'ADJUSTMENT', direction: 'OUT' },
          _sum: { quantity: true },
        }),
        this.prisma.stockMovement.count({ where }),
      ]);

    return {
      totalImported: Number(totalImported._sum.quantity || 0),
      totalExported: Number(totalExported._sum.quantity || 0),
      totalAdjustedIn: Number(totalAdjustedIn._sum.quantity || 0),
      totalAdjustedOut: Number(totalAdjustedOut._sum.quantity || 0),
      movementCount,
    };
  }

  async checkConsistency(ingredientId: number) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
      select: { id: true, name: true, stock: true, unitId: true },
    });

    if (!ingredient) {
      throw new Error('Nguyên liệu không tồn tại');
    }

    const movements = await this.prisma.stockMovement.findMany({
      where: { ingredientId },
      select: { quantity: true, direction: true },
    });

    let ledgerStock = 0;
    for (const m of movements) {
      if (m.direction === 'IN') {
        ledgerStock = ledgerStock + Number(m.quantity);
      } else {
        ledgerStock = ledgerStock - Number(m.quantity);
      }
    }

    const currentStock = Number(ingredient.stock);
    const isConsistent = Math.abs(currentStock - ledgerStock) < 0.001;

    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      currentStock,
      ledgerStock,
      difference: currentStock - ledgerStock,
      isConsistent,
      movementCount: movements.length,
    };
  }
}
