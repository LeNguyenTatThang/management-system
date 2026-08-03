import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roleId: number | null;
  roleCode: string | null;
  roleName: string | null;
  permissions: string[];
}

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<AuthUser> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!employee) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    return this.toAuthUser(employee);
  }

  private toAuthUser(employee: {
    id: number;
    name: string;
    email: string;
    roleId: number | null;
    role?: { id: number; code: string; name: string; rolePermissions: { permission: { group: string; module: string; key: string } }[] } | null;
  }): AuthUser {
    const role = employee.role ?? null;
    const permissions =
      role?.rolePermissions?.map((rp) => `${rp.permission.group}.${rp.permission.module}.${rp.permission.key}`) ?? [];

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      roleId: employee.roleId,
      roleCode: role?.code ?? null,
      roleName: role?.name ?? null,
      permissions,
    };
  }

  async login(dto: LoginDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { email: dto.email },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!employee) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (employee.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const passwordOk = await bcrypt.compare(dto.password, employee.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload: JwtPayload = { sub: employee.id, email: employee.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const user = this.toAuthUser(employee);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleCode: user.roleCode,
        roleName: user.roleName,
      },
      permissions: user.permissions,
    };
  }
}