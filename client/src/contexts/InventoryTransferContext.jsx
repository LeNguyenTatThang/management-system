import { createContext, useContext, useState, useCallback } from 'react';
import {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
  confirmTransfer,
  transferTransfer,
  cancelTransfer,
  deleteTransfer,
} from '../services/inventoryTransferService';

const InventoryTransferContext = createContext(null);

export function InventoryTransferProvider({ children }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransfers = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransfers(params);
      setTransfers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransferByIdAsync = useCallback(async (id) => {
    try {
      return await getTransferById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const addTransfer = useCallback(async (data) => {
    const result = await createTransfer(data);
    setTransfers((prev) => [result, ...prev]);
    return result;
  }, []);

  const editTransfer = useCallback(async (id, data) => {
    const result = await updateTransfer(id, data);
    setTransfers((prev) => prev.map((t) => (t.id === id ? result : t)));
    return result;
  }, []);

  const confirm = useCallback(async (id) => {
    const result = await confirmTransfer(id);
    setTransfers((prev) => prev.map((t) => (t.id === id ? result : t)));
    return result;
  }, []);

  const executeTransfer = useCallback(async (id) => {
    const result = await transferTransfer(id);
    setTransfers((prev) => prev.map((t) => (t.id === id ? result : t)));
    return result;
  }, []);

  const cancel = useCallback(async (id) => {
    const result = await cancelTransfer(id);
    setTransfers((prev) => prev.map((t) => (t.id === id ? result : t)));
    return result;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteTransfer(id);
    setTransfers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <InventoryTransferContext.Provider
      value={{
        transfers,
        loading,
        error,
        fetchTransfers,
        getTransferById: getTransferByIdAsync,
        addTransfer,
        editTransfer,
        confirm,
        executeTransfer,
        cancel,
        remove,
      }}
    >
      {children}
    </InventoryTransferContext.Provider>
  );
}

export function useInventoryTransfer() {
  const ctx = useContext(InventoryTransferContext);
  if (!ctx) {
    throw new Error(
      'useInventoryTransfer must be used within InventoryTransferProvider',
    );
  }
  return ctx;
}
