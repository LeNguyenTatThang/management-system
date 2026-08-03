import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getAttendances,
  getAttendance,
  createAttendance,
  updateAttendance,
  formatMinutes,
} from '../services/attendanceService';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendances = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendances(params);
      setRecords(data);
    } catch (e) {
      setError(e.message || 'Không thể tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const getRecordById = useCallback(
    async (id) => {
      try {
        return await getAttendance(id);
      } catch (e) {
        return null;
      }
    },
    [],
  );

  const addRecord = useCallback(async (data) => {
    const created = await createAttendance(data);
    setRecords((prev) => [...prev, created]);
    return created;
  }, []);

  const modifyRecord = useCallback(async (id, data) => {
    const updated = await updateAttendance(id, data);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  return (
    <AttendanceContext.Provider
      value={{
        records,
        loading,
        error,
        fetchAttendances,
        getRecordById,
        addRecord,
        modifyRecord,
        formatMinutes,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider');
  return ctx;
}
