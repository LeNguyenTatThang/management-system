import api from './api';

const STATUS_MAP = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
}

function toView(record) {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employee: record.employee,
    employeeName: record.employee?.name ?? null,
    employeeRole: record.employee?.role ?? null,
    startDateTime: record.startDateTime,
    endDateTime: record.endDateTime,
    startDate: formatDate(record.startDateTime),
    startTime: formatTime(record.startDateTime),
    endDate: formatDate(record.endDateTime),
    endTime: formatTime(record.endDateTime),
    reason: record.reason,
    status: STATUS_MAP[record.status] || record.status,
    statusLabel: STATUS_LABEL[STATUS_MAP[record.status]] || record.status,
    rawStatus: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toPayload(data) {
  const payload = {};

  if (data.startDateTime) {
    payload.startDateTime = data.startDateTime;
  } else if (data.startDate && data.startTime) {
    const [dd, mm, yyyy] = data.startDate.split('/');
    const [hh, mi] = data.startTime.split(':');
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi));
    if (!isNaN(d.getTime())) payload.startDateTime = d.toISOString();
  }

  if (data.endDateTime) {
    payload.endDateTime = data.endDateTime;
  } else if (data.endDate && data.endTime) {
    const [dd, mm, yyyy] = data.endDate.split('/');
    const [hh, mi] = data.endTime.split(':');
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi));
    if (!isNaN(d.getTime())) payload.endDateTime = d.toISOString();
  }

  if (data.reason !== undefined) payload.reason = data.reason;

  return payload;
}

export async function getLeaveRequests(query) {
  const data = await api.get('/leave-requests', query);
  return (data || []).map(toView);
}

export async function getLeaveRequest(id) {
  const data = await api.get(`/leave-requests/${id}`);
  return data ? toView(data) : null;
}

export async function createLeaveRequest(data) {
  const result = await api.post('/leave-requests', toPayload(data));
  return result ? toView(result) : null;
}

export async function updateLeaveRequest(id, data) {
  const result = await api.patch(`/leave-requests/${id}`, toPayload(data));
  return result ? toView(result) : null;
}

export async function approveLeaveRequest(id) {
  const result = await api.patch(`/leave-requests/${id}/approve`);
  return result ? toView(result) : null;
}

export async function rejectLeaveRequest(id) {
  const result = await api.patch(`/leave-requests/${id}/reject`);
  return result ? toView(result) : null;
}

export { STATUS_LABEL };
