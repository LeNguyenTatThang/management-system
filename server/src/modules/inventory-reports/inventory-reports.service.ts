import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { MovementReportDto } from './dto/report-filter.dto';
import { TopIngredientsDto } from './dto/report-filter.dto';
import { IngredientReportDto } from './dto/report-filter.dto';

@Injectable()
export class InventoryReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateFilter(query: { dateFrom?: string; dateTo?: string }) {
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (query.dateFrom) {
      dateFilter.createdAt = { gte: new Date(query.dateFrom) };
    }
    if (query.dateTo) {
      const endOfDay = new Date(query.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.createdAt = { ...dateFilter.createdAt, lte: endOfDay };
    }
    return dateFilter;
  }

  async getSummary(query: ReportFilterDto) {
    const dateFilter = this.buildDateFilter(query);

    const lowStockCountPromise = this.prisma.$queryRaw<
      [{ count: number }]
    >`
      SELECT COUNT(*)::int AS count
      FROM ingredients
      WHERE status = 'ACTIVE'
        AND min_stock IS NOT NULL
        AND stock < min_stock
    `.then((rows) => Number(rows[0]?.count ?? 0));

    const [
      totalIngredients,
      lowStockCount,
      outOfStockCount,
      totalImportedQuantity,
      totalExportedQuantity,
      totalAdjustedIn,
      totalAdjustedOut,
      importCount,
      exportCount,
      adjustmentCount,
      stocktakeCount,
    ] = await Promise.all([
      this.prisma.ingredient.count({ where: { status: 'ACTIVE' } }),
      lowStockCountPromise,
      this.prisma.ingredient.count({
        where: { status: 'ACTIVE', stock: { equals: 0 } },
      }),
      this.prisma.stockMovement.aggregate({
        where: { type: 'IMPORT', direction: 'IN', createdAt: dateFilter.createdAt },
        _sum: { quantity: true },
      }),
      this.prisma.stockMovement.aggregate({
        where: { type: 'EXPORT', direction: 'OUT', createdAt: dateFilter.createdAt },
        _sum: { quantity: true },
      }),
      this.prisma.stockMovement.aggregate({
        where: { type: 'ADJUSTMENT', direction: 'IN', createdAt: dateFilter.createdAt },
        _sum: { quantity: true },
      }),
      this.prisma.stockMovement.aggregate({
        where: { type: 'ADJUSTMENT', direction: 'OUT', createdAt: dateFilter.createdAt },
        _sum: { quantity: true },
      }),
      this.prisma.inventoryImport.count({
        where: { createdAt: dateFilter.createdAt as any },
      }),
      this.prisma.inventoryExport.count({
        where: { createdAt: dateFilter.createdAt as any },
      }),
      this.prisma.inventoryAdjustment.count({
        where: { createdAt: dateFilter.createdAt as any },
      }),
      this.prisma.inventoryStocktake.count({
        where: { createdAt: dateFilter.createdAt as any },
      }),
    ]);

    return {
      totalIngredients,
      totalStockValue: null,
      lowStockCount,
      outOfStockCount,
      totalImportedQuantity: Number(totalImportedQuantity._sum.quantity ?? 0),
      totalExportedQuantity: Number(totalExportedQuantity._sum.quantity ?? 0),
      totalAdjustedQuantity:
        Number(totalAdjustedIn._sum.quantity ?? 0) +
        Number(totalAdjustedOut._sum.quantity ?? 0),
      importCount,
      exportCount,
      adjustmentCount,
      stocktakeCount,
    };
  }

