import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_staff';

const initialStaff = [
  { id: 'NV01', name: 'Nguyễn Văn A', email: 'nguyenvana@dezlab.com', password: '123456', role: 'Quản lý', phone: '0901234567', status: 'Đang làm', startDate: '01/01/2026', dateOfBirth: '15/03/1990', gender: 'Nam', citizenId: '012345678901', address: 'TP. Hồ Chí Minh', salaryType: 'Theo tháng', salary: 15000000, monthlyLeaveDays: 4, remainingLeaveDays: 3, note: '' },
  { id: 'NV02', name: 'Trần Thị B', email: 'tranthib@dezlab.com', password: '123456', role: 'Thu ngân', phone: '0901234568', status: 'Đang làm', startDate: '15/02/2026', dateOfBirth: '20/07/1995', gender: 'Nữ', citizenId: '098765432109', address: 'Hà Nội', salaryType: 'Theo tháng', salary: 8000000, monthlyLeaveDays: 2, remainingLeaveDays: 1, note: '' },
  { id: 'NV03', name: 'Lê Văn C', email: 'levanc@dezlab.com', password: '123456', role: 'Nhân viên pha chế', phone: '0901234569', status: 'Đang làm', startDate: '01/03/2026', dateOfBirth: '10/11/1998', gender: 'Nam', citizenId: '056789012345', address: 'Đà Nẵng', salaryType: 'Theo ca', salary: 6000000, monthlyLeaveDays: 2, remainingLeaveDays: 2, note: 'Có kinh nghiệm pha chế 3 năm' },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialStaff;
  } catch { return initialStaff; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
  const [staffList, setStaffList] = useState(loadData);
  const [loading, setLoading] = useState(false);

  const addStaff = useCallback(async (staff) => {
    setLoading(true);
    const newStaff = {
      id: `NV${String(staffList.length + 1).padStart(2, '0')}`,
      ...staff,
    };
    const updated = [...staffList, newStaff];
    setStaffList(updated);
    saveData(updated);
    setLoading(false);
  }, [staffList]);

  const removeStaff = useCallback(async (id) => {
    const updated = staffList.filter(s => s.id !== id);
    setStaffList(updated);
    saveData(updated);
  }, [staffList]);

  return (
    <StaffContext.Provider value={{ staffList, addStaff, removeStaff, loading }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}
