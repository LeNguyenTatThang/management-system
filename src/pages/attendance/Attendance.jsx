import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useStaff } from '../../contexts/StaffContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, LogIn, LogOut, Users, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';
import { BRANCHES, SHIFT_TYPES } from '../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Chưa chấm công', badge: 'badge-neutral' },
  working: { label: 'Đang làm việc', badge: 'badge-info' },
  completed: { label: 'Đã hoàn thành', badge: 'badge-success' },
  late: { label: 'Đi trễ', badge: 'badge-warning' },
  early_leave: { label: 'Về sớm', badge: 'badge-warning' },
  late_early: { label: 'Đi trễ + Về sớm', badge: 'badge-warning' },
  absent: { label: 'Vắng mặt', badge: 'badge-danger' },
  leave: { label: 'Nghỉ phép', badge: 'badge-info' },
};

const STAT_CARDS = [
  { key: 'total', label: 'Tổng NV', color: '#6c111e', bg: 'rgba(108,17,30,0.08)' },
  { key: 'checkedIn', label: 'Đã check-in', color: '#10b981', bg: '#d1fae5' },
  { key: 'working', label: 'Đang làm', color: '#3b82f6', bg: '#dbeafe' },
  { key: 'checkedOut', label: 'Đã check-out', color: '#6366f1', bg: '#e0e7ff' },
  { key: 'late', label: 'Đi trễ', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'absent', label: 'Vắng mặt', color: '#ef4444', bg: '#fee2e2' },
];

