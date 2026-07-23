import { createContext, useContext, useState, useCallback } from 'react';

const AccountContext = createContext(null);

const ACCOUNTS_KEY = 'toolmanager_accounts';

const defaultAccounts = [
  {
    id: 'ACC000001',
    fullName: 'Admin Hệ thống',
    username: 'admin',
    email: 'admin@dezlab.com',
    phone: '0900000001',
    password: 'admin123',
    role: 'Admin',
    status: 'Đang hoạt động',
    avatar: null,
    createdAt: '01/01/2026',
  },
  {
    id: 'ACC000002',
    fullName: 'Nguyễn Văn A',
    username: 'manager',
    email: 'manager@dezlab.com',
    phone: '0900000002',
    password: 'manager123',
    role: 'Manager',
    status: 'Đang hoạt động',
    avatar: null,
    createdAt: '15/01/2026',
  },
  {
    id: 'ACC000003',
    fullName: 'Trần Thị B',
    username: 'cashier1',
    email: 'cashier1@dezlab.com',
    phone: '0900000003',
    password: 'cashier123',
    role: 'Cashier',
    status: 'Đang hoạt động',
    avatar: null,
    createdAt: '20/01/2026',
  },
  {
    id: 'ACC000004',
    fullName: 'Lê Văn C',
    username: 'barista1',
    email: 'barista1@dezlab.com',
    phone: '0900000004',
    password: 'barista123',
    role: 'Barista',
    status: 'Đã khóa',
    avatar: null,
    createdAt: '01/02/2026',
  },
  {
    id: 'ACC000005',
    fullName: 'Phạm Thị D',
    username: 'staff1',
    email: 'staff1@dezlab.com',
    phone: '0900000005',
    password: 'staff123',
    role: 'Staff',
    status: 'Đang hoạt động',
    avatar: null,
    createdAt: '10/02/2026',
  },
];

function loadAccounts() {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
    return defaultAccounts;
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function generateId() {
  const num = Date.now().toString().slice(-6);
  return `ACC${num}`;
}

export function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState(loadAccounts);

  const refresh = useCallback(() => {
    setAccounts(loadAccounts());
  }, []);

  const addAccount = useCallback((data) => {
    const list = loadAccounts();
    const newItem = {
      id: generateId(),
      ...data,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    const updated = [...list, newItem];
    saveAccounts(updated);
    setAccounts(updated);
    return newItem;
  }, []);

  const updateAccount = useCallback((id, data) => {
    const list = loadAccounts();
    const updated = list.map(a => a.id === id ? { ...a, ...data } : a);
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  const deleteAccount = useCallback((id) => {
    const list = loadAccounts();
    const updated = list.filter(a => a.id !== id);
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  const toggleLockAccount = useCallback((id) => {
    const list = loadAccounts();
    const updated = list.map(a =>
      a.id === id
        ? { ...a, status: a.status === 'Đang hoạt động' ? 'Đã khóa' : 'Đang hoạt động' }
        : a
    );
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  const changePassword = useCallback((id, newPassword) => {
    const list = loadAccounts();
    const updated = list.map(a => a.id === id ? { ...a, password: newPassword } : a);
    saveAccounts(updated);
    setAccounts(updated);
  }, []);

  return (
    <AccountContext.Provider value={{
      accounts,
      addAccount,
      updateAccount,
      deleteAccount,
      toggleLockAccount,
      changePassword,
      refresh,
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within AccountProvider');
  return ctx;
}
