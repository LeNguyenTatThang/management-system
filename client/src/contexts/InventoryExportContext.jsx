import { createContext, useContext, useState, useCallback } from 'react';
import {
  getExportReceipts,
  getExportReceipt,
  createExportReceipt,
  updateExportReceipt,
  confirmExportReceipt,
  exportReceipt,
  cancelExportReceipt,
  deleteExportReceipt,
} from '../services/inventoryExportService';

export const EXPORT_TYPES = [
  { value: 'USE', label: 'Xuất sử dụng' },
  { value: 'DISPOSAL', label: 'Xuất hủy' },
  { value: 'TRANSFER', label: 'Điều chuyển' },
  { value: 'OTHER', label: 'Xuất khác' },
];

export const EXPORT_TYPE_LABELS = {};
EXPORT_TYPES.forEach((t) => {
  EXPORT_TYPE_LABELS[t.value] = t.label;
});

const InventoryExportContext = createContext(null);

export function InventoryExportProvider({ children }) {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExports = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExportReceipts(query);
      setExports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getExportById = useCallback(async (id) => {
    try {
      return await getExportReceipt(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const createExport = useCallback(async (data) => {
    const result = await createExportReceipt(data);
    setExports((prev) => [result, ...prev]);
    return result;
  }, []);

  const updateExport = useCallback(async (id, data) => {
    const result = await updateExportReceipt(id, data);
    setExports((prev) => prev.map((r) => (r.id === id ? result : r)));
    return result;
  }, []);

  const confirmExport = useCallback(async (id) => {
    const result = await confirmExportReceipt(id);
    setExports((prev) => prev.map((r) => (r.id === id ? result : r)));
    return result;
  }, []);

  const executeExport = useCallback(async (id) => {
    const result = await exportReceipt(id);
    setExports((prev) => prev.map((r) => (r.id === id ? result : r)));
    return result;
  }, []);

  const cancelExport = useCallback(async (id) => {
    const result = await cancelExportReceipt(id);
    setExports((prev) => prev.map((r) => (r.id === id ? result : r)));
    return result;
  }, []);

  const removeExport = useCallback(async (id) => {
    await deleteExportReceipt(id);
    setExports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <InventoryExportContext.Provider
      value={{
        exports,
        loading,
        error,
        fetchExports,
        getExportById,
        createExport,
        updateExport,
        confirmExport,
        executeExport,
        cancelExport,
        removeExport,
      }}
    >
      {children}
    </InventoryExportContext.Provider>
  );
}

export function useInventoryExport() {
  const ctx = useContext(InventoryExportContext);
  if (!ctx)
    throw new Error(
      'useInventoryExport must be used within InventoryExportProvider',
    );
  return ctx;
}
