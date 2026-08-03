import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// SEED DATA (development only)
// Basic reference data: roles, shifts, units, categories.
// Do NOT put real employees/products/orders here.
// ============================================================

const roles = [
  { name: 'Quản lý', code: 'MANAGER', description: 'Quản lý vận hành quán', isSystem: true },
  { name: 'Nhân viên pha chế', code: 'BARISTA', description: 'Nhân viên pha chế', isSystem: true },
  { name: 'Thu ngân', code: 'CASHIER', description: 'Nhân viên thu ngân', isSystem: true },
  { name: 'Phục vụ', code: 'SERVER', description: 'Nhân viên phục vụ', isSystem: true },
];

const shifts = [
  { name: 'Sáng', description: 'Ca sáng', startTime: '06:00', endTime: '12:00' },
  { name: 'Trưa', description: 'Ca trưa', startTime: '11:00', endTime: '14:00' },
  { name: 'Chiều', description: 'Ca chiều', startTime: '14:00', endTime: '20:00' },
  { name: 'Tối', description: 'Ca tối', startTime: '18:00', endTime: '22:00' },
];

const units = [
  { name: 'kg', symbol: 'kg', description: 'Kilogram' },
  { name: 'g', symbol: 'g', description: 'Gram' },
  { name: 'l', symbol: 'l', description: 'Lít' },
  { name: 'ml', symbol: 'ml', description: 'Milliliter' },
  { name: 'cái', symbol: 'cái', description: 'Cái' },
  { name: 'chai', symbol: 'chai', description: 'Chai' },
  { name: 'hộp', symbol: 'hộp', description: 'Hộp' },
];

const categories = [
  { name: 'Cà phê', description: 'Cà phê và các loại đồ uống cà phê' },
  { name: 'Trà', description: 'Các loại trà' },
  { name: 'Trà sữa', description: 'Trà sữa và topping' },
  { name: 'Đá xay', description: 'Đồ uống đá xay' },
  { name: 'Sinh tố', description: 'Sinh tố trái cây' },
  { name: 'Bánh', description: 'Bánh ngọt và đồ ăn nhẹ' },
  { name: 'Khác', description: 'Các loại khác' },
];

const permissionGroups = [
  { group: 'hr', module: 'employee', label: 'Nhân viên', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'hr', module: 'schedule', label: 'Lịch làm việc', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'hr', module: 'attendance', label: 'Chấm công', permissions: ['read', 'create', 'update'] },
  { group: 'hr', module: 'leave', label: 'Xin nghỉ phép', permissions: ['read', 'create', 'update', 'approve', 'reject'] },
  { group: 'product', module: 'product', label: 'Món', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'product', module: 'category', label: 'Danh mục món', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'product', module: 'setup', label: 'Setup phụ kiện', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'product', module: 'recipe', label: 'Công thức', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'product', module: 'ingredient', label: 'Nguyên liệu', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'inventory', module: 'import', label: 'Nhập kho', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'inventory', module: 'export', label: 'Xuất kho', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'inventory', module: 'adjustment', label: 'Điều chỉnh kho', permissions: ['read', 'create', 'update', 'delete'] },
  { group: 'inventory', module: 'stockLedger', label: 'Biến động kho', permissions: ['read'] },
  { group: 'inventory', module: 'stocktake', label: 'Kiểm kê kho', permissions: ['read', 'create', 'update', 'delete'] },
];

// Permissions granted to the MANAGER role (seed development only)
const managerPermissions = ['employee.read', 'employee.create', 'employee.update', 'employee.delete'];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  for (const shift of shifts) {
    const existing = await prisma.shift.findFirst({ where: { name: shift.name } });
    if (!existing) {
      await prisma.shift.create({ data: shift });
    }
  }

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit,
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  for (const pg of permissionGroups) {
    for (const key of pg.permissions) {
      await prisma.permission.upsert({
        where: { group_module_key: { group: pg.group, module: pg.module, key } },
        update: {},
        create: {
          group: pg.group,
          module: pg.module,
          key,
          label: `${pg.label} - ${key}`,
        },
      });
    }
  }

  const managerRole = await prisma.role.findUnique({ where: { code: 'MANAGER' } });
  if (managerRole) {
    const perms = await prisma.permission.findMany({
      where: { group: { in: ['hr', 'product', 'inventory'] } },
    });
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: managerRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: managerRole.id, permissionId: perm.id },
      });
    }
  }

  const manager = await prisma.employee.upsert({
    where: { email: 'dez@gmail.com' },
    update: {},
    create: {
      name: 'Quản lý DEZ LAB',
      email: 'dez@gmail.com',
      phone: '0900000000',
      password: await bcrypt.hash('123456', 10),
      roleId: managerRole?.id ?? null,
      status: 'ACTIVE',
      salaryType: 'MONTHLY',
      monthlyLeaveDays: 0,
      remainingLeaveDays: 0,
    },
  });
  if (!manager.password.startsWith('$2')) {
    console.warn('Manager password not properly hashed');
  }

  console.log('Seed completed: roles, shifts, units, categories, permissions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
