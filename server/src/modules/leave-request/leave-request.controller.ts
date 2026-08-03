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
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { QueryLeaveRequestDto } from './dto/query-leave-request.dto';
import { LeaveRequestService } from './leave-request.service';

@ApiTags('leave-requests')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Get()
  @RequirePermission('hr.leave.read')
  @ApiOperation({ summary: 'Danh sách đơn xin nghỉ phép' })
  findAll(@Query() query: QueryLeaveRequestDto, @CurrentUser() user: AuthUser) {
    return this.leaveRequestService.findAll(query, user);
  }

  @Get(':id')
  @RequirePermission('hr.leave.read')
  @ApiOperation({ summary: 'Chi tiết đơn xin nghỉ phép' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.leaveRequestService.findOne(id, user);
  }

  @Post()
  @RequirePermission('hr.leave.create')
  @ApiOperation({ summary: 'Tạo đơn xin nghỉ phép' })
  create(@Body() dto: CreateLeaveRequestDto, @CurrentUser() user: AuthUser) {
    return this.leaveRequestService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermission('hr.leave.update')
  @ApiOperation({ summary: 'Cập nhật đơn xin nghỉ phép' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leaveRequestService.update(id, dto, user);
  }

  @Patch(':id/approve')
  @RequirePermission('hr.leave.approve')
  @ApiOperation({ summary: 'Duyệt đơn xin nghỉ phép' })
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.leaveRequestService.approve(id, user);
  }

  @Patch(':id/reject')
  @RequirePermission('hr.leave.reject')
  @ApiOperation({ summary: 'Từ chối đơn xin nghỉ phép' })
  reject(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.leaveRequestService.reject(id, user);
  }
}
