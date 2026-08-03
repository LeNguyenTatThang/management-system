import { Controller, Get, Query, Param } from '@nestjs/common';
import { InventoryReportsService } from './inventory-reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { MovementReportDto } from './dto/report-filter.dto';
import { TopIngredientsDto } from './dto/report-filter.dto';
import { IngredientReportDto } from './dto/report-filter.dto';

@Controller('inventory-reports')
export class InventoryReportsController {
  constructor(private readonly service: InventoryReportsService) {}

  @Get('summary')
  async getSummary(@Query() query: ReportFilterDto) {
    return this.service.getSummary(query);
  }

  @Get('movements')
  async getMovements(@Query() query: MovementReportDto) {
    return this.service.getMovements(query);
  }

  @Get('import-export')
  async getImportExportReport(@Query() query: ReportFilterDto) {
    return this.service.getImportExportReport(query);
  }

  @Get('top-ingredients')
  async getTopIngredients(@Query() query: TopIngredientsDto) {
    return this.service.getTopIngredients(query);
  }

  @Get('low-stock')
  async getLowStockReport(@Query() query: ReportFilterDto) {
    return this.service.getLowStockReport(query);
  }

  @Get('stocktake')
  async getStocktakeReport(@Query() query: ReportFilterDto) {
    return this.service.getStocktakeReport(query);
  }

  @Get('ingredient/:ingredientId')
  async getIngredientReport(
    @Param('ingredientId') ingredientId: string,
    @Query() query: IngredientReportDto,
  ) {
    return this.service.getIngredientReport(Number(ingredientId), query);
  }
}
