import { createContext, useContext, useState, useCallback } from 'react';
import { BRANCHES } from '../utils/shiftConfig';

const STORAGE_KEY = 'dezlab_attendance';

function todayStr(offset) {
  const d = new Date();
  if (offset) d.setDate(d.getDate() + offset);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const initialAttendance = [
  { id: 'AT001', employeeId: 'NV01', employeeName: 'Nguyễn Văn A', employeeRole: 'Quản lý', scheduleId: null, branchId: 'CN01', branchName: 'Chi nhánh Quận 1', workDate: todayStr(-1), scheduledStart: '08:00', scheduledEnd: '16:00', checkIn: '07:55', checkOut: '16:05', workedMinutes: 490, lateMinutes: 0, earlyLeaveMinutes: 0, status: 'completed', note: '', createdAt: '2026-07-23T07:55:00.000Z', updatedAt: '2026-07-23T16:05:00.000Z' },
  { id: 'AT002', employeeId: 'NV02', employeeName: 'Trần Thị B', employeeRole: 'Thu ngân', scheduleId: null, branchId: 'CN01', branchName: 'Chi nhánh Quận 1', workDate: todayStr(-1), scheduledStart: '08:00', scheduledEnd: '16:00', checkIn: '08:12', checkOut: '16:00', workedMinutes: 468, lateMinutes: 12, earlyLeaveMinutes: 0, status: 'late', note: 'Kẹt xe', createdAt: '2026-07-23T08:12:00.000Z', updatedAt: '2026-07-23T16:00:00.000Z' },
  { id: 'AT003', employeeId: 'NV03', employeeName: 'Lê Văn C', employeeRole: 'Nhân viên pha chế', scheduleId: null, branchId: 'CN01', branchName: 'Chi nhánh Quận 1', workDate: todayStr(-1), scheduledStart: '08:00', scheduledEnd: '16:00', checkIn: '07:58', checkOut: '15:30', workedMinutes: 452, lateMinutes: 0, earlyLeaveMinutes: 30, status: 'early_leave', note: '', createdAt: '2026-07-23T07:58:00.000Z', updatedAt: '2026-07-23T15:30:00.000Z' },
  { id: 'AT004', employeeId: 'NV01', employeeName: 'Nguyễn Văn A', employeeRole: 'Quản lý', scheduleId: null, branchId: 'CN02', branchName: 'Chi nhánh Quận 3', workDate: todayStr(0), scheduledStart: '08:00', scheduledEnd: '16:00', checkIn: '07:58', checkOut: null, workedMinutes: null, lateMinutes: 0, earlyLeaveMinutes: 0, status: 'working', note: '', createdAt: '2026-07-24T07:58:00.000Z', updatedAt: '2026-07-24T07:58:00.000Z' },
  { id: 'AT005', employeeId: 'NV02', employeeName: 'Trần Thị B', employeeRole: 'Thu ngân', scheduleId: null, branchId: 'CN01', branchName: 'Chi nhánh Quận 1', workDate: todayStr(0), scheduledStart: '08:00', scheduledEnd: '16:00', checkIn: '08:05', checkOut: null, workedMinutes: null, lateMinutes: 5, earlyLeaveMinutes: 0, status: 'late', note: '', createdAt: '2026-07-24T08:05:00.000Z', updatedAt: '2026-07-24T08:05:00.000Z' },
  { id: 'AT006', employeeId: 'NV03', employeeName: 'Lê Văn C', employeeRole: 'Nhân viên pha chế', scheduleId: null, branchId: 'CN03', branchName: 'Chi nhánh Thủ Đức', workDate: todayStr(0), scheduledStart: '12:00', scheduledEnd: '18:00', checkIn: null, checkOut: null, workedMinutes: null, lateMinutes: 0, earlyLeaveMinutes: 0, status: 'pending', note: '', createdAt: '', updatedAt: '' },
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialAttendance;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function todayDDMMYYYY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function diffMinutes(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function formatMinutes(mins) {
  if (mins == null || isNaN(mins)) return null;
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  const sign = mins < 0 ? '-' : '';
  if (h > 0 && m > 0) return `${sign}${h}h${m}`;
  if (h > 0) return `${sign}${h}h`;
  return `${sign}${m}p`;
}

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [records, setRecords] = useState(loadData);

  const sync = useCallback((fn) => {
    setRecords(prev => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const getTodayRecord = useCallback((employeeId) => {
    const today = todayDDMMYYYY();
    return records.find(r => r.employeeId === employeeId && r.workDate === today) || null;
  }, [records]);

  const getTodayRecords = useCallback(() => {
    const today = todayDDMMYYYY();
    return records.filter(r => r.workDate === today);
  }, [records]);

  const checkIn = useCallback((employeeId, employeeName, employeeRole, schedule, branchId, branchName, note) => {
    const existing = getTodayRecord(employeeId);
    if (existing && existing.checkIn) return null;
    const now = nowHHMM();
    const scheduledStart = schedule?.startTime || now;
    const scheduledEnd = schedule?.endTime || '';
    const lateMinutes = scheduledStart && now > scheduledStart ? diffMinutes(scheduledStart, now) : 0;
    const status = lateMinutes > 0 ? 'late' : 'working';
    const newRecord = {
      id: `AT${String(records.length + 1).padStart(3, '0')}`,
      employeeId,
      employeeName,
      employeeRole,
      scheduleId: schedule?.id || null,
      branchId: branchId || '',
      branchName: branchName || '',
      workDate: todayDDMMYYYY(),
      scheduledStart,
      scheduledEnd,
      checkIn: now,
      checkOut: null,
      workedMinutes: null,
      lateMinutes,
      earlyLeaveMinutes: 0,
      status,
      note: note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sync(prev => [...prev, newRecord]);
    return newRecord;
  }, [getTodayRecord, sync, records.length]);

  const checkOut = useCallback((employeeId) => {
    const record = getTodayRecord(employeeId);
    if (!record || record.checkOut) return null;
    const now = nowHHMM();
    const workedMinutes = record.scheduledStart ? diffMinutes(record.checkIn, now) : null;
    let lateMinutes = record.lateMinutes;
    let earlyLeaveMinutes = 0;
    if (record.scheduledEnd && now < record.scheduledEnd) {
      earlyLeaveMinutes = diffMinutes(now, record.scheduledEnd);
    }
    let status = 'completed';
    if (lateMinutes > 0 && earlyLeaveMinutes > 0) status = 'late_early';
    else if (lateMinutes > 0) status = 'late';
    else if (earlyLeaveMinutes > 0) status = 'early_leave';
    sync(prev => prev.map(r =>
      r.id === record.id
        ? { ...r, checkOut: now, workedMinutes, lateMinutes, earlyLeaveMinutes, status, updatedAt: new Date().toISOString() }
        : r
    ));
    return { ...record, checkOut: now, workedMinutes, lateMinutes, earlyLeaveMinutes, status };
  }, [getTodayRecord, sync]);

  const getRecordById = useCallback((id) => records.find(r => r.id === id) || null, [records]);

  const updateRecord = useCallback((id, data) => {
    sync(prev => prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r));
  }, [sync]);

  const getRecordsByDateRange = useCallback((fromDate, toDate) => {
    const fromParts = fromDate.split('/');
    const toParts = toDate.split('/');
    const from = new Date(+fromParts[2], +fromParts[1] - 1, +fromParts[0]);
    const to = new Date(+toParts[2], +toParts[1] - 1, +toParts[0]);
    return records.filter(r => {
      const p = r.workDate.split('/');
      const d = new Date(+p[2], +p[1] - 1, +p[0]);
      return d >= from && d <= to;
    });
  }, [records]);

  return (
    <AttendanceContext.Provider value={{
      records, getTodayRecord, getTodayRecords, checkIn, checkOut,
      getRecordById, updateRecord, getRecordsByDateRange, formatMinutes
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider');
  return ctx;
}
