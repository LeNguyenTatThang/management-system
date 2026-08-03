import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequirePermission } from '../auth/permission.decorator';
import { PermissionGuard } from '../auth/permission.guard';
import { AuthUser } from '../auth/auth.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { EmployeeService } from './employee.service';

@ApiTags('employees')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @RequirePermission('hr.employee.read')
  @ApiOperation({ summary: 'Danh sách nhân viên' })
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeeService.findAll(query);
  }

  @Get('roles')
  @RequirePermission('hr.employee.read')
  @ApiOperation({ summary: 'Danh sách chức vụ đang hoạt động' })
  getRoles() {
    return this.employeeService.getRoles();
  }

  @Get(':id')
  @RequirePermission('hr.employee.read')
  @ApiOperation({ summary: 'Chi tiết nhân viên' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findOne(id);
  }

  @Post()
  @RequirePermission('hr.employee.create')
  @ApiOperation({ summary: 'Tạo nhân viên' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('hr.employee.update')
  @ApiOperation({ summary: 'Cập nhật nhân viên' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('hr.employee.delete')
  @ApiOperation({ summary: 'Xóa nhân viên' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: AuthUser) {
    return this.employeeService.remove(id, currentUser);
  }
}
