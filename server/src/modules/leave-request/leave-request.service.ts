import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { QueryLeaveRequestDto } from './dto/query-leave-request.dto';
import { AuthUser } from '../auth/auth.service';

type LeaveRequestWithRelations = Prisma.LeaveRequestGetPayload<{
  include: {
    employee: { select: { id: true; name: true; roleId: true; role: { select: { id: true; name: true } } } };
  };
}>;

@Injectable()
export class LeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employee: { select: { id: true, name: true, roleId: true, role: { select: { id: true, name: true } } } },
  } satisfies Prisma.LeaveRequestInclude;

  private toResponse(record: LeaveRequestWithRelations) {
    return {
      id: record.id,
      employeeId: record.employeeId,
      employee: record.employee
        ? { id: record.employee.id, name: record.employee.name, role: record.employee.role?.name ?? null }
        : null,
      startDateTime: record.startDateTime,
      endDateTime: record.endDateTime,
      reason: record.reason,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async checkOverlap(employeeId: number, start: Date, end: Date, excludeId?: number) {
    const where: Prisma.LeaveRequestWhereInput = {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        { startDateTime: { lt: end }, endDateTime: { gt: start } },
      ],
    };

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const existing = await this.prisma.leaveRequest.findFirst({ where });
    return existing;
  }

  async findAll(query: QueryLeaveRequestDto, currentUser: AuthUser) {
    const where: Prisma.LeaveRequestWhereInput = {};

    const isManager = currentUser.roleCode === 'MANAGER' ||
      currentUser.permissions.includes('hr.leave.read');

    if (!isManager) {
      where.employeeId = currentUser.id;
    } else if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.OR = [];
      if (query.from) {
        const from = new Date(query.from);
        where.OR.push({ endDateTime: { gte: from } });
      }
      if (query.to) {
        const to = new Date(query.to);
        where.OR.push({ startDateTime: { lte: to } });
      }
    }

    if (query.search) {
      const searchWhere: Prisma.LeaveRequestWhereInput = {
        OR: [
          { reason: { contains: query.search } },
          { employee: { name: { contains: query.search } } },
        ],
      };
      if (Object.keys(where).length > 0) {
        where.AND = [searchWhere];
      } else {
        Object.assign(where, searchWhere);
      }
    }

    const records = await this.prisma.leaveRequest.findMany({
      where,
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toResponse(r));
  }

  async findOne(id: number, currentUser: AuthUser) {
    const record = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!record) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ phép');
    }

    const isManager = currentUser.roleCode === 'MANAGER' ||
      currentUser.permissions.includes('hr.leave.read');

    if (!isManager && record.employeeId !== currentUser.id) {
      throw new ForbiddenException('Không có quyền xem đơn xin nghỉ phép này');
    }

    return this.toResponse(record);
  }

  async create(dto: CreateLeaveRequestDto, currentUser: AuthUser) {
    const employeeId = currentUser.id;

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const start = new Date(dto.startDateTime);
    const end = new Date(dto.endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Ngày giờ không hợp lệ');
    }

    if (end <= start) {
      throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
    }

    const overlap = await this.checkOverlap(employeeId, start, end);
    if (overlap) {
      throw new ConflictException('Đơn xin nghỉ phép bị trùng với đơn đã có');
    }

    const record = await this.prisma.leaveRequest.create({
      data: {
        employeeId,
        startDateTime: start,
        endDateTime: end,
        reason: dto.reason,
        status: 'PENDING',
      },
      include: this.includeRelations,
    });

    return this.toResponse(record);
  }

  async update(id: number, dto: UpdateLeaveRequestDto, currentUser: AuthUser) {
    const existing = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ phép');
    }

    const isOwner = existing.employeeId === currentUser.id;
    const isManager = currentUser.roleCode === 'MANAGER' ||
      currentUser.permissions.includes('hr.leave.update');

    if (!isOwner && !isManager) {
      throw new ForbiddenException('Không có quyền chỉnh sửa đơn xin nghỉ phép này');
    }

    if (existing.status !== 'PENDING') {
      throw new ConflictException('Chỉ có thể chỉnh sửa đơn đang chờ duyệt');
    }

    const start = dto.startDateTime ? new Date(dto.startDateTime) : existing.startDateTime;
    const end = dto.endDateTime ? new Date(dto.endDateTime) : existing.endDateTime;

    if (end <= start) {
      throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
    }

    if (dto.startDateTime || dto.endDateTime) {
      const overlap = await this.checkOverlap(existing.employeeId, start, end, id);
      if (overlap) {
        throw new ConflictException('Đơn xin nghỉ phép bị trùng với đơn đã có');
      }
    }

    const record = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        startDateTime: dto.startDateTime ? start : undefined,
        endDateTime: dto.endDateTime ? end : undefined,
        reason: dto.reason,
      },
      include: this.includeRelations,
    });

    return this.toResponse(record);
  }

  async approve(id: number, currentUser: AuthUser) {
    const existing = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ phép');
    }

    if (existing.status !== 'PENDING') {
      throw new ConflictException('Chỉ có thể duyệt đơn đang chờ duyệt');
    }

    const overlap = await this.checkOverlap(existing.employeeId, existing.startDateTime, existing.endDateTime, id);
    if (overlap) {
      throw new ConflictException('Không thể duyệt đơn bị trùng với đơn đã được duyệt');
    }

    const record = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: this.includeRelations,
    });

    return this.toResponse(record);
  }

  async reject(id: number, currentUser: AuthUser) {
    const existing = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ phép');
    }

    if (existing.status !== 'PENDING') {
      throw new ConflictException('Chỉ có thể từ chối đơn đang chờ duyệt');
    }

    const record = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: this.includeRelations,
    });

    return this.toResponse(record);
  }
}
