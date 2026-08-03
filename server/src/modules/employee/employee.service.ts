import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

type EmployeeWithRole = Prisma.EmployeeGetPayload<{
  include: { role: { select: { id: true; name: true } } };
}>;

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly employeeInclude = {
    role: { select: { id: true, name: true } },
  } satisfies Prisma.EmployeeInclude;

  private toResponse(employee: EmployeeWithRole) {
    const { password, roleId, ...rest } = employee;
    return {
      ...rest,
      roleId,
      role: employee.role?.name ?? null,
    };
  }

  async findAll(query: QueryEmployeeDto) {
    const where: Prisma.EmployeeWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.roleId) {
      where.roleId = query.roleId;
    }

    const employees = await this.prisma.employee.findMany({
      where,
      include: this.employeeInclude,
      orderBy: { createdAt: 'desc' },
    });

    return employees.map((employee) => this.toResponse(employee));
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: this.employeeInclude,
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return this.toResponse(employee);
  }

  async getRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  private async ensureUnique(email: string | undefined, citizenId: string | undefined, excludeId?: number) {
    const where: Prisma.EmployeeWhereInput = { OR: [] };

    if (email) {
      where.OR!.push({ email });
    }
    if (citizenId) {
      where.OR!.push({ citizenId });
    }

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const existing = await this.prisma.employee.findFirst({ where });

    if (existing) {
      if (email && existing.email === email) {
        throw new ConflictException('Email đã được sử dụng');
      }
      if (citizenId && existing.citizenId === citizenId) {
        throw new ConflictException('CCCD/CMND đã được sử dụng');
      }
    }
  }

  async create(dto: CreateEmployeeDto) {
    await this.ensureUnique(dto.email, dto.citizenId);

    const employee = await this.prisma.employee.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        citizenId: dto.citizenId,
        address: dto.address,
        avatar: dto.avatar,
        password: await bcrypt.hash(dto.password, 10),
        roleId: dto.roleId,
        startDate: dto.startDate,
        status: dto.status ?? 'ACTIVE',
        salaryType: dto.salaryType,
        salary: dto.salary,
        monthlyLeaveDays: dto.monthlyLeaveDays ?? 0,
        remainingLeaveDays: dto.remainingLeaveDays ?? 0,
        note: dto.note,
      },
      include: this.employeeInclude,
    });

    return this.toResponse(employee);
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    if (dto.email || dto.citizenId) {
      await this.ensureUnique(dto.email, dto.citizenId, id);
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        citizenId: dto.citizenId,
        address: dto.address,
        avatar: dto.avatar,
        ...(dto.password ? { password: await bcrypt.hash(dto.password, 10) } : {}),
        roleId: dto.roleId,
        startDate: dto.startDate,
        status: dto.status,
        salaryType: dto.salaryType,
        salary: dto.salary,
        monthlyLeaveDays: dto.monthlyLeaveDays,
        remainingLeaveDays: dto.remainingLeaveDays,
        note: dto.note,
      },
      include: this.employeeInclude,
    });

    return this.toResponse(employee);
  }

  async remove(id: number, currentUser: { id: number; roleCode?: string | null }) {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    if (currentUser.id === id) {
      throw new ForbiddenException('Không thể xóa chính mình');
    }

    if (existing.role?.code === 'MANAGER') {
      const managerCount = await this.prisma.employee.count({
        where: { role: { code: 'MANAGER' }, status: 'ACTIVE' },
      });
      if (managerCount <= 1) {
        throw new ForbiddenException('Không thể xóa quản lý cuối cùng');
      }
    }

    await this.prisma.employee.delete({ where: { id } });
    return { id };
  }
}