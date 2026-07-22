import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_ingredients';

const initialIngredients = [
  { id: 'NL01', name: 'Cà phê Robusta', unit: 'Kg', stock: 5, minStock: 2, cost: 120000, supplier: 'Trung Nguyên' },
  { id: 'NL02', name: 'Sữa đặc', unit: 'Hộp', stock: 3, minStock: 5, cost: 32000, supplier: 'Vinamilk' },
  { id: 'NL03', name: 'Đường', unit: 'Kg', stock: 10, minStock: 3, cost: 20000, supplier: '' },
  { id: 'NL04', name: 'Đá viên', unit: 'Kg', stock: 20, minStock: 10, cost: 5000, supplier: '' },
  { id: 'NL05', name: 'Trà túi lọc', unit: 'Hộp', stock: 8, minStock: 2, cost: 45000, supplier: 'Lipton' },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialIngredients;
  } catch { return initialIngredients; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const IngredientContext = createContext(null);

export function IngredientProvider({ children }) {
  const [ingredients, setIngredients] = useState(loadData);

  const addIngredient = useCallback(async (ingredient) => {
    const newItem = { id: `NL${String(ingredients.length + 1).padStart(2, '0')}`, ...ingredient };
    const updated = [...ingredients, newItem];
    setIngredients(updated);
    saveData(updated);
  }, [ingredients]);

  const updateIngredient = useCallback(async (id, data) => {
    const updated = ingredients.map(i => i.id === id ? { ...i, ...data } : i);
    setIngredients(updated);
    saveData(updated);
  }, [ingredients]);

  const deleteIngredient = useCallback(async (id) => {
    const updated = ingredients.filter(i => i.id !== id);
    setIngredients(updated);
    saveData(updated);
  }, [ingredients]);

  const addStock = useCallback(async (id, qty) => {
    const updated = ingredients.map(i => i.id === id ? { ...i, stock: i.stock + qty } : i);
    setIngredients(updated);
    saveData(updated);
  }, [ingredients]);

  return (
    <IngredientContext.Provider value={{ ingredients, addIngredient, updateIngredient, deleteIngredient, addStock }}>
      {children}
    </IngredientContext.Provider>
  );
}

export function useIngredient() {
  const ctx = useContext(IngredientContext);
  if (!ctx) throw new Error('useIngredient must be used within IngredientProvider');
  return ctx;
}
