import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequirePermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
import { QueryWorkScheduleDto } from './dto/query-work-schedule.dto';
import { WorkScheduleService } from './work-schedule.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('work-schedules')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('work-schedules')
export class WorkScheduleController {
  constructor(
    private readonly workScheduleService: WorkScheduleService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @RequirePermission('hr.schedule.read')
  @ApiOperation({ summary: 'Danh sách lịch làm việc' })
  findAll(@Query() query: QueryWorkScheduleDto) {
    return this.workScheduleService.findAll(query);
  }

  @Get('shifts')
  @RequirePermission('hr.schedule.read')
  @ApiOperation({ summary: 'Danh sách ca làm việc' })
  async getShifts() {
    return this.prisma.shift.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });
  }

  @Get(':id')
  @RequirePermission('hr.schedule.read')
  @ApiOperation({ summary: 'Chi tiết lịch làm việc' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workScheduleService.findOne(id);
  }

  @Post()
  @RequirePermission('hr.schedule.create')
  @ApiOperation({ summary: 'Tạo lịch làm việc' })
  create(@Body() dto: CreateWorkScheduleDto) {
    return this.workScheduleService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('hr.schedule.update')
  @ApiOperation({ summary: 'Cập nhật lịch làm việc' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkScheduleDto) {
    return this.workScheduleService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('hr.schedule.delete')
  @ApiOperation({ summary: 'Xóa lịch làm việc' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workScheduleService.remove(id);
  }
}
