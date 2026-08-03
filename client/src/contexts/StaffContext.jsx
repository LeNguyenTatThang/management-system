import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getEmployees, createEmployee, deleteEmployee } from '../services/employeeService';

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setStaffList(data);
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const addStaff = useCallback(async (staff) => {
    const created = await createEmployee(staff);
    setStaffList((prev) => [...prev, created]);
    return created;
  }, []);

  const removeStaff = useCallback(async (id) => {
    await deleteEmployee(id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <StaffContext.Provider value={{ staffList, addStaff, removeStaff, loading, error, fetchStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}