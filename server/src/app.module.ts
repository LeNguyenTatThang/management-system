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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
