export const PERMISSION_MODULES = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    permissions: [
      { key: 'view', label: 'Xem' },
    ],
  },
  {
    key: 'orders',
    name: 'Đơn hàng',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Thêm' },
      { key: 'edit', label: 'Sửa' },
      { key: 'cancel', label: 'Hủy' },
      { key: 'delete', label: 'Xóa' },
    ],
  },
  {
    key: 'products',
    name: 'Menu Products',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Thêm' },
      { key: 'edit', label: 'Sửa' },
      { key: 'delete', label: 'Xóa' },
    ],
  },
  {
    key: 'ingredients',
    name: 'Nguyên liệu',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'import', label: 'Nhập kho' },
      { key: 'edit', label: 'Sửa' },
      { key: 'delete', label: 'Xóa' },
    ],
  },
  {
    key: 'recipes',
    name: 'Công thức',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Thêm' },
      { key: 'edit', label: 'Sửa' },
      { key: 'delete', label: 'Xóa' },
    ],
  },
  {
    key: 'staff',
    name: 'Nhân viên',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Thêm' },
      { key: 'edit', label: 'Sửa' },
      { key: 'delete', label: 'Xóa' },
    ],
  },
  {
    key: 'suppliers',
    name: 'Nhà cung cấp',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Thêm' },
      { key: 'edit', label: 'Sửa' },
      { key: 'delete', label: 'Xóa' },
    ],
  },
  {
    key: 'accounts',
    name: 'Tài khoản',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Thêm' },
      { key: 'edit', label: 'Sửa' },
      { key: 'lock', label: 'Khóa' },
      { key: 'delete', label: 'Xóa' },
    ],
  },
  {
    key: 'reports',
    name: 'Báo cáo',
    permissions: [
      { key: 'view', label: 'Xem' },
      { key: 'export', label: 'Xuất' },
    ],
  },
];

export function buildEmptyPermissions() {
  const perms = {};
  PERMISSION_MODULES.forEach(mod => {
    perms[mod.key] = {};
    mod.permissions.forEach(p => {
      perms[mod.key][p.key] = false;
    });
  });
  return perms;
}

export function buildAdminPermissions() {
  const perms = {};
  PERMISSION_MODULES.forEach(mod => {
    perms[mod.key] = {};
    mod.permissions.forEach(p => {
      perms[mod.key][p.key] = true;
    });
  });
  return perms;
}

export function buildManagerPermissions() {
  const perms = buildEmptyPermissions();
  perms.dashboard.view = true;
  perms.orders.view = true; perms.orders.create = true; perms.orders.edit = true; perms.orders.cancel = true;
  perms.products.view = true; perms.products.create = true; perms.products.edit = true;
  perms.ingredients.view = true; perms.ingredients.import = true; perms.ingredients.edit = true;
  perms.recipes.view = true; perms.recipes.create = true; perms.recipes.edit = true;
  perms.staff.view = true; perms.staff.create = true; perms.staff.edit = true;
  perms.suppliers.view = true; perms.suppliers.create = true; perms.suppliers.edit = true;
  perms.accounts.view = true;
  perms.reports.view = true; perms.reports.export = true;
  return perms;
}

export function buildCashierPermissions() {
  const perms = buildEmptyPermissions();
  perms.dashboard.view = true;
  perms.orders.view = true; perms.orders.create = true;
  perms.products.view = true;
  return perms;
}

export function buildBaristaPermissions() {
  const perms = buildEmptyPermissions();
  perms.dashboard.view = true;
  perms.orders.view = true;
  perms.products.view = true;
  perms.recipes.view = true;
  perms.ingredients.view = true;
  return perms;
}

export function buildStaffPermissions() {
  const perms = buildEmptyPermissions();
  perms.dashboard.view = true;
  perms.orders.view = true;
  perms.products.view = true;
  return perms;
}
