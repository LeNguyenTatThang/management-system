import { createContext, useContext, useState, useCallback } from 'react';
import {
  getAdjustments,
  getAdjustment,
  createAdjustment,
  updateAdjustment,
  confirmAdjustment,
  cancelAdjustment,
  deleteAdjustment,
} from '../services/inventoryAdjustmentService';

export const ADJUSTMENT_DIRECTIONS = [
  { value: 'INCREASE', label: 'Tăng' },
  { value: 'DECREASE', label: 'Giảm' },
];

export const ADJUSTMENT_DIRECTION_LABELS = {};
ADJUSTMENT_DIRECTIONS.forEach((d) => {
  ADJUSTMENT_DIRECTION_LABELS[d.value] = d.label;
});

const InventoryAdjustmentContext = createContext(null);

export function InventoryAdjustmentProvider({ children }) {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdjustments = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdjustments(query);
      setAdjustments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAdjustmentById = useCallback(async (id) => {
    try {
      return await getAdjustment(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const create = useCallback(async (data) => {
    const result = await createAdjustment(data);
    setAdjustments((prev) => [result, ...prev]);
    return result;
  }, []);

  const update = useCallback(async (id, data) => {
    const result = await updateAdjustment(id, data);
    setAdjustments((prev) => prev.map((a) => (a.id === id ? result : a)));
    return result;
  }, []);

  const confirm = useCallback(async (id) => {
    const result = await confirmAdjustment(id);
    setAdjustments((prev) => prev.map((a) => (a.id === id ? result : a)));
    return result;
  }, []);

  const cancel = useCallback(async (id) => {
    const result = await cancelAdjustment(id);
    setAdjustments((prev) => prev.map((a) => (a.id === id ? result : a)));
    return result;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteAdjustment(id);
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <InventoryAdjustmentContext.Provider
      value={{
        adjustments,
        loading,
        error,
        fetchAdjustments,
        getAdjustmentById,
        create,
        update,
        confirm,
        cancel,
        remove,
      }}
    >
      {children}
    </InventoryAdjustmentContext.Provider>
  );
}

export function useInventoryAdjustment() {
  const ctx = useContext(InventoryAdjustmentContext);
  if (!ctx)
    throw new Error(
      'useInventoryAdjustment must be used within InventoryAdjustmentProvider',
    );
  return ctx;
}