  async getMovements(query: MovementReportDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const dateFilter = this.buildDateFilter(query);

    const where: Record<string, unknown> = {};

    if (dateFilter.createdAt) {
      where.createdAt = dateFilter.createdAt;
    }

    if (query.ingredientId) {
      where.ingredientId = query.ingredientId;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.direction) {
      where.direction = query.direction;
    }
    if (query.referenceType) {
      where.referenceType = query.referenceType;
    }
    if (query.keyword) {
      where.OR = [
        { ingredient: { name: { contains: query.keyword } } },
        { referenceCode: { contains: query.keyword } },
        { note: { contains: query.keyword } },
      ];
    }

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

  async getImportExportReport(query: ReportFilterDto) {
    const dateFilter = this.buildDateFilter(query);

    const ingredientWhere: Record<string, unknown> = {};
    if (query.ingredientId) {
      ingredientWhere.ingredientId = query.ingredientId;
    }

    const [imported, exported] = await Promise.all([
      this.prisma.stockMovement.aggregate({
        where: { type: 'IMPORT', direction: 'IN', ...dateFilter.createdAt, ...ingredientWhere },
        _sum: { quantity: true },
      }),
      this.prisma.stockMovement.aggregate({
        where: { type: 'EXPORT', direction: 'OUT', ...dateFilter.createdAt, ...ingredientWhere },
        _sum: { quantity: true },
      }),
    ]);

    const importedQty = Number(imported._sum.quantity ?? 0);
    const exportedQty = Number(exported._sum.quantity ?? 0);

    return {
      imported: importedQty,
      exported: exportedQty,
      netMovement: importedQty - exportedQty,
    };
  }

  async getTopIngredients(query: TopIngredientsDto) {
    const dateFilter = this.buildDateFilter(query);
    const limit = query.limit ?? 10;

    const movements = await this.prisma.stockMovement.findMany({
      where: { createdAt: dateFilter.createdAt },
      select: {
        ingredientId: true,
        type: true,
        direction: true,
        quantity: true,
        ingredient: { select: { id: true, name: true, stock: true } },
        unit: { select: { id: true, name: true, symbol: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ingredientMap = new Map<number, { name: string; in: number; out: number }>();

    for (const m of movements) {
      const id = m.ingredientId;
      if (!ingredientMap.has(id)) {
        ingredientMap.set(id, {
          name: m.ingredient.name,
          in: 0,
          out: 0,
        });
      }
      const entry = ingredientMap.get(id)!;
      if (m.direction === 'IN') {
        entry.in += Number(m.quantity);
      } else {
        entry.out += Number(m.quantity);
      }
    }

    const result = Array.from(ingredientMap.entries())
      .map(([id, data]) => ({
        ingredientId: id,
        name: data.name,
        imported: data.in,
        exported: data.out,
        net: data.in - data.out,
      }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
      .slice(0, limit);

    return result;
  }

  async getLowStockReport(query: ReportFilterDto) {
    const ingredients = await this.prisma.ingredient.findMany({
      where: {
        status: 'ACTIVE',
        minStock: { not: null },
      },
      include: {
        unit: { select: { id: true, name: true, symbol: true } },
      },
      orderBy: { stock: 'asc' },
    });

    return ingredients.map((ing) => {
      const minStock = Number(ing.minStock);
      const currentStock = Number(ing.stock);
      const shortage = currentStock < minStock ? minStock - currentStock : 0;
      const status =
        currentStock === 0 ? 'OUT_OF_STOCK' : currentStock < minStock ? 'LOW_STOCK' : 'OK';

      return {
        ingredientId: ing.id,
        name: ing.name,
        currentStock,
        minimumStock: minStock,
        shortage,
        unit: ing.unit.name,
        status,
      };
    });
  }

  async getStocktakeReport(query: ReportFilterDto) {
    const dateFilter = this.buildDateFilter(query);

    const stocktakes = await this.prisma.inventoryStocktake.findMany({
      where: { createdAt: dateFilter.createdAt as any },
      include: {
        items: {
          select: {
            id: true,
            ingredientId: true,
            ingredient: { select: { name: true } },
            systemQuantity: true,
            actualQuantity: true,
            difference: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalPills = stocktakes.length;
    let totalIngredients = 0;
    let totalIncrease = 0;
    let totalDecrease = 0;
    let totalNoDifference = 0;
    let totalDifference = 0;

    for (const st of stocktakes) {
      totalIngredients += st.items.length;
      for (const item of st.items) {
        const diff = Number(item.difference);
        if (diff > 0) totalIncrease += diff;
        else if (diff < 0) totalDecrease += Math.abs(diff);
        else totalNoDifference += 1;
        totalDifference += diff;
      }
    }

    return {
      totalPills,
      totalIngredients,
      totalIncrease,
      totalDecrease,
      totalNoDifference,
      totalDifference,
      stocktakes: stocktakes.map((st) => ({
        id: st.id,
        code: st.code,
        stocktakeDate: st.stocktakeDate,
        status: st.status,
        itemCount: st.items.length,
        totalIncrease: st.items.reduce(
          (s, i) => s + (Number(i.difference) > 0 ? Number(i.difference) : 0),
          0,
        ),
        totalDecrease: st.items.reduce(
          (s, i) => s + (Number(i.difference) < 0 ? Math.abs(Number(i.difference)) : 0),
          0,
        ),
        totalDifference: st.items.reduce((s, i) => s + Number(i.difference), 0),
      })),
    };
  }

  async getIngredientReport(ingredientId: number, query: IngredientReportDto) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
      include: { unit: { select: { id: true, name: true, symbol: true } } },
    });

    if (!ingredient) {
      throw new NotFoundException('Không tìm thấy nguyên liệu');
    }

    const dateFilter = this.buildDateFilter(query);
    const movementWhere: Record<string, unknown> = {
      ingredientId,
      createdAt: dateFilter.createdAt,
    };

    const [movements, importCount, exportCount, adjustmentCount, stocktakeCount] =
      await Promise.all([
        this.prisma.stockMovement.findMany({
          where: movementWhere,
          include: {
            unit: { select: { id: true, name: true, symbol: true } },
            performedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.stockMovement.count({
          where: { ...movementWhere, type: 'IMPORT', direction: 'IN' },
        }),
        this.prisma.stockMovement.count({
          where: { ...movementWhere, type: 'EXPORT', direction: 'OUT' },
        }),
        this.prisma.stockMovement.count({
          where: { ...movementWhere, type: 'ADJUSTMENT' },
        }),
        this.prisma.stockMovement.count({
          where: { ...movementWhere, referenceType: 'INVENTORY_STOCKTAKE' },
        }),
      ]);

    return {
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        stock: Number(ingredient.stock),
        unit: ingredient.unit.name,
        minStock: ingredient.minStock ? Number(ingredient.minStock) : null,
        category: ingredient.category,
        status: ingredient.status,
      },
      totalImported: movements
        .filter((m) => m.type === 'IMPORT' && m.direction === 'IN')
        .reduce((s, m) => s + Number(m.quantity), 0),
      totalExported: movements
        .filter((m) => m.type === 'EXPORT' && m.direction === 'OUT')
        .reduce((s, m) => s + Number(m.quantity), 0),
      totalAdjusted: movements
        .filter((m) => m.type === 'ADJUSTMENT')
        .reduce((s, m) => s + Number(m.quantity), 0),
      totalStocktake: movements
        .filter((m) => m.referenceType === 'INVENTORY_STOCKTAKE')
        .reduce((s, m) => s + Number(m.quantity), 0),
      movementCount: movements.length,
      importCount,
      exportCount,
      adjustmentCount,
      stocktakeCount,
      movements,
    };
  }
}
