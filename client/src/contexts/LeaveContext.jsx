import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getLeaveRequests,
  getLeaveRequest,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../services/leaveRequestService';

const LeaveContext = createContext(null);

export function LeaveProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaveRequests(params);
      setRequests(data);
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách đơn xin nghỉ phép');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getRequestById = useCallback(async (id) => {
    try {
      return await getLeaveRequest(id);
    } catch (e) {
      return null;
    }
  }, []);

  const createRequest = useCallback(async (data) => {
    const created = await createLeaveRequest(data);
    setRequests((prev) => [...prev, created]);
    return created;
  }, []);

  const updateRequest = useCallback(async (id, data) => {
    const updated = await updateLeaveRequest(id, data);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const approveRequest = useCallback(async (id) => {
    const updated = await approveLeaveRequest(id);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const rejectRequest = useCallback(async (id) => {
    const updated = await rejectLeaveRequest(id);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  return (
    <LeaveContext.Provider
      value={{
        requests,
        loading,
        error,
        fetchRequests,
        getRequestById,
        createRequest,
        updateRequest,
        approveRequest,
        rejectRequest,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error('useLeave must be used within LeaveProvider');
  return ctx;
}
