import { createContext, useContext, useState, useCallback } from 'react';
import {
  getImports,
  getImportById,
  createImport,
  updateImport,
  confirmImport,
  receiveImport,
  cancelImport,
  deleteImport,
} from '../services/inventoryImportService';

const ImportReceiptContext = createContext(null);

export function ImportReceiptProvider({ children }) {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImports = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getImports(query);
      setImports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getImport = useCallback(async (id) => {
    try {
      return await getImportById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const addImport = useCallback(async (dto) => {
    const data = await createImport(dto);
    setImports((prev) => [data, ...prev]);
    return data;
  }, []);

  const editImport = useCallback(async (id, dto) => {
    const data = await updateImport(id, dto);
    setImports((prev) => prev.map((r) => (r.id === id ? data : r)));
    return data;
  }, []);

  const confirm = useCallback(async (id) => {
    const data = await confirmImport(id);
    setImports((prev) => prev.map((r) => (r.id === id ? data : r)));
    return data;
  }, []);

  const receive = useCallback(async (id) => {
    const data = await receiveImport(id);
    setImports((prev) => prev.map((r) => (r.id === id ? data : r)));
    return data;
  }, []);

  const cancel = useCallback(async (id) => {
    const data = await cancelImport(id);
    setImports((prev) => prev.map((r) => (r.id === id ? data : r)));
    return data;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteImport(id);
    setImports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <ImportReceiptContext.Provider
      value={{
        imports,
        loading,
        error,
        fetchImports,
        getImport,
        addImport,
        editImport,
        confirm,
        receive,
        cancel,
        remove,
      }}
    >
      {children}
    </ImportReceiptContext.Provider>
  );
}

export function useImportReceipt() {
  const ctx = useContext(ImportReceiptContext);
  if (!ctx) throw new Error('useImportReceipt must be used within ImportReceiptProvider');
  return ctx;
}
