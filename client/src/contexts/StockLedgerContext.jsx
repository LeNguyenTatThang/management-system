import { createContext, useContext, useState, useCallback } from 'react';
import {
  getStockMovements,
  getStockMovementById,
  getIngredientStockMovements,
  getStockMovementSummary,
  checkStockConsistency,
} from '../services/stockLedgerService';

export const MOVEMENT_TYPES = [
  { value: 'IMPORT', label: 'Nhập kho' },
  { value: 'EXPORT', label: 'Xuất kho' },
  { value: 'ADJUSTMENT', label: 'Điều chỉnh' },
  { value: 'TRANSFER', label: 'Chuyển kho' },
];

export const MOVEMENT_TYPE_LABELS = {};
MOVEMENT_TYPES.forEach((t) => {
  MOVEMENT_TYPE_LABELS[t.value] = t.label;
});

export const MOVEMENT_DIRECTIONS = [
  { value: 'IN', label: 'Tăng' },
  { value: 'OUT', label: 'Giảm' },
];

export const MOVEMENT_DIRECTION_LABELS = {};
MOVEMENT_DIRECTIONS.forEach((d) => {
  MOVEMENT_DIRECTION_LABELS[d.value] = d.label;
});

export const REFERENCE_TYPES = [
  { value: 'INVENTORY_IMPORT', label: 'Nhập kho' },
  { value: 'INVENTORY_EXPORT', label: 'Xuất kho' },
  { value: 'INVENTORY_ADJUSTMENT', label: 'Điều chỉnh kho' },
  { value: 'INVENTORY_TRANSFER', label: 'Chuyển kho' },
];

export const REFERENCE_TYPE_LABELS = {};
REFERENCE_TYPES.forEach((r) => {
  REFERENCE_TYPE_LABELS[r.value] = r.label;
});

const StockLedgerContext = createContext(null);

export function StockLedgerProvider({ children }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [summary, setSummary] = useState(null);

  const fetchMovements = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStockMovements(params);
      setMovements(result.items);
      setPagination({ page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovementById = useCallback(async (id) => {
    try {
      return await getStockMovementById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const fetchIngredientMovements = useCallback(async (ingredientId, params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getIngredientStockMovements(ingredientId, params);
      setMovements(result.items);
      setPagination({ page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (params) => {
    try {
      const result = await getStockMovementSummary(params);
      setSummary(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const checkConsistency = useCallback(async (ingredientId) => {
    try {
      return await checkStockConsistency(ingredientId);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  return (
    <StockLedgerContext.Provider
      value={{
        movements,
        loading,
        error,
        pagination,
        summary,
        fetchMovements,
        fetchMovementById,
        fetchIngredientMovements,
        fetchSummary,
        checkConsistency,
      }}
    >
      {children}
    </StockLedgerContext.Provider>
  );
}

export function useStockLedger() {
  const ctx = useContext(StockLedgerContext);
  if (!ctx)
    throw new Error(
      'useStockLedger must be used within StockLedgerProvider',
    );
  return ctx;
}
