import {
  Body,
  Controller,
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
import { AuthUser } from '../auth/auth.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { AttendanceService } from './attendance.service';

@ApiTags('attendance')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @RequirePermission('hr.attendance.read')
  @ApiOperation({ summary: 'Danh sách chấm công' })
  findAll(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('hr.attendance.read')
  @ApiOperation({ summary: 'Chi tiết chấm công' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  @Post()
  @RequirePermission('hr.attendance.create')
  @ApiOperation({ summary: 'Check-in (tạo bản ghi chấm công)' })
  create(@Body() dto: CreateAttendanceDto, @CurrentUser() user: AuthUser) {
    return this.attendanceService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermission('hr.attendance.update')
  @ApiOperation({ summary: 'Cập nhật chấm công (check-out, ghi chú, trạng thái)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.attendanceService.update(id, dto, user);
  }
}
