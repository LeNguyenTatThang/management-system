import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'dezlab_schedules';

function loadSchedules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveSchedules(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const [schedules, setSchedules] = useState(loadSchedules);

  const sync = useCallback((fn) => {
    setSchedules(prev => {
      const next = fn(prev);
      saveSchedules(next);
      return next;
    });
  }, []);

  const addSchedule = useCallback((data) => {
    sync(prev => {
      const id = `SC${String(prev.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();
      return [...prev, { ...data, id, createdAt: now, updatedAt: now }];
    });
  }, [sync]);

  const updateSchedule = useCallback((id, data) => {
    sync(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
  }, [sync]);

  const deleteSchedule = useCallback((id) => {
    sync(prev => prev.filter(s => s.id !== id));
  }, [sync]);

  const getScheduleById = useCallback((id) => {
    return schedules.find(s => s.id === id) || null;
  }, [schedules]);

  const checkConflict = useCallback((employeeId, date, startTime, endTime, excludeId) => {
    return schedules.filter(s => {
      if (s.id === excludeId) return false;
      if (s.status === 'cancelled') return false;
      return s.employeeIds.includes(employeeId) && s.date === date && s.startTime < endTime && s.endTime > startTime;
    });
  }, [schedules]);

  return (
    <ScheduleContext.Provider value={{ schedules, addSchedule, updateSchedule, deleteSchedule, getScheduleById, checkConflict }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
