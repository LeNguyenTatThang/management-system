import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../../contexts/AttendanceContext';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, LogIn, LogOut, Users, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';
import { SHIFT_TYPES } from '../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Chưa chấm công', badge: 'badge-neutral' },
  working: { label: 'Đang làm việc', badge: 'badge-info' },
  completed: { label: 'Đã hoàn thành', badge: 'badge-success' },
  late: { label: 'Đi trễ', badge: 'badge-warning' },
  early_leave: { label: 'Về sớm', badge: 'badge-warning' },
  late_early: { label: 'Đi trễ + Về sớm', badge: 'badge-warning' },
};

const STAT_CARDS = [
  { key: 'total', label: 'Tổng NV', color: '#6c111e', bg: 'rgba(108,17,30,0.08)' },
  { key: 'checkedIn', label: 'Đã check-in', color: '#10b981', bg: '#d1fae5' },
  { key: 'working', label: 'Đang làm', color: '#3b82f6', bg: '#dbeafe' },
  { key: 'checkedOut', label: 'Đã check-out', color: '#6366f1', bg: '#e0e7ff' },
  { key: 'late', label: 'Đi trễ', color: '#f59e0b', bg: '#fef3c7' },
];

const ICONS = { total: Users, checkedIn: LogIn, working: Clock, checkedOut: CheckCircle, late: AlertTriangle };

function todayStr() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toQueryString(dateRange) {
  const d = new Date();
  const fmt = (y, m, day) => `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (dateRange === 'today') {
    return { date: fmt(d.getFullYear(), d.getMonth(), d.getDate()) };
  }
  if (dateRange === 'yesterday') {
    d.setDate(d.getDate() - 1);
    return { date: fmt(d.getFullYear(), d.getMonth(), d.getDate()) };
  }
  if (dateRange === 'week') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diff);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { from: fmt(mon.getFullYear(), mon.getMonth(), mon.getDate()), to: fmt(sun.getFullYear(), sun.getMonth(), sun.getDate()) };
  }
  if (dateRange === 'month') {
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { from: fmt(first.getFullYear(), first.getMonth(), first.getDate()), to: fmt(last.getFullYear(), last.getMonth(), last.getDate()) };
  }
  return {};
}

export default function Attendance() {
  const navigate = useNavigate();
  const { records, loading, error, fetchAttendances, addRecord, modifyRecord, formatMinutes } = useAttendance();
  const { staffList } = useStaff();
  const { user, hasPermission } = useAuth();
  const today = todayStr();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchAttendances(toQueryString(dateRange));
  }, [dateRange, fetchAttendances]);

  const stats = useMemo(() => {
    const total = staffList.filter(s => s.status === 'Đang làm').length;
    const checkedIn = records.filter(r => r.checkIn).length;
    const working = records.filter(r => r.status === 'working').length;
    const checkedOut = records.filter(r => r.checkOut).length;
    const late = records.filter(r => r.status === 'late' || r.status === 'late_early').length;
    const absent = total - checkedIn;
    return { total, checkedIn, working, checkedOut, late, absent };
  }, [staffList, records]);

  const currentEmployee = useMemo(() => {
    if (!user) return null;
    return staffList.find(s => s.email === user.email) || null;
  }, [user, staffList]);

  const myTodayRecord = useMemo(() => {
    if (!currentEmployee) return null;
    const todayISO = new Date().toISOString().slice(0, 10);
    return records.find(r => r.employeeId === currentEmployee.id && r.dateISO?.startsWith(todayISO)) || null;
  }, [currentEmployee, records]);

  const handleCheckIn = async () => {
    if (!currentEmployee) { toast.error('Không tìm thấy thông tin nhân viên'); return; }
    if (myTodayRecord?.checkIn) { toast.error('Bạn đã check-in hôm nay'); return; }
    setChecking(true);
    try {
      const result = await addRecord({ date: new Date().toISOString() });
      toast.success(`Check-in thành công lúc ${result.checkIn}`);
    } catch (e) {
      toast.error(e.message || 'Không thể check-in');
    } finally { setChecking(false); }
  };

  const handleCheckOut = async () => {
    if (!currentEmployee) { toast.error('Không tìm thấy thông tin nhân viên'); return; }
    if (!myTodayRecord?.checkIn) { toast.error('Bạn chưa check-in'); return; }
    if (myTodayRecord?.checkOut) { toast.error('Bạn đã check-out hôm nay'); return; }
    setChecking(true);
    try {
      const result = await modifyRecord(myTodayRecord.id, {});
      toast.success(`Check-out thành công lúc ${result.checkOut}`);
    } catch (e) {
      toast.error(e.message || 'Không thể check-out');
    } finally { setChecking(false); }
  };

  const filteredRecords = useMemo(() => {
    let list = records;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => r.employeeName?.toLowerCase().includes(q));
    }
    if (filterStatus) {
      list = list.filter(r => r.status === filterStatus);
    }
    return list;
  }, [records, searchTerm, filterStatus]);

  const dateFilterOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'yesterday', label: 'Hôm qua' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'all', label: 'Tất cả' },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12">
          <XCircle size={48} className="text-danger mb-4" />
          <p className="text-danger font-semibold">{error}</p>
          <button className="btn btn-primary mt-4" onClick={() => fetchAttendances(toQueryString(dateRange))}>
            Thử lại
          </button>
        </div>
      </PageContainer>
    );
  }

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
                {myTodayRecord?.checkIn && (
                  <div className="text-xs text-muted mt-0.5">
                    Check-in: {myTodayRecord.checkIn}
                    {myTodayRecord.checkOut && ` | Check-out: ${myTodayRecord.checkOut}`}
                    {myTodayRecord.workedMinutesFormatted && ` | Làm: ${myTodayRecord.workedMinutesFormatted}`}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!myTodayRecord?.checkIn ? (
                  hasPermission('hr.attendance.create') && (
                    <button className="btn btn-primary flex items-center gap-2 h-40px whitespace-nowrap"
                      onClick={handleCheckIn} disabled={checking}>
                      <LogIn size={18} /> {checking ? 'Đang check-in...' : 'Check-in'}
                    </button>
                  )
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

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full min-w-0">
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
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
                ],
              },
            ]}
            activeFilters={{ status: filterStatus }}
            onFilterChange={(key, value) => {
              if (key === 'status') setFilterStatus(value);
            }}
            onClearAll={() => setFilterStatus('')}
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
                {loading ? (
                  <tr><td colSpan={10} className="text-center text-muted py-8">Đang tải dữ liệu...</td></tr>
                ) : filteredRecords.map((r, idx) => {
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
                      <td className="hidden md:table-cell text-sm">
                        {r.scheduledStart && r.scheduledEnd
                          ? `${r.scheduledStart}-${r.scheduledEnd}`
                          : r.schedule?.shift?.startTime && r.schedule?.shift?.endTime
                            ? `${r.schedule.shift.startTime}-${r.schedule.shift.endTime}`
                            : '—'}
                      </td>
                      <td className="text-sm whitespace-nowrap">{r.date}</td>
                      <td className="font-semibold">{r.checkIn || '—'}</td>
                      <td className="font-semibold">{r.checkOut || '—'}</td>
                      <td className="hidden md:table-cell text-sm">{r.workedMinutesFormatted || '—'}</td>
                      <td className="hidden md:table-cell">
                        {r.lateMinutes > 0 ? (
                          <span className="text-xs text-warning font-semibold">{r.lateMinutesFormatted}</span>
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
                {!loading && filteredRecords.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted py-8">Chưa có dữ liệu chấm công</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
