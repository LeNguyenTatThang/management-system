import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { WorkScheduleModule } from './modules/work-schedule/work-schedule.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveRequestModule } from './modules/leave-request/leave-request.module';
import { CategoryModule } from './modules/category/category.module';
import { SetupModule } from './modules/setup/setup.module';
import { ProductModule } from './modules/product/product.module';
import { IngredientModule } from './modules/ingredient/ingredient.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { InventoryImportModule } from './modules/inventory-import/inventory-import.module';
import { InventoryExportModule } from './modules/inventory-export/inventory-export.module';
import { InventoryAdjustmentModule } from './modules/inventory-adjustment/inventory-adjustment.module';
import { StockLedgerModule } from './modules/stock-ledger/stock-ledger.module';
import { InventoryStocktakeModule } from './modules/inventory-stocktake/inventory-stocktake.module';
import { InventoryReportsModule } from './modules/inventory-reports/inventory-reports.module';
import { InventoryTransferModule } from './modules/inventory-transfer/inventory-transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    EmployeeModule,
    WorkScheduleModule,
    AttendanceModule,
    LeaveRequestModule,
    CategoryModule,
    SetupModule,
    ProductModule,
    IngredientModule,
    RecipeModule,
    InventoryImportModule,
    InventoryExportModule,
    InventoryAdjustmentModule,
    StockLedgerModule,
    InventoryStocktakeModule,
    InventoryReportsModule,
    InventoryTransferModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