const ICONS = { total: Users, checkedIn: LogIn, working: Clock, checkedOut: CheckCircle, late: AlertTriangle, absent: XCircle };

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function Attendance() {
  const navigate = useNavigate();
  const { records, getTodayRecords, checkIn, checkOut, formatMinutes } = useAttendance();
  const { staffList } = useStaff();
  const { schedules } = useSchedule();
  const { user } = useAuth();
  const today = todayStr();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [checkNote, setCheckNote] = useState('');
  const [checking, setChecking] = useState(false);

  const todayRecords = useMemo(() => getTodayRecords(), [getTodayRecords, records]);

  const stats = useMemo(() => {
    const total = staffList.filter(s => s.status === 'Đang làm').length;
    const checkedIn = todayRecords.filter(r => r.checkIn).length;
    const working = todayRecords.filter(r => r.status === 'working').length;
    const checkedOut = todayRecords.filter(r => r.checkOut).length;
    const late = todayRecords.filter(r => r.status === 'late' || r.status === 'late_early').length;
    const absent = total - checkedIn;
    return { total, checkedIn, working, checkedOut, late, absent };
  }, [staffList, todayRecords]);

  const currentEmployee = useMemo(() => {
    if (!user) return null;
    return staffList.find(s => s.email === user.email) || null;
  }, [user, staffList]);

  const myTodayRecord = useMemo(() => {
    if (!currentEmployee) return null;
    return todayRecords.find(r => r.employeeId === currentEmployee.id) || null;
  }, [currentEmployee, todayRecords]);

  const myTodaySchedule = useMemo(() => {
    if (!currentEmployee) return null;
    return schedules.find(s => s.date === today && s.employeeIds?.includes(currentEmployee.id) && s.status !== 'cancelled') || null;
  }, [currentEmployee, schedules, today]);

  const handleCheckIn = async () => {
    if (!currentEmployee) { toast.error('Không tìm thấy thông tin nhân viên'); return; }
    if (myTodayRecord?.checkIn) { toast.error('Bạn đã check-in hôm nay'); return; }
    setChecking(true);
    try {
      const branchId = myTodaySchedule?.branchId || 'CN01';
      const branchName = BRANCHES.find(b => b.id === branchId)?.name || branchId;
      const result = checkIn(currentEmployee.id, currentEmployee.name, currentEmployee.role, myTodaySchedule, branchId, branchName, checkNote);
      if (result) toast.success(`Check-in thành công lúc ${result.checkIn}`);
      else toast.error('Không thể check-in');
    } finally { setChecking(false); }
  };

  const handleCheckOut = async () => {
    if (!currentEmployee) { toast.error('Không tìm thấy thông tin nhân viên'); return; }
    if (!myTodayRecord?.checkIn) { toast.error('Bạn chưa check-in'); return; }
    if (myTodayRecord?.checkOut) { toast.error('Bạn đã check-out hôm nay'); return; }
    setChecking(true);
    try {
      const result = checkOut(currentEmployee.id);
      if (result) toast.success(`Check-out thành công lúc ${result.checkOut}`);
      else toast.error('Không thể check-out');
    } finally { setChecking(false); }
  };

  const filteredRecords = useMemo(() => {
    let list = records;
    if (dateRange === 'today') {
      list = list.filter(r => r.workDate === today);
    } else if (dateRange === 'yesterday') {
      const d = new Date(); d.setDate(d.getDate() - 1);
      const yStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      list = list.filter(r => r.workDate === yStr);
    } else if (dateRange === 'week') {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(now.setDate(diff));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      const ms = fmt(mon), ss = fmt(sun);
      list = list.filter(r => r.workDate >= ms && r.workDate <= ss);
    } else if (dateRange === 'month') {
      const now = new Date();
      const fmt = (y, m, d) => `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;
      const first = fmt(now.getFullYear(), now.getMonth(), 1);
      const last = fmt(now.getFullYear(), now.getMonth(), new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
      list = list.filter(r => r.workDate >= first && r.workDate <= last);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => r.employeeName?.toLowerCase().includes(q));
    }
    if (filterBranch) list = list.filter(r => r.branchId === filterBranch);
    if (filterStatus) list = list.filter(r => r.status === filterStatus);
    if (filterShift) {
      list = list.filter(r => {
        const s = schedules.find(s => s.id === r.scheduleId);
        return s?.shiftType === filterShift;
      });
    }
    return list.sort((a, b) => {
      if (a.workDate !== b.workDate) return b.workDate.localeCompare(a.workDate);
      return (a.checkIn || '').localeCompare(b.checkIn || '');
    });
  }, [records, dateRange, searchTerm, filterBranch, filterStatus, filterShift, schedules, today]);

  const dateFilterOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'yesterday', label: 'Hôm qua' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'all', label: 'Tất cả' },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Chấm công</h2>
            <p className="text-muted text-sm">Quản lý thời gian làm việc và tình trạng chấm công của nhân viên</p>
          </div>
        </div>

        {currentEmployee && (
          <div className="card p-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center text-lg font-bold">
                {currentEmployee.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-base">{currentEmployee.name}</div>
                <div className="text-sm text-muted">{currentEmployee.role}</div>
                {myTodaySchedule && (
                  <div className="text-xs text-muted mt-0.5">
                    Ca làm: {myTodaySchedule.startTime} - {myTodaySchedule.endTime}
                    {myTodaySchedule.branchName && ` @ ${myTodaySchedule.branchName}`}
                  </div>
                )}
                {myTodayRecord?.checkIn && (
                  <div className="text-xs text-muted mt-0.5">
                    Check-in: {myTodayRecord.checkIn}
                    {myTodayRecord.checkOut && ` | Check-out: ${myTodayRecord.checkOut}`}
                    {myTodayRecord.workedMinutes != null && ` | Làm: ${formatMinutes(myTodayRecord.workedMinutes)}`}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!myTodaySchedule && dateRange === 'today' && (
                  <div className="text-xs text-warning flex items-center gap-1">
                    <AlertTriangle size={14} /> Không có lịch hôm nay
                  </div>
                )}
                {!myTodayRecord?.checkIn ? (
                  <button className="btn btn-primary flex items-center gap-2 h-40px whitespace-nowrap"
                    onClick={handleCheckIn} disabled={checking}>
                    <LogIn size={18} /> {checking ? 'Đang check-in...' : 'Check-in'}
                  </button>
                ) : !myTodayRecord?.checkOut ? (
                  <button className="btn btn-warning flex items-center gap-2 h-40px whitespace-nowrap"
                    onClick={handleCheckOut} disabled={checking}>
                    <LogOut size={18} /> {checking ? 'Đang check-out...' : 'Check-out'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success-light text-success text-sm font-semibold">
                    <CheckCircle size={18} /> Đã hoàn thành
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full min-w-0">
          {STAT_CARDS.map(({ key, label, color, bg }) => {
            const Icon = ICONS[key];
            const value = stats[key];
            return (
              <div key={key} className="card p-3 flex flex-col gap-1" style={{ backgroundColor: bg }}>
                <div className="flex items-center gap-1.5">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                </div>
                <span className="text-xl font-bold" style={{ color }}>{value}</span>
              </div>
            );
          })}
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <FilterPopover
            filters={[
              {
                key: 'branch',
                label: 'Chi nhánh',
                options: [
                  { value: '', label: 'Tất cả chi nhánh' },
                  ...BRANCHES.map(b => ({ value: b.id, label: b.name })),
                ],
              },
              {
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
                ],
              },
              {
                key: 'shiftType',
                label: 'Loại ca',
                options: [
                  { value: '', label: 'Tất cả ca' },
                  ...SHIFT_TYPES.map(t => ({ value: t.value, label: t.label })),
                ],
              },
            ]}
            activeFilters={{ branch: filterBranch, status: filterStatus, shiftType: filterShift }}
            onFilterChange={(key, value) => {
              if (key === 'branch') setFilterBranch(value);
              if (key === 'status') setFilterStatus(value);
              if (key === 'shiftType') setFilterShift(value);
            }}
            onClearAll={() => { setFilterBranch(''); setFilterStatus(''); setFilterShift(''); }}
          />
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm nhân viên..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 p-0.5 bg-muted rounded-md flex-shrink-0">
            {dateFilterOptions.map(opt => (
              <button key={opt.value}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${dateRange === opt.value ? 'bg-white shadow-sm text-primary' : 'text-muted hover-text-primary'}`}
                onClick={() => setDateRange(opt.value)}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th className="w-12 text-center">STT</th>
                  <th>Nhân viên</th>
                  <th className="hidden md:table-cell">Chi nhánh</th>
                  <th className="hidden md:table-cell">Ca làm</th>
                  <th>Ngày</th>
                  <th>Giờ vào</th>
                  <th>Giờ ra</th>
                  <th className="hidden md:table-cell">Làm</th>
                  <th className="hidden md:table-cell">Trễ</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={r.id} className="cursor-pointer transition hover-bg-primary-light"
                      onClick={() => navigate(`/attendance/${r.id}`)}>
                      <td className="text-center text-muted text-sm">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {r.employeeName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{r.employeeName}</div>
                            <div className="text-xs text-muted">{r.employeeRole}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell text-sm text-muted">{r.branchName}</td>
                      <td className="hidden md:table-cell text-sm">{r.scheduledStart}-{r.scheduledEnd}</td>
                      <td className="text-sm whitespace-nowrap">{r.workDate}</td>
                      <td className="font-semibold">{r.checkIn || '—'}</td>
                      <td className="font-semibold">{r.checkOut || '—'}</td>
                      <td className="hidden md:table-cell text-sm">{formatMinutes(r.workedMinutes) || '—'}</td>
                      <td className="hidden md:table-cell">
                        {r.lateMinutes > 0 ? (
                          <span className="text-xs text-warning font-semibold">{formatMinutes(r.lateMinutes)}</span>
                        ) : '—'}
                      </td>
                      <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                      <td className="text-right">
                        <button className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                          onClick={e => { e.stopPropagation(); navigate(`/attendance/${r.id}`); }}>
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={11} className="text-center text-muted py-8">Chưa có dữ liệu chấm công</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
