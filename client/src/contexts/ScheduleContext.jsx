import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getWorkSchedules,
  createWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule,
} from '../services/scheduleService';

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkSchedules(params);
      setSchedules(data);
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách lịch làm việc');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const addSchedule = useCallback(async (data) => {
    const created = await createWorkSchedule(data);
    setSchedules((prev) => [...prev, created]);
    return created;
  }, []);

  const updateSchedule = useCallback(async (id, data) => {
    const updated = await updateWorkSchedule(id, data);
    setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const removeSchedule = useCallback(async (id) => {
    await deleteWorkSchedule(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getScheduleById = useCallback(
    (id) => schedules.find((s) => String(s.id) === String(id)) || null,
    [schedules],
  );

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        error,
        fetchSchedules,
        addSchedule,
        updateSchedule,
        removeSchedule,
        getScheduleById,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
