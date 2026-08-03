import { createContext, useContext, useState, useCallback } from 'react';
import {
  getStocktakes,
  getStocktakeById,
  createStocktake,
  updateStocktake,
  confirmStocktake,
  cancelStocktake,
  deleteStocktake,
} from '../services/inventoryStocktakeService';

const InventoryStocktakeContext = createContext(null);

export function InventoryStocktakeProvider({ children }) {
  const [stocktakes, setStocktakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStocktakes = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStocktakes(query);
      setStocktakes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStocktakeByIdAsync = useCallback(async (id) => {
    try {
      return await getStocktakeById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const addStocktake = useCallback(async (data) => {
    const result = await createStocktake(data);
    setStocktakes((prev) => [result, ...prev]);
    return result;
  }, []);

  const editStocktake = useCallback(async (id, data) => {
    const result = await updateStocktake(id, data);
    setStocktakes((prev) => prev.map((s) => (s.id === id ? result : s)));
    return result;
  }, []);

  const confirm = useCallback(async (id) => {
    const result = await confirmStocktake(id);
    setStocktakes((prev) => prev.map((s) => (s.id === id ? result : s)));
    return result;
  }, []);

  const cancel = useCallback(async (id) => {
    const result = await cancelStocktake(id);
    setStocktakes((prev) => prev.map((s) => (s.id === id ? result : s)));
    return result;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteStocktake(id);
    setStocktakes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <InventoryStocktakeContext.Provider
      value={{
        stocktakes,
        loading,
        error,
        fetchStocktakes,
        getStocktakeById: getStocktakeByIdAsync,
        addStocktake,
        editStocktake,
        confirm,
        cancel,
        remove,
      }}
    >
      {children}
    </InventoryStocktakeContext.Provider>
  );
}

export function useInventoryStocktake() {
  const ctx = useContext(InventoryStocktakeContext);
  if (!ctx)
    throw new Error(
      'useInventoryStocktake must be used within InventoryStocktakeProvider',
    );
  return ctx;
}
