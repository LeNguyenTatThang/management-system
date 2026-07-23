import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../../contexts/ScheduleContext';
import { Plus, Search, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';
import ScheduleCalendar from '../../components/schedule/ScheduleCalendar';
import { getWeekDates, BRANCHES, SHIFT_TYPES, SHIFT_STATUSES } from '../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_LABELS = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang làm',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

const SHIFT_LABELS = {};
SHIFT_TYPES.forEach(t => { SHIFT_LABELS[t.value] = t.label; });

const BRANCH_LABELS = {};
BRANCHES.forEach(b => { BRANCH_LABELS[b.id] = b.name; });

const fmtTime = (t) => t || '';

export default function Schedules() {
  const navigate = useNavigate();
  const { schedules, deleteSchedule } = useSchedule();

  const [viewMode, setViewMode] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const refDate = new Date(today);
  refDate.setDate(refDate.getDate() + weekOffset * 7);
  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);

  const filtered = useMemo(() => {
    return schedules.filter(s => {
      const matchSearch = !searchTerm || s.employees?.some(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchBranch = !filterBranch || s.branchId === filterBranch;
      const matchShift = !filterShift || s.shiftType === filterShift;
      const matchStatus = !filterStatus || s.status === filterStatus;
      return matchSearch && matchBranch && matchShift && matchStatus;
    });
  }, [schedules, searchTerm, filterBranch, filterShift, filterStatus]);

  const weekSchedules = useMemo(() => {
    const weekDateSet = new Set(weekDates.map(d => d.date));
    return filtered.filter(s => weekDateSet.has(s.date));
  }, [filtered, weekDates]);

  const handleDelete = (id) => {
    const s = schedules.find(x => x.id === id);
    if (!s) return;
    if (window.confirm(`Xóa ca làm việc ngày ${s.date} (${s.startTime}-${s.endTime})?`)) {
      deleteSchedule(id);
      toast.success('Đã xóa ca làm việc');
    }
  };

  const goToPrevWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setWeekOffset(prev => prev + 1);
  const goToToday = () => setWeekOffset(0);

  const weekLabel = `${weekDates[0]?.date || ''} - ${weekDates[6]?.date || ''}`;

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Lịch làm việc</h2>
            <p className="text-muted text-sm">Quản lý lịch làm việc và ca làm việc của nhân viên</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/schedules/create')}>
            <Plus size={18} /> Tạo lịch làm việc
          </button>
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
                key: 'shiftType',
                label: 'Loại ca',
                options: [
                  { value: '', label: 'Tất cả loại ca' },
                  ...SHIFT_TYPES.map(t => ({ value: t.value, label: t.label })),
                ],
              },
              {
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  ...SHIFT_STATUSES.map(s => ({ value: s.value, label: s.label })),
                ],
              },
            ]}
            activeFilters={{ branch: filterBranch, shiftType: filterShift, status: filterStatus }}
            onFilterChange={(key, value) => {
              if (key === 'branch') setFilterBranch(value);
              if (key === 'shiftType') setFilterShift(value);
              if (key === 'status') setFilterStatus(value);
            }}
            onClearAll={() => { setFilterBranch(''); setFilterShift(''); setFilterStatus(''); }}
          />
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm nhân viên..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center p-0.5 bg-muted rounded-md flex-shrink-0">
            <button className={`flex items-center justify-center p-1.5 rounded-sm ${viewMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
              onClick={() => setViewMode('calendar')}><LayoutGrid size={16} /></button>
            <button className={`flex items-center justify-center p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
              onClick={() => setViewMode('list')}><ListIcon size={16} /></button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button className="btn btn-outline flex items-center gap-1 h-32px text-xs" onClick={goToPrevWeek}>
                <ChevronLeft size={14} /> Tuần trước
              </button>
              <button className="btn btn-outline h-32px text-xs" onClick={goToToday}>Hôm nay</button>
              <button className="btn btn-outline flex items-center gap-1 h-32px text-xs" onClick={goToNextWeek}>
                Tuần sau <ChevronRight size={14} />
              </button>
            </div>
            <div className="text-sm font-semibold text-muted">{weekLabel}</div>
          </div>
        )}

        {viewMode === 'calendar' ? (
          <ScheduleCalendar
            weekDates={weekDates}
            schedules={weekSchedules}
            onScheduleClick={(s) => navigate(`/schedules/${s.id}`)}
            onEdit={(s) => navigate(`/schedules/${s.id}/edit`)}
            onDelete={handleDelete}
          />
        ) : (
          <div className="card p-0 overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <ResponsiveTable>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Nhân viên</th>
                    <th>Thời gian</th>
                    <th>Loại ca</th>
                    <th className="hidden md:table-cell">Chi nhánh</th>
                    <th className="hidden md:table-cell">Thời lượng</th>
                    <th>Trạng thái</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="cursor-pointer transition hover-bg-primary-light"
                      onClick={() => navigate(`/schedules/${s.id}`)}>
                      <td className="whitespace-nowrap font-semibold">{s.date}</td>
                      <td>
                        <div className="font-semibold text-sm">
                          {s.employees?.map(e => e.name).join(', ')}
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{s.startTime} - {s.endTime}</td>
                      <td><span className="badge badge-neutral">{SHIFT_LABELS[s.shiftType] || s.shiftType}</span></td>
                      <td className="hidden md:table-cell text-sm text-muted">{BRANCH_LABELS[s.branchId] || s.branchName}</td>
                      <td className="hidden md:table-cell text-sm">{s.duration}h</td>
                      <td>
                        <span className={`badge ${s.status === 'scheduled' ? 'badge-info' : s.status === 'in_progress' ? 'badge-warning' : s.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                          {STATUS_LABELS[s.status] || s.status}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                            onClick={e => { e.stopPropagation(); navigate(`/schedules/${s.id}/edit`); }}>
                            Sửa
                          </button>
                          <button className="p-1.5 text-muted hover-text-danger cursor-pointer"
                            onClick={e => { e.stopPropagation(); handleDelete(s.id); }}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-center text-muted py-8">Không tìm thấy lịch làm việc</td></tr>
                  )}
                </tbody>
              </ResponsiveTable>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
