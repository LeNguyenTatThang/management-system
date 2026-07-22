import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_suppliers';

const initialSuppliers = [
  { id: 'NCC01', name: 'Công ty CP Sữa Việt Nam', contact: 'Anh Hùng', email: 'hung@vinamilk.com', phone: '0987654321', address: '123 Nguyễn Văn Cừ, TPHCM' },
  { id: 'NCC02', name: 'PP Cà Phê Trung Nguyên', contact: 'Chị Mai', email: 'mai@trungnguyen.com', phone: '0987654322', address: '456 Lê Duẩn, TPHCM' },
  { id: 'NCC03', name: 'Đại lý Nguyên Liệu Pha Chế', contact: 'Anh Tuấn', email: 'tuan@nlpc.vn', phone: '0987654323', address: '789 CMT8, TPHCM' },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialSuppliers;
  } catch { return initialSuppliers; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const SupplierContext = createContext(null);

export function SupplierProvider({ children }) {
  const [suppliers, setSuppliers] = useState(loadData);

  const addSupplier = useCallback(async (supplier) => {
    const newItem = { id: `NCC${String(suppliers.length + 1).padStart(2, '0')}`, ...supplier };
    const updated = [...suppliers, newItem];
    setSuppliers(updated);
    saveData(updated);
  }, [suppliers]);

  const updateSupplier = useCallback(async (id, data) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, ...data } : s);
    setSuppliers(updated);
    saveData(updated);
  }, [suppliers]);

  const deleteSupplier = useCallback(async (id) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveData(updated);
  }, [suppliers]);

  return (
    <SupplierContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error('useSupplier must be used within SupplierProvider');
  return ctx;
}
