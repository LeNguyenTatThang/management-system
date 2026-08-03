import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useIngredient } from './IngredientContext';

const STORAGE_KEY = 'dezlab_import_receipts';

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function nowISO() {
  return new Date().toISOString();
}

function generateCode(index) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `NK-${y}${m}${dd}-${String(index + 1).padStart(3, '0')}`;
}

function generateId(index) {
  return `NK${String(index + 1).padStart(2, '0')}`;
}

const initialReceipts = [
  {
    id: 'NK01', code: 'NK-20260723-001', date: '23/07/2026',
    supplierId: 'NCC01', supplierName: 'Công ty CP Sữa Việt Nam',
    branchId: 'CN01', branchName: 'Chi nhánh Quận 1',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    note: 'Nhập sữa định kỳ',
    status: 'received',
    items: [
      { ingredientId: 'NL02', ingredientName: 'Sữa đặc', unit: 'Hộp', quantity: 20, unitPrice: 32000, amount: 640000, note: '' },
    ],
    totalItems: 1, totalQuantity: 20, totalAmount: 640000,
    createdAt: '2026-07-23T08:00:00.000Z', confirmedAt: '2026-07-23T08:05:00.000Z',
    receivedAt: '2026-07-23T08:10:00.000Z', cancelledAt: null, updatedAt: '2026-07-23T08:10:00.000Z',
  },
  {
    id: 'NK02', code: 'NK-20260724-001', date: '24/07/2026',
    supplierId: 'NCC02', supplierName: 'PP Cà Phê Trung Nguyên',
    branchId: 'CN03', branchName: 'Chi nhánh Thủ Đức',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    note: '',
    status: 'confirmed',
    items: [
      { ingredientId: 'NL01', ingredientName: 'Cà phê Robusta', unit: 'Kg', quantity: 15, unitPrice: 120000, amount: 1800000, note: 'Hạt mới rang' },
      { ingredientId: 'NL03', ingredientName: 'Đường', unit: 'Kg', quantity: 10, unitPrice: 20000, amount: 200000, note: '' },
    ],
    totalItems: 2, totalQuantity: 25, totalAmount: 2000000,
    createdAt: '2026-07-24T09:00:00.000Z', confirmedAt: '2026-07-24T09:15:00.000Z',
    receivedAt: null, cancelledAt: null, updatedAt: '2026-07-24T09:15:00.000Z',
  },
  {
    id: 'NK03', code: 'NK-20260724-002', date: '24/07/2026',
    supplierId: 'NCC03', supplierName: 'Đại lý Nguyên Liệu Pha Chế',
    branchId: 'CN02', branchName: 'Chi nhánh Quận 3',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    note: 'Đang chờ duyệt',
    status: 'draft',
    items: [
      { ingredientId: 'NL04', ingredientName: 'Đá viên', unit: 'Kg', quantity: 50, unitPrice: 5000, amount: 250000, note: '' },
      { ingredientId: 'NL03', ingredientName: 'Đường', unit: 'Kg', quantity: 5, unitPrice: 20000, amount: 100000, note: '' },
    ],
    totalItems: 2, totalQuantity: 55, totalAmount: 350000,
    createdAt: '2026-07-24T10:30:00.000Z', confirmedAt: null,
    receivedAt: null, cancelledAt: null, updatedAt: '2026-07-24T10:30:00.000Z',
  },
  {
    id: 'NK04', code: 'NK-20260722-001', date: '22/07/2026',
    supplierId: 'NCC01', supplierName: 'Công ty CP Sữa Việt Nam',
    branchId: 'CN01', branchName: 'Chi nhánh Quận 1',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    note: 'Đã hủy do sai đơn vị',
    status: 'cancelled',
    items: [
      { ingredientId: 'NL02', ingredientName: 'Sữa đặc', unit: 'Hộp', quantity: 5, unitPrice: 32000, amount: 160000, note: '' },
    ],
    totalItems: 1, totalQuantity: 5, totalAmount: 160000,
    createdAt: '2026-07-22T14:00:00.000Z', confirmedAt: null,
    receivedAt: null, cancelledAt: '2026-07-22T15:00:00.000Z', updatedAt: '2026-07-22T15:00:00.000Z',
  },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialReceipts;
  } catch { return initialReceipts; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const ImportReceiptContext = createContext(null);

export function ImportReceiptProvider({ children }) {
  const [imports, setImports] = useState(loadData);
  const { user } = useAuth();
  const { addStock, ingredients } = useIngredient();

  const getImportById = useCallback((id) => {
    return imports.find(r => r.id === id) || null;
  }, [imports]);

  const updateItemAmounts = (items) => {
    return items.map(item => ({
      ...item,
      amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
    }));
  };

  const recalcTotals = (items) => {
    const updated = updateItemAmounts(items);
    const totalItems = updated.filter(i => i.ingredientId).length;
    const totalQuantity = updated.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0);
    const totalAmount = updated.reduce((s, i) => s + i.amount, 0);
    return { items: updated, totalItems, totalQuantity, totalAmount };
  };

  const createImport = useCallback(async (data) => {
    const { items, totalItems, totalQuantity, totalAmount } = recalcTotals(data.items || []);
    const index = imports.length;
    const now = nowISO();
    const newItem = {
      id: generateId(index),
      code: generateCode(index),
      date: data.date || todayStr(),
      supplierId: data.supplierId,
      supplierName: data.supplierName || '',
      branchId: data.branchId,
      branchName: data.branchName || '',
      createdBy: user?.name || 'Nguyễn Văn A',
      createdByUserId: user?.id || 'USR000001',
      note: data.note || '',
      status: data.status || 'draft',
      items,
      totalItems, totalQuantity, totalAmount,
      createdAt: now, confirmedAt: null, receivedAt: null, cancelledAt: null, updatedAt: now,
    };
    const updated = [...imports, newItem];
    setImports(updated);
    saveData(updated);
    return newItem;
  }, [imports, user]);

  const updateImport = useCallback(async (id, data) => {
    const existing = imports.find(r => r.id === id);
    if (!existing) return null;
    if (existing.status !== 'draft') return null;

    const newItems = data.items !== undefined ? data.items : existing.items;
    const { items, totalItems, totalQuantity, totalAmount } = recalcTotals(newItems);

    const updatedItem = {
      ...existing,
      date: data.date !== undefined ? data.date : existing.date,
      supplierId: data.supplierId !== undefined ? data.supplierId : existing.supplierId,
      supplierName: data.supplierName !== undefined ? data.supplierName : existing.supplierName,
      branchId: data.branchId !== undefined ? data.branchId : existing.branchId,
      branchName: data.branchName !== undefined ? data.branchName : existing.branchName,
      note: data.note !== undefined ? data.note : existing.note,
      items, totalItems, totalQuantity, totalAmount,
      updatedAt: nowISO(),
    };
    const updated = imports.map(r => r.id === id ? updatedItem : r);
    setImports(updated);
    saveData(updated);
    return updatedItem;
  }, [imports]);

  const confirmImport = useCallback(async (id) => {
    const existing = imports.find(r => r.id === id);
    if (!existing || existing.status !== 'draft') return null;
    const now = nowISO();
    const updatedItem = { ...existing, status: 'confirmed', confirmedAt: now, updatedAt: now };
    const updated = imports.map(r => r.id === id ? updatedItem : r);
    setImports(updated);
    saveData(updated);
    return updatedItem;
  }, [imports]);

  const receiveImport = useCallback(async (id) => {
    const existing = imports.find(r => r.id === id);
    if (!existing || existing.status !== 'confirmed') return null;
    const now = nowISO();
    const updatedItem = { ...existing, status: 'received', receivedAt: now, updatedAt: now };
    const updated = imports.map(r => r.id === id ? updatedItem : r);
    setImports(updated);
    saveData(updated);

    existing.items.forEach(item => {
      if (item.ingredientId && parseFloat(item.quantity) > 0) {
        addStock(item.ingredientId, parseFloat(item.quantity));
      }
    });

    return updatedItem;
  }, [imports, addStock]);

  const cancelImport = useCallback(async (id) => {
    const existing = imports.find(r => r.id === id);
    if (!existing) return null;
    if (existing.status === 'received') return null;
    const now = nowISO();
    const updatedItem = { ...existing, status: 'cancelled', cancelledAt: now, updatedAt: now };
    const updated = imports.map(r => r.id === id ? updatedItem : r);
    setImports(updated);
    saveData(updated);
    return updatedItem;
  }, [imports]);

  return (
    <ImportReceiptContext.Provider value={{
      imports, getImportById, createImport, updateImport, confirmImport, receiveImport, cancelImport,
    }}>
      {children}
    </ImportReceiptContext.Provider>
  );
}

export function useImportReceipt() {
  const ctx = useContext(ImportReceiptContext);
  if (!ctx) throw new Error('useImportReceipt must be used within ImportReceiptProvider');
  return ctx;
}
