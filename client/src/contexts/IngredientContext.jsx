import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getUnits,
} from '../services/ingredientService';

const IngredientContext = createContext(null);

export function IngredientProvider({ children }) {
  const [ingredients, setIngredients] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIngredients = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIngredients(params);
      setIngredients(data);
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const data = await getUnits();
      setUnits(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchIngredients();
    fetchUnits();
  }, [fetchIngredients, fetchUnits]);

  const getIngredientById = useCallback(async (id) => {
    try {
      return await getIngredient(id);
    } catch {
      return null;
    }
  }, []);

  const addIngredient = useCallback(async (data) => {
    const created = await createIngredient(data);
    setIngredients((prev) => [...prev, created]);
    return created;
  }, []);

  const editIngredient = useCallback(async (id, data) => {
    const updated = await updateIngredient(id, data);
    setIngredients((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const removeIngredient = useCallback(async (id) => {
    await deleteIngredient(id);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <IngredientContext.Provider
      value={{
        ingredients,
        units,
        loading,
        error,
        fetchIngredients,
        getIngredientById,
        addIngredient,
        editIngredient,
        removeIngredient,
        fetchUnits,
      }}
    >
      {children}
    </IngredientContext.Provider>
  );
}

export function useIngredient() {
  const ctx = useContext(IngredientContext);
  if (!ctx) throw new Error('useIngredient must be used within IngredientProvider');
  return ctx;
}
