import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_leave_requests';

function generateId() {
  const num = Date.now().toString().slice(-5);
  return `LR${num}`;
}

function nowISO() {
  return new Date().toISOString();
}

const initialRequests = [
  {
    id: 'LR00001',
    employeeId: 'NV01',
    employeeName: 'Nguyễn Văn A',
    employeeRole: 'Quản lý',
    startDate: '25/07/2026',
    startTime: '08:00',
    endDate: '25/07/2026',
    endTime: '17:00',
    reason: 'Nghỉ ốm, cần đi khám bệnh',
    status: 'approved',
    createdAt: '2026-07-23T08:00:00.000Z',
    updatedAt: '2026-07-23T10:30:00.000Z',
  },
  {
    id: 'LR00002',
    employeeId: 'NV02',
    employeeName: 'Trần Thị B',
    employeeRole: 'Thu ngân',
    startDate: '28/07/2026',
    startTime: '08:00',
    endDate: '28/07/2026',
    endTime: '12:00',
    reason: 'Có việc gia đình',
    status: 'pending',
    createdAt: '2026-07-24T09:15:00.000Z',
    updatedAt: '2026-07-24T09:15:00.000Z',
  },
  {
    id: 'LR00003',
    employeeId: 'NV03',
    employeeName: 'Lê Văn C',
    employeeRole: 'Nhân viên pha chế',
    startDate: '27/07/2026',
    startTime: '08:00',
    endDate: '29/07/2026',
    endTime: '17:00',
    reason: 'Nghỉ phép về quê',
    status: 'rejected',
    createdAt: '2026-07-22T14:00:00.000Z',
    updatedAt: '2026-07-23T09:00:00.000Z',
  },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialRequests;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const LeaveContext = createContext(null);

export function LeaveProvider({ children }) {
  const [requests, setRequests] = useState(loadData);

  const sync = useCallback((fn) => {
    setRequests(prev => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const createRequest = useCallback((data) => {
    const newRequest = {
      id: generateId(),
      ...data,
      status: 'pending',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    sync(prev => [...prev, newRequest]);
    return newRequest;
  }, [sync]);

  const approveRequest = useCallback((id) => {
    sync(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'approved', updatedAt: nowISO() } : r
    ));
  }, [sync]);

  const rejectRequest = useCallback((id) => {
    sync(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'rejected', updatedAt: nowISO() } : r
    ));
  }, [sync]);

  const getEmployeeRequests = useCallback((employeeId) => {
    return requests.filter(r => r.employeeId === employeeId);
  }, [requests]);

  return (
    <LeaveContext.Provider value={{
      requests,
      createRequest,
      approveRequest,
      rejectRequest,
      getEmployeeRequests,
    }}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error('useLeave must be used within LeaveProvider');
  return ctx;
}
