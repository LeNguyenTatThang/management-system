import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
import { QueryWorkScheduleDto } from './dto/query-work-schedule.dto';

type ScheduleWithRelations = Prisma.WorkScheduleGetPayload<{
  include: {
    employee: { select: { id: true; name: true; roleId: true; role: { select: { id: true; name: true } } } };
    shift: { select: { id: true; name: true; startTime: true; endTime: true } };
  };
}>;

@Injectable()
export class WorkScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employee: { select: { id: true, name: true, roleId: true, role: { select: { id: true, name: true } } } },
    shift: { select: { id: true, name: true, startTime: true, endTime: true } },
  } satisfies Prisma.WorkScheduleInclude;

  private toResponse(schedule: ScheduleWithRelations) {
    return {
      id: schedule.id,
      employeeId: schedule.employeeId,
      employee: schedule.employee
        ? {
            id: schedule.employee.id,
            name: schedule.employee.name,
            role: schedule.employee.role?.name ?? null,
          }
        : null,
      shiftId: schedule.shiftId,
      shift: schedule.shift ?? null,
      date: schedule.date,
      checkIn: schedule.checkIn,
      checkOut: schedule.checkOut,
      status: schedule.status,
      note: schedule.note,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  async findAll(query: QueryWorkScheduleDto) {
    const where: Prisma.WorkScheduleWhereInput = {};

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }
    if (query.shiftId) {
      where.shiftId = query.shiftId;
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
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) {
        const end = new Date(query.to);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const schedules = await this.prisma.workSchedule.findMany({
      where,
      include: this.includeRelations,
      orderBy: [{ date: 'asc' }, { shiftId: 'asc' }],
    });

    return schedules.map((s) => this.toResponse(s));
  }

  async findOne(id: number) {
    const schedule = await this.prisma.workSchedule.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!schedule) {
      throw new NotFoundException('Không tìm thấy lịch làm việc');
    }

    return this.toResponse(schedule);
  }

  private async validateDto(dto: CreateWorkScheduleDto, excludeId?: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const shift = await this.prisma.shift.findUnique({ where: { id: dto.shiftId } });
    if (!shift) {
      throw new BadRequestException('Ca làm việc không tồn tại');
    }

    if (dto.checkIn && dto.checkOut && dto.checkOut <= dto.checkIn) {
      throw new BadRequestException('Check-out phải sau check-in');
    }

    const where: Prisma.WorkScheduleWhereInput = {
      employeeId: dto.employeeId,
      shiftId: dto.shiftId,
    };

    const dateStart = new Date(dto.date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dto.date);
    dateEnd.setHours(23, 59, 59, 999);
    where.date = { gte: dateStart, lte: dateEnd };

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const existing = await this.prisma.workSchedule.findFirst({ where });
    if (existing) {
      throw new ConflictException('Nhân viên đã có lịch làm việc trong ca này');
    }
  }

  async create(dto: CreateWorkScheduleDto) {
    await this.validateDto(dto);

    const schedule = await this.prisma.workSchedule.create({
      data: {
        employeeId: dto.employeeId,
        date: dto.date,
        shiftId: dto.shiftId,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        note: dto.note,
      },
      include: this.includeRelations,
    });

    return this.toResponse(schedule);
  }

  async update(id: number, dto: UpdateWorkScheduleDto) {
    const existing = await this.prisma.workSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy lịch làm việc');
    }

    const merged = {
      employeeId: dto.employeeId ?? existing.employeeId,
      date: dto.date ?? existing.date,
      shiftId: dto.shiftId ?? existing.shiftId,
      checkIn: dto.checkIn ?? existing.checkIn,
      checkOut: dto.checkOut ?? existing.checkOut,
      note: dto.note ?? existing.note,
    };

    if (dto.employeeId || dto.shiftId || dto.date) {
      await this.validateDto(merged as CreateWorkScheduleDto, id);
    }

    if (dto.checkIn && dto.checkOut && dto.checkOut <= dto.checkIn) {
      throw new BadRequestException('Check-out phải sau check-in');
    }

    const schedule = await this.prisma.workSchedule.update({
      where: { id },
      data: {
        employeeId: dto.employeeId,
        date: dto.date,
        shiftId: dto.shiftId,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        note: dto.note,
      },
      include: this.includeRelations,
    });

    return this.toResponse(schedule);
  }

  async remove(id: number) {
    const existing = await this.prisma.workSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy lịch làm việc');
    }

    await this.prisma.workSchedule.delete({ where: { id } });
    return { id };
  }
}
