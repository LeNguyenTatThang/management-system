export const SHIFT_TYPES = [
  { value: 'morning', label: 'Sáng' },
  { value: 'noon', label: 'Trưa' },
  { value: 'afternoon', label: 'Chiều' },
  { value: 'evening', label: 'Tối' },
];

export const SHIFT_STATUSES = [
  { value: 'scheduled', label: 'Đã lên lịch' },
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const BRANCHES = [
  { id: 'CN01', name: 'Chi nhánh Quận 1', address: 'Số 1 Nguyễn Huệ, Quận 1' },
  { id: 'CN02', name: 'Chi nhánh Quận 3', address: 'Số 28 Lý Chính Thắng, Quận 3' },
  { id: 'CN03', name: 'Chi nhánh Thủ Đức', address: 'Số 15 Võ Văn Ngân, Thủ Đức' },
  { id: 'CN04', name: 'Kho trung tâm', address: 'Số 100 Xa lộ Hà Nội, Thủ Đức' },
];

export function formatTime(timeStr) {
  return timeStr;
}

export function formatDate(dateStr) {
  return dateStr;
}

export function getDayOfWeek(dateStr) {
  const parts = dateStr.split('/');
  const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[d.getDay()];
}

export function getWeekDates(referenceDate) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    const dd = String(next.getDate()).padStart(2, '0');
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    const yyyy = next.getFullYear();
    dates.push({ date: `${dd}/${mm}/${yyyy}`, dayLabel: getDayOfWeek(`${dd}/${mm}/${yyyy}`) });
  }
  return dates;
}
