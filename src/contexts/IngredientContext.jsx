import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_ingredients';
const STOCK_EXPORT_KEY = 'dezlab_stock_exports';
const IMPORT_HISTORY_KEY = 'dezlab_import_history';

const initialIngredients = [
  { id: 'NL01', name: 'Cà phê Robusta', category: 'Cà phê', unit: 'Kg', stock: 5, active: true, averageImportPrice: 120000, isFreeIngredient: false, minStock: 2, cost: 120000, supplier: 'Trung Nguyên' },
  { id: 'NL02', name: 'Sữa đặc', category: 'Sữa', unit: 'Hộp', stock: 3, active: true, averageImportPrice: 32000, isFreeIngredient: false, minStock: 5, cost: 32000, supplier: 'Vinamilk' },
  { id: 'NL03', name: 'Đường', category: 'Đường', unit: 'Kg', stock: 10, active: true, averageImportPrice: 20000, isFreeIngredient: false, minStock: 3, cost: 20000, supplier: '' },
  { id: 'NL04', name: 'Đá viên', category: 'Khác', unit: 'Kg', stock: 20, active: true, averageImportPrice: 5000, isFreeIngredient: true, minStock: 10, cost: 5000, supplier: '' },
  { id: 'NL05', name: 'Trà túi lọc', category: 'Trà', unit: 'Hộp', stock: 8, active: false, averageImportPrice: 45000, isFreeIngredient: false, minStock: 2, cost: 45000, supplier: 'Lipton' },
];

const initialStockExports = [
  { id: 'SE01', ingredientId: 'NL01', requestedBy: 'Nguyễn Văn A', approvedBy: 'Trần Văn B', exportedAt: '20/07/2026', quantity: 2 },
  { id: 'SE02', ingredientId: 'NL01', requestedBy: 'Lê Văn C', approvedBy: 'Nguyễn Văn D', exportedAt: '18/07/2026', quantity: 1 },
  { id: 'SE03', ingredientId: 'NL01', requestedBy: 'Nguyễn Văn A', approvedBy: 'Trần Văn B', exportedAt: '15/07/2026', quantity: 3 },
  { id: 'SE04', ingredientId: 'NL02', requestedBy: 'Trần Thị E', approvedBy: 'Nguyễn Văn A', exportedAt: '19/07/2026', quantity: 1 },
];

const initialImportHistory = [
  { id: 'IH01', ingredientId: 'NL01', importedAt: '20/07/2026', importedBy: 'Nguyễn Văn A', quantity: 20, importPrice: 50000, totalAmount: 1000000 },
  { id: 'IH02', ingredientId: 'NL01', importedAt: '15/07/2026', importedBy: 'Trần Văn B', quantity: 10, importPrice: 48000, totalAmount: 480000 },
  { id: 'IH03', ingredientId: 'NL02', importedAt: '18/07/2026', importedBy: 'Nguyễn Văn A', quantity: 5, importPrice: 32000, totalAmount: 160000 },
];

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const IngredientContext = createContext(null);

export function IngredientProvider({ children }) {
  const [ingredients, setIngredients] = useState(() => loadData(STORAGE_KEY, initialIngredients));
  const [stockExports, setStockExports] = useState(() => loadData(STOCK_EXPORT_KEY, initialStockExports));
  const [importHistory, setImportHistory] = useState(() => loadData(IMPORT_HISTORY_KEY, initialImportHistory));

  const addIngredient = useCallback(async (ingredient) => {
    const maxId = ingredients.reduce((max, i) => {
      const num = parseInt(i.id.replace('NL', ''), 10);
      return num > max ? num : max;
    }, 0);
    const newItem = { id: `NL${String(maxId + 1).padStart(2, '0')}`, ...ingredient };
    const updated = [...ingredients, newItem];
    setIngredients(updated);
    saveData(STORAGE_KEY, updated);
    return newItem;
  }, [ingredients]);

  const updateIngredient = useCallback(async (id, data) => {
    const updated = ingredients.map(i => i.id === id ? { ...i, ...data } : i);
    setIngredients(updated);
    saveData(STORAGE_KEY, updated);
  }, [ingredients]);

  const deleteIngredient = useCallback(async (id) => {
    const updated = ingredients.filter(i => i.id !== id);
    setIngredients(updated);
    saveData(STORAGE_KEY, updated);
  }, [ingredients]);

  const addStock = useCallback(async (id, qty) => {
    const updated = ingredients.map(i => i.id === id ? { ...i, stock: i.stock + qty } : i);
    setIngredients(updated);
    saveData(STORAGE_KEY, updated);
  }, [ingredients]);

  const subtractStock = useCallback(async (id, qty) => {
    const updated = ingredients.map(i => {
      if (i.id !== id) return i;
      const newStock = i.stock - qty;
      if (newStock < 0) throw new Error(`Không đủ tồn kho cho ${i.name}. Tồn hiện tại: ${i.stock}${i.unit}`);
      return { ...i, stock: newStock };
    });
    setIngredients(updated);
    saveData(STORAGE_KEY, updated);
  }, [ingredients]);

  const toggleIngredient = useCallback(async (id) => {
    const updated = ingredients.map(i => i.id === id ? { ...i, active: !i.active } : i);
    setIngredients(updated);
    saveData(STORAGE_KEY, updated);
  }, [ingredients]);

  const addStockExport = useCallback(async (exportData) => {
    const maxId = stockExports.reduce((max, e) => {
      const num = parseInt(e.id.replace('SE', ''), 10);
      return num > max ? num : max;
    }, 0);
    const newItem = { id: `SE${String(maxId + 1).padStart(2, '0')}`, ...exportData };
    const updated = [...stockExports, newItem];
    setStockExports(updated);
    saveData(STOCK_EXPORT_KEY, updated);
  }, [stockExports]);

  const addImportHistory = useCallback(async (importData) => {
    const maxId = importHistory.reduce((max, h) => {
      const num = parseInt(h.id.replace('IH', ''), 10);
      return num > max ? num : max;
    }, 0);
    const newItem = { id: `IH${String(maxId + 1).padStart(2, '0')}`, ...importData };
    const updated = [...importHistory, newItem];
    setImportHistory(updated);
    saveData(IMPORT_HISTORY_KEY, updated);
  }, [importHistory]);

  return (
    <IngredientContext.Provider value={{
      ingredients, addIngredient, updateIngredient, deleteIngredient, addStock, subtractStock,
      toggleIngredient, stockExports, addStockExport,
      importHistory, addImportHistory
    }}>
      {children}
    </IngredientContext.Provider>
  );
}

export function useIngredient() {
  const ctx = useContext(IngredientContext);
  if (!ctx) throw new Error('useIngredient must be used within IngredientProvider');
  return ctx;
}
