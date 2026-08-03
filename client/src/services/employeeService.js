import api from './api';

const STATUS_MAP = {
  ACTIVE: 'Đang làm',
  INACTIVE: 'Đã nghỉ việc',
  ON_LEAVE: 'Tạm nghỉ',
};

const GENDER_MAP = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

const SALARY_TYPE_MAP = {
  MONTHLY: 'Theo tháng',
  PER_SHIFT: 'Theo ca',
};

const STATUS_TO_CODE = {
  'Đang làm': 'ACTIVE',
  'Đã nghỉ việc': 'INACTIVE',
  'Tạm nghỉ': 'ON_LEAVE',
};

const GENDER_TO_CODE = {
  Nam: 'MALE',
  Nữ: 'FEMALE',
  Khác: 'OTHER',
};

const SALARY_TYPE_TO_CODE = {
  'Theo tháng': 'MONTHLY',
  'Theo ca': 'PER_SHIFT',
};

function toView(employee) {
  return {
    ...employee,
    status: STATUS_MAP[employee.status] || employee.status,
    gender: GENDER_MAP[employee.gender] || employee.gender,
    salaryType: SALARY_TYPE_MAP[employee.salaryType] || employee.salaryType,
  };
}

function toPayload(data) {
  const payload = { ...data };
  if (payload.status) payload.status = STATUS_TO_CODE[payload.status] || payload.status;
  if (payload.gender) payload.gender = GENDER_TO_CODE[payload.gender] || payload.gender;
  if (payload.salaryType) payload.salaryType = SALARY_TYPE_TO_CODE[payload.salaryType] || payload.salaryType;
  delete payload.image;
  return payload;
}

export async function getEmployees(query) {
  const data = await api.get('/employees', query);
  return (data || []).map(toView);
}

export async function getEmployee(id) {
  const data = await api.get(`/employees/${id}`);
  return data ? toView(data) : null;
}

export async function getRoles() {
  return (await api.get('/employees/roles')) || [];
}

export async function createEmployee(data) {
  const result = await api.post('/employees', toPayload(data));
  return result ? toView(result) : null;
}

export async function updateEmployee(id, data) {
  const result = await api.patch(`/employees/${id}`, toPayload(data));
  return result ? toView(result) : null;
}

export async function deleteEmployee(id) {
  return api.delete(`/employees/${id}`);
}
