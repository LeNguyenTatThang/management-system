import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { AuthUser } from '../auth/auth.service';

type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
  include: {
    employee: { select: { id: true; name: true; roleId: true; role: { select: { id: true; name: true } } } };
    schedule: { select: { id: true; shiftId: true; shift: { select: { id: true; name: true; startTime: true; endTime: true } } } };
  };
}>;

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employee: { select: { id: true, name: true, roleId: true, role: { select: { id: true, name: true } } } },
    schedule: {
      select: {
        id: true,
        shiftId: true,
        shift: { select: { id: true, name: true, startTime: true, endTime: true } },
      },
    },
  } satisfies Prisma.AttendanceInclude;

  private toResponse(record: AttendanceWithRelations) {
    return {
      id: record.id,
      employeeId: record.employeeId,
      employee: record.employee
        ? { id: record.employee.id, name: record.employee.name, role: record.employee.role?.name ?? null }
        : null,
      date: record.date,
      scheduleId: record.scheduleId,
      schedule: record.schedule
        ? { id: record.schedule.id, shift: record.schedule.shift }
        : null,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      scheduledStart: record.scheduledStart,
      scheduledEnd: record.scheduledEnd,
      workedMinutes: record.workedMinutes,
      lateMinutes: record.lateMinutes,
      earlyLeaveMinutes: record.earlyLeaveMinutes,
      status: record.status,
      note: record.note,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async findAll(query: QueryAttendanceDto) {
    const where: Prisma.AttendanceWhereInput = {};

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    if (query.from || query.to) {
      where.date = {};
      if (query.from) {
        const from = new Date(query.from);
        from.setHours(0, 0, 0, 0);
        where.date.gte = from;
      }
      if (query.to) {
        const to = new Date(query.to);
        to.setHours(23, 59, 59, 999);
        where.date.lte = to;
      }
    }

    if (query.status) {
      where.status = query.status;
    }

    const records = await this.prisma.attendance.findMany({
      where,
      include: this.includeRelations,
      orderBy: [{ date: 'desc' }, { checkIn: 'desc' }],
    });

    return records.map((r) => this.toResponse(r));
  }

  async findOne(id: number) {
    const record = await this.prisma.attendance.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!record) {
      throw new NotFoundException('Không tìm thấy bản ghi chấm công');
    }

    return this.toResponse(record);
  }

  private diffMinutes(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  }

  private formatTimeFromDate(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private findBestSchedule(
    schedules: { id: number; shift: { startTime: string | null; endTime: string | null } | null }[],
    checkInTime: string,
  ) {
    if (!schedules.length) return null;

    let best = schedules[0];
    let bestDiff = Infinity;

    for (const s of schedules) {
      if (!s.shift?.startTime) continue;
      const diff = Math.abs(this.diffMinutes(s.shift.startTime, checkInTime));
      if (diff < bestDiff) {
        bestDiff = diff;
        best = s;
      }
    }

    return best;
  }

  async create(dto: CreateAttendanceDto, currentUser: AuthUser) {
    const targetEmployeeId = currentUser.id;

    const employee = await this.prisma.employee.findUnique({ where: { id: targetEmployeeId } });
    if (!employee) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dto.date);
    dateEnd.setHours(23, 59, 59, 999);

    const existing = await this.prisma.attendance.findFirst({
      where: { employeeId: targetEmployeeId, date: { gte: date, lte: dateEnd } },
    });
    if (existing) {
      throw new ConflictException('Nhân viên đã có bản ghi chấm công cho ngày này');
    }

    const schedules = await this.prisma.workSchedule.findMany({
      where: { employeeId: targetEmployeeId, date: { gte: date, lte: dateEnd } },
      include: { shift: { select: { id: true, startTime: true, endTime: true, name: true } } },
    });

    const now = new Date();
    const checkInTime = this.formatTimeFromDate(now);

    const matchedSchedule = this.findBestSchedule(schedules, checkInTime);

    let scheduledStart: string | null = null;
    let scheduledEnd: string | null = null;
    let scheduleId: number | null = null;

    if (matchedSchedule && matchedSchedule.shift) {
      scheduledStart = matchedSchedule.shift.startTime;
      scheduledEnd = matchedSchedule.shift.endTime;
      scheduleId = matchedSchedule.id;
    }

    const lateMinutes = scheduledStart && checkInTime > scheduledStart
      ? this.diffMinutes(scheduledStart, checkInTime)
      : 0;

    const status: AttendanceStatus = lateMinutes > 0 ? 'LATE' : 'WORKING';

    const record = await this.prisma.attendance.create({
      data: {
        employeeId: targetEmployeeId,
        date,
        scheduleId,
        checkIn: now,
        scheduledStart,
        scheduledEnd,
        lateMinutes: lateMinutes > 0 ? lateMinutes : null,
        status,
        note: dto.note,
      },
      include: this.includeRelations,
    });

    return this.toResponse(record);
  }

  async update(id: number, dto: UpdateAttendanceDto, currentUser: AuthUser) {
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bản ghi chấm công');
    }

    const data: Prisma.AttendanceUpdateInput = {};

    if (dto.note !== undefined) {
      data.note = dto.note;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    const now = new Date();
    const isSelfCheckOut = dto.note === undefined && dto.status === undefined;

    if (isSelfCheckOut) {
      if (!existing.checkIn) {
        throw new BadRequestException('Chưa check-in, không thể check-out');
      }
      if (existing.checkOut) {
        throw new BadRequestException('Đã check-out rồi');
      }

      const checkOutTime = this.formatTimeFromDate(now);
      const checkInTime = this.formatTimeFromDate(existing.checkIn);

      const workedMinutes = this.diffMinutes(checkInTime, checkOutTime);

      let earlyLeaveMinutes = 0;
      if (existing.scheduledEnd && checkOutTime < existing.scheduledEnd) {
        earlyLeaveMinutes = this.diffMinutes(checkOutTime, existing.scheduledEnd);
      }

      let finalStatus: AttendanceStatus;
      if (existing.lateMinutes && existing.lateMinutes > 0 && earlyLeaveMinutes > 0) {
        finalStatus = 'LATE_EARLY';
      } else if (existing.lateMinutes && existing.lateMinutes > 0) {
        finalStatus = 'LATE';
      } else if (earlyLeaveMinutes > 0) {
        finalStatus = 'EARLY_LEAVE';
      } else {
        finalStatus = 'COMPLETED';
      }

      data.checkOut = now;
      data.workedMinutes = workedMinutes;
      data.earlyLeaveMinutes = earlyLeaveMinutes > 0 ? earlyLeaveMinutes : null;
      data.status = finalStatus;
    }

    const record = await this.prisma.attendance.update({
      where: { id },
      data,
      include: this.includeRelations,
    });

    return this.toResponse(record);
  }
}
