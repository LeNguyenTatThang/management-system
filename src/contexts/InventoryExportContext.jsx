import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useIngredient } from './IngredientContext';

const STORAGE_KEY = 'dezlab_export_receipts';

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
  return `XK-${y}${m}${dd}-${String(index + 1).padStart(3, '0')}`;
}

function generateId(index) {
  return `XK${String(index + 1).padStart(2, '0')}`;
}

export const EXPORT_TYPES = [
  { value: 'USE', label: 'Xuất sử dụng' },
  { value: 'DISPOSAL', label: 'Xuất hủy' },
  { value: 'TRANSFER', label: 'Điều chuyển' },
  { value: 'OTHER', label: 'Xuất khác' },
];

export const EXPORT_TYPE_LABELS = {};
EXPORT_TYPES.forEach(t => { EXPORT_TYPE_LABELS[t.value] = t.label; });

const initialExports = [
  {
    id: 'XK01', code: 'XK-20260724-001', date: '24/07/2026',
    exportType: 'USE',
    branchId: 'CN01', branchName: 'Chi nhánh Quận 1',
    toBranchId: '', toBranchName: '',
    reason: '', note: 'Xuất cà phê phục vụ sản xuất',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    confirmedBy: null, confirmedByUserId: null,
    exportedBy: null, exportedByUserId: null,
    status: 'exported',
    items: [
      { ingredientId: 'NL01', ingredientName: 'Cà phê Robusta', unit: 'Kg', requestedQuantity: 3, actualQuantity: 3, currentStock: 5, note: '' },
    ],
    totalItems: 1, totalQuantity: 3,
    createdAt: '2026-07-24T08:00:00.000Z', confirmedAt: '2026-07-24T08:05:00.000Z',
    exportedAt: '2026-07-24T08:10:00.000Z', cancelledAt: null, updatedAt: '2026-07-24T08:10:00.000Z',
  },
  {
    id: 'XK02', code: 'XK-20260724-002', date: '24/07/2026',
    exportType: 'DISPOSAL',
    branchId: 'CN02', branchName: 'Chi nhánh Quận 3',
    toBranchId: '', toBranchName: '',
    reason: 'Sữa đặc hết hạn sử dụng', note: '',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    confirmedBy: null, confirmedByUserId: null,
    exportedBy: null, exportedByUserId: null,
    status: 'confirmed',
    items: [
      { ingredientId: 'NL02', ingredientName: 'Sữa đặc', unit: 'Hộp', requestedQuantity: 2, actualQuantity: 0, currentStock: 3, note: 'Hết hạn 20/07' },
    ],
    totalItems: 1, totalQuantity: 2,
    createdAt: '2026-07-24T09:00:00.000Z', confirmedAt: '2026-07-24T09:05:00.000Z',
    exportedAt: null, cancelledAt: null, updatedAt: '2026-07-24T09:05:00.000Z',
  },
  {
    id: 'XK03', code: 'XK-20260723-001', date: '23/07/2026',
    exportType: 'TRANSFER',
    branchId: 'CN01', branchName: 'Chi nhánh Quận 1',
    toBranchId: 'CN03', toBranchName: 'Chi nhánh Thủ Đức',
    reason: '', note: 'Điều chuyển đường sang Thủ Đức',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    confirmedBy: 'Trần Thị B', confirmedByUserId: 'NV02',
    exportedBy: 'Nguyễn Văn A', exportedByUserId: 'USR000001',
    status: 'exported',
    items: [
      { ingredientId: 'NL03', ingredientName: 'Đường', unit: 'Kg', requestedQuantity: 5, actualQuantity: 5, currentStock: 10, note: '' },
    ],
    totalItems: 1, totalQuantity: 5,
    createdAt: '2026-07-23T10:00:00.000Z', confirmedAt: '2026-07-23T10:05:00.000Z',
    exportedAt: '2026-07-23T10:15:00.000Z', cancelledAt: null, updatedAt: '2026-07-23T10:15:00.000Z',
  },
  {
    id: 'XK04', code: 'XK-20260722-001', date: '22/07/2026',
    exportType: 'USE',
    branchId: 'CN01', branchName: 'Chi nhánh Quận 1',
    toBranchId: '', toBranchName: '',
    reason: '', note: '',
    createdBy: 'Nguyễn Văn A', createdByUserId: 'USR000001',
    confirmedBy: null, confirmedByUserId: null,
    exportedBy: null, exportedByUserId: null,
    status: 'draft',
    items: [
      { ingredientId: 'NL04', ingredientName: 'Đá viên', unit: 'Kg', requestedQuantity: 10, actualQuantity: 0, currentStock: 20, note: '' },
      { ingredientId: 'NL03', ingredientName: 'Đường', unit: 'Kg', requestedQuantity: 2, actualQuantity: 0, currentStock: 10, note: '' },
    ],
    totalItems: 2, totalQuantity: 12,
    createdAt: '2026-07-22T14:00:00.000Z', confirmedAt: null,
    exportedAt: null, cancelledAt: null, updatedAt: '2026-07-22T14:00:00.000Z',
  },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialExports;
  } catch { return initialExports; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const InventoryExportContext = createContext(null);

export function InventoryExportProvider({ children }) {
  const [exports, setExports] = useState(loadData);
  const { user } = useAuth();
  const { ingredients, subtractStock, addStock } = useIngredient();

  const getExportById = useCallback((id) => {
    return exports.find(r => r.id === id) || null;
  }, [exports]);

  const getFullIngredient = useCallback((id) => {
    return ingredients.find(i => i.id === id) || null;
  }, [ingredients]);

  const recalcTotals = (items) => {
    const totalItems = items.filter(i => i.ingredientId).length;
    const totalQuantity = items.reduce((s, i) => s + (parseFloat(i.requestedQuantity) || 0), 0);
    return { totalItems, totalQuantity };
  };

  const createExport = useCallback(async (data) => {
    const { totalItems, totalQuantity } = recalcTotals(data.items || []);
    const index = exports.length;
    const now = nowISO();
    const newItem = {
      id: generateId(index),
      code: generateCode(index),
      date: data.date || todayStr(),
      exportType: data.exportType || 'USE',
      branchId: data.branchId,
      branchName: data.branchName || '',
      toBranchId: data.toBranchId || '',
      toBranchName: data.toBranchName || '',
      reason: data.reason || '',
      note: data.note || '',
      createdBy: user?.name || 'Nguyễn Văn A',
      createdByUserId: user?.id || 'USR000001',
      confirmedBy: null, confirmedByUserId: null,
      exportedBy: null, exportedByUserId: null,
      status: data.status || 'draft',
      items: (data.items || []).map(i => ({
        ...i,
        currentStock: getFullIngredient(i.ingredientId)?.stock ?? 0,
      })),
      totalItems, totalQuantity,
      createdAt: now, confirmedAt: null, exportedAt: null, cancelledAt: null, updatedAt: now,
    };
    const updated = [...exports, newItem];
    setExports(updated);
    saveData(updated);
    return newItem;
  }, [exports, user, getFullIngredient]);

  const updateExport = useCallback(async (id, data) => {
    const existing = exports.find(r => r.id === id);
    if (!existing || existing.status !== 'draft') return null;

    const newItems = data.items !== undefined
      ? data.items.map(i => ({
          ...i,
          currentStock: getFullIngredient(i.ingredientId)?.stock ?? 0,
        }))
      : existing.items;

    const { totalItems, totalQuantity } = recalcTotals(newItems);

    const updatedItem = {
      ...existing,
      date: data.date !== undefined ? data.date : existing.date,
      exportType: data.exportType !== undefined ? data.exportType : existing.exportType,
      branchId: data.branchId !== undefined ? data.branchId : existing.branchId,
      branchName: data.branchName !== undefined ? data.branchName : existing.branchName,
      toBranchId: data.toBranchId !== undefined ? data.toBranchId : existing.toBranchId,
      toBranchName: data.toBranchName !== undefined ? data.toBranchName : existing.toBranchName,
      reason: data.reason !== undefined ? data.reason : existing.reason,
      note: data.note !== undefined ? data.note : existing.note,
      items: newItems,
      totalItems, totalQuantity,
      updatedAt: nowISO(),
    };
    const updated = exports.map(r => r.id === id ? updatedItem : r);
    setExports(updated);
    saveData(updated);
    return updatedItem;
  }, [exports, getFullIngredient]);

  const confirmExport = useCallback(async (id) => {
    const existing = exports.find(r => r.id === id);
    if (!existing || existing.status !== 'draft') return null;
    const now = nowISO();
    const updatedItem = {
      ...existing, status: 'confirmed', confirmedBy: user?.name || '',
      confirmedByUserId: user?.id || '', confirmedAt: now, updatedAt: now,
    };
    const updated = exports.map(r => r.id === id ? updatedItem : r);
    setExports(updated);
    saveData(updated);
    return updatedItem;
  }, [exports, user]);

  const executeExport = useCallback(async (id) => {
    const existing = exports.find(r => r.id === id);
    if (!existing || existing.status !== 'confirmed') return null;

    const now = nowISO();
    const itemsWithStock = existing.items.map(item => {
      const ing = getFullIngredient(item.ingredientId);
      return { ...item, currentStock: ing?.stock ?? 0 };
    });

    for (const item of itemsWithStock) {
      if (!item.ingredientId) continue;
      const qty = parseFloat(item.requestedQuantity) || 0;
      if (qty <= 0) continue;
      if (item.currentStock < qty) {
        const ing = getFullIngredient(item.ingredientId);
        throw new Error(
          `Không đủ tồn kho để xuất "${item.ingredientName}". ` +
          `Yêu cầu: ${qty}${item.unit}, Tồn hiện tại: ${item.currentStock}${item.unit}`
        );
      }
    }

    for (const item of itemsWithStock) {
      if (!item.ingredientId) continue;
      const qty = parseFloat(item.requestedQuantity) || 0;
      if (qty <= 0) continue;

      if (existing.exportType === 'TRANSFER' && existing.toBranchId) {
        await subtractStock(item.ingredientId, qty);
        await addStock(item.ingredientId, qty);
      } else {
        await subtractStock(item.ingredientId, qty);
      }
    }

    const updatedItem = {
      ...existing,
      items: itemsWithStock.map(i => ({ ...i, actualQuantity: parseFloat(i.requestedQuantity) || 0 })),
      status: 'exported',
      exportedBy: user?.name || '',
      exportedByUserId: user?.id || '',
      exportedAt: now,
      updatedAt: now,
    };
    const updated = exports.map(r => r.id === id ? updatedItem : r);
    setExports(updated);
    saveData(updated);
    return updatedItem;
  }, [exports, user, getFullIngredient, subtractStock, addStock]);

  const cancelExport = useCallback(async (id) => {
    const existing = exports.find(r => r.id === id);
    if (!existing) return null;
    if (existing.status === 'exported') return null;
    const now = nowISO();
    const updatedItem = { ...existing, status: 'cancelled', cancelledAt: now, updatedAt: now };
    const updated = exports.map(r => r.id === id ? updatedItem : r);
    setExports(updated);
    saveData(updated);
    return updatedItem;
  }, [exports]);

  return (
    <InventoryExportContext.Provider value={{
      exports, getExportById, createExport, updateExport, confirmExport, executeExport, cancelExport,
    }}>
      {children}
    </InventoryExportContext.Provider>
  );
}

export function useInventoryExport() {
  const ctx = useContext(InventoryExportContext);
  if (!ctx) throw new Error('useInventoryExport must be used within InventoryExportProvider');
  return ctx;
}
