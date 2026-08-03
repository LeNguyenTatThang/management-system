import api from './api';

const STATUS_MAP = {
  PENDING: 'pending',
  WORKING: 'working',
  LATE: 'late',
  EARLY_LEAVE: 'early_leave',
  LATE_EARLY: 'late_early',
  COMPLETED: 'completed',
};

const STATUS_LABEL = {
  pending: 'Chưa chấm công',
  working: 'Đang làm việc',
  late: 'Đi trễ',
  early_leave: 'Về sớm',
  late_early: 'Đi trễ + Về sớm',
  completed: 'Đã hoàn thành',
};

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
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

function toView(record) {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employee: record.employee,
    employeeName: record.employee?.name ?? null,
    employeeRole: record.employee?.role ?? null,
    date: formatDate(record.date),
    dateISO: record.date,
    scheduleId: record.scheduleId,
    schedule: record.schedule,
    checkIn: formatDateTime(record.checkIn),
    checkInISO: record.checkIn,
    checkOut: formatDateTime(record.checkOut),
    checkOutISO: record.checkOut,
    scheduledStart: record.scheduledStart,
    scheduledEnd: record.scheduledEnd,
    workedMinutes: record.workedMinutes,
    workedMinutesFormatted: formatMinutes(record.workedMinutes),
    lateMinutes: record.lateMinutes,
    lateMinutesFormatted: formatMinutes(record.lateMinutes),
    earlyLeaveMinutes: record.earlyLeaveMinutes,
    earlyLeaveMinutesFormatted: formatMinutes(record.earlyLeaveMinutes),
    status: STATUS_MAP[record.status] || record.status,
    statusLabel: STATUS_LABEL[STATUS_MAP[record.status]] || record.status,
    rawStatus: record.status,
    note: record.note,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toPayload(data) {
  const payload = {};
  if (data.date) {
    const d = new Date(data.date);
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      payload.date = d.toISOString();
    }
  }
  if (data.note !== undefined) payload.note = data.note;
  return payload;
}

export async function getAttendances(query) {
  const data = await api.get('/attendance', query);
  return (data || []).map(toView);
}

export async function getAttendance(id) {
  const data = await api.get(`/attendance/${id}`);
  return data ? toView(data) : null;
}

export async function createAttendance(data) {
  const result = await api.post('/attendance', toPayload(data));
  return result ? toView(result) : null;
}

export async function updateAttendance(id, data) {
  const payload = {};
  if (data.note !== undefined) payload.note = data.note;
  if (data.status !== undefined) payload.status = data.status;
  const result = await api.patch(`/attendance/${id}`, payload);
  return result ? toView(result) : null;
}

export { STATUS_LABEL, formatMinutes };
