import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_ingredients';
const STOCK_EXPORT_KEY = 'dezlab_stock_exports';

const initialIngredients = [
  { id: 'NL01', name: 'Cà phê Robusta', category: 'Cà phê', unit: 'Kg', stock: 5, active: true, minStock: 2, cost: 120000, supplier: 'Trung Nguyên' },
  { id: 'NL02', name: 'Sữa đặc', category: 'Sữa', unit: 'Hộp', stock: 3, active: true, minStock: 5, cost: 32000, supplier: 'Vinamilk' },
  { id: 'NL03', name: 'Đường', category: 'Đường', unit: 'Kg', stock: 10, active: true, minStock: 3, cost: 20000, supplier: '' },
  { id: 'NL04', name: 'Đá viên', category: 'Khác', unit: 'Kg', stock: 20, active: true, minStock: 10, cost: 5000, supplier: '' },
  { id: 'NL05', name: 'Trà túi lọc', category: 'Trà', unit: 'Hộp', stock: 8, active: false, minStock: 2, cost: 45000, supplier: 'Lipton' },
];

const initialStockExports = [
  { id: 'SE01', ingredientId: 'NL01', requestedBy: 'Nguyễn Văn A', approvedBy: 'Trần Văn B', exportedAt: '20/07/2026', quantity: 2 },
  { id: 'SE02', ingredientId: 'NL01', requestedBy: 'Lê Văn C', approvedBy: 'Nguyễn Văn D', exportedAt: '18/07/2026', quantity: 1 },
  { id: 'SE03', ingredientId: 'NL01', requestedBy: 'Nguyễn Văn A', approvedBy: 'Trần Văn B', exportedAt: '15/07/2026', quantity: 3 },
  { id: 'SE04', ingredientId: 'NL02', requestedBy: 'Trần Thị E', approvedBy: 'Nguyễn Văn A', exportedAt: '19/07/2026', quantity: 1 },
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

  return (
    <IngredientContext.Provider value={{
      ingredients, addIngredient, updateIngredient, deleteIngredient, addStock,
      toggleIngredient, stockExports, addStockExport
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
