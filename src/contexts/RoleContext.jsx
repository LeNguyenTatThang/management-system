import { createContext, useContext, useState, useCallback } from 'react';
import {
  buildAdminPermissions,
  buildManagerPermissions,
  buildCashierPermissions,
  buildBaristaPermissions,
  buildStaffPermissions,
} from '../types/role';

const RoleContext = createContext(null);

const ROLES_KEY = 'toolmanager_roles';

const defaultRoles = [
  {
    id: 'ROLE001',
    name: 'Admin',
    description: 'Toàn quyền quản trị hệ thống',
    permissions: buildAdminPermissions(),
    status: 'Đang hoạt động',
    system: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'ROLE002',
    name: 'Manager',
    description: 'Quản lý vận hành quán',
    permissions: buildManagerPermissions(),
    status: 'Đang hoạt động',
    system: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'ROLE003',
    name: 'Cashier',
    description: 'Nhân viên thu ngân',
    permissions: buildCashierPermissions(),
    status: 'Đang hoạt động',
    system: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'ROLE004',
    name: 'Barista',
    description: 'Nhân viên pha chế',
    permissions: buildBaristaPermissions(),
    status: 'Đang hoạt động',
    system: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'ROLE005',
    name: 'Staff',
    description: 'Nhân viên cơ bản',
    permissions: buildStaffPermissions(),
    status: 'Đang hoạt động',
    system: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'ROLE006',
    name: 'Kitchen',
    description: 'Nhân viên bếp',
    permissions: buildStaffPermissions(),
    status: 'Không hoạt động',
    system: false,
    createdAt: '01/03/2026',
  },
];

function loadRoles() {
  try {
    const stored = localStorage.getItem(ROLES_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles));
    return defaultRoles;
  } catch {
    return [];
  }
}

function saveRoles(roles) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

function generateId() {
  const num = Date.now().toString().slice(-4);
  return `ROLE${num}`;
}

export function RoleProvider({ children }) {
  const [roles, setRoles] = useState(loadRoles);

  const refresh = useCallback(() => {
    setRoles(loadRoles());
  }, []);

  const addRole = useCallback((data) => {
    const list = loadRoles();
    const newItem = {
      id: generateId(),
      ...data,
      system: false,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    const updated = [...list, newItem];
    saveRoles(updated);
    setRoles(updated);
    return newItem;
  }, []);

  const updateRole = useCallback((id, data) => {
    const list = loadRoles();
    const updated = list.map(r => r.id === id ? { ...r, ...data } : r);
    saveRoles(updated);
    setRoles(updated);
  }, []);

  const deleteRole = useCallback((id) => {
    const list = loadRoles();
    const updated = list.filter(r => r.id !== id);
    saveRoles(updated);
    setRoles(updated);
  }, []);

  const getAccountCountByRole = useCallback((roleName) => {
    try {
      const stored = localStorage.getItem('toolmanager_accounts');
      if (!stored) return 0;
      const accounts = JSON.parse(stored);
      return accounts.filter(a => a.role === roleName).length;
    } catch {
      return 0;
    }
  }, []);

  return (
    <RoleContext.Provider value={{
      roles,
      addRole,
      updateRole,
      deleteRole,
      getAccountCountByRole,
      refresh,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
