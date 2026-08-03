import api from './api';

const STATUS_MAP = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const STATUS_LABEL = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang làm',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

function toView(schedule) {
  const dateObj = new Date(schedule.date);
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const dateStr = `${dd}/${mm}/${yyyy}`;

  return {
    id: schedule.id,
    employeeId: schedule.employeeId,
    employee: schedule.employee,
    shiftId: schedule.shiftId,
    shift: schedule.shift,
    date: dateStr,
    dateISO: schedule.date,
    shiftType: schedule.shift?.name?.toLowerCase() === 'sáng' ? 'morning'
      : schedule.shift?.name?.toLowerCase() === 'trưa' ? 'noon'
      : schedule.shift?.name?.toLowerCase() === 'chiều' ? 'afternoon'
      : schedule.shift?.name?.toLowerCase() === 'tối' ? 'evening'
      : 'morning',
    checkIn: schedule.checkIn ? new Date(schedule.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : null,
    checkOut: schedule.checkOut ? new Date(schedule.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : null,
    checkInISO: schedule.checkIn,
    checkOutISO: schedule.checkOut,
    status: STATUS_MAP[schedule.status] || schedule.status,
    statusLabel: STATUS_LABEL[STATUS_MAP[schedule.status]] || schedule.status,
    note: schedule.note,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  };
}

function toPayload(data) {
  const payload = {};

  if (data.employeeId !== undefined) payload.employeeId = Number(data.employeeId);
  if (data.shiftId !== undefined) payload.shiftId = Number(data.shiftId);

  if (data.date) {
    const d = new Date(data.date);
    if (!isNaN(d.getTime())) {
      payload.date = d.toISOString();
    }
  }

  if (data.checkIn) {
    const d = new Date(data.checkIn);
    if (!isNaN(d.getTime())) payload.checkIn = d.toISOString();
  }

  if (data.checkOut) {
    const d = new Date(data.checkOut);
    if (!isNaN(d.getTime())) payload.checkOut = d.toISOString();
  }

  if (data.note !== undefined) payload.note = data.note;

  return payload;
}

export async function getWorkSchedules(params) {
  const data = await api.get('/work-schedules', params);
  return (data || []).map(toView);
}

export async function getWorkSchedule(id) {
  const data = await api.get(`/work-schedules/${id}`);
  return data ? toView(data) : null;
}

export async function createWorkSchedule(data) {
  const result = await api.post('/work-schedules', toPayload(data));
  return result ? toView(result) : null;
}

export async function updateWorkSchedule(id, data) {
  const result = await api.patch(`/work-schedules/${id}`, toPayload(data));
  return result ? toView(result) : null;
}

export async function deleteWorkSchedule(id) {
  return api.delete(`/work-schedules/${id}`);
}

export async function getShifts() {
  const data = await api.get('/work-schedules/shifts');
  return data || [];
}

export { STATUS_LABEL };
