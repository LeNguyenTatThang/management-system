import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import ScheduleCalendar from '../../components/schedule/ScheduleCalendar';
import { getWeekDates, SHIFT_TYPES } from '../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const SHIFT_LABELS = {};
SHIFT_TYPES.forEach(t => { SHIFT_LABELS[t.value] = t.label; });

const STATUS_LABELS = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang làm',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_BADGE = {
  scheduled: 'badge-info',
  in_progress: 'badge-warning',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

export default function Schedules() {
  const navigate = useNavigate();
  const { schedules, loading, error, fetchSchedules, removeSchedule } = useSchedule();
  const { hasPermission } = useAuth();

  const [viewMode, setViewMode] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const refDate = new Date(today);
  refDate.setDate(refDate.getDate() + weekOffset * 7);
  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);

  const canCreate = hasPermission('hr.schedule.create');
  const canUpdate = hasPermission('hr.schedule.update');
  const canDelete = hasPermission('hr.schedule.delete');

  const weekSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchSearch = !searchTerm || s.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchShift = !filterShift || s.shiftType === filterShift;
      const d = new Date(s.dateISO);
      const weekStart = weekDates[0] ? parseDateStr(weekDates[0].date) : null;
      const weekEnd = weekDates[6] ? parseDateStr(weekDates[6].date) : null;
      const matchWeek = (!weekStart || d >= weekStart) && (!weekEnd || d <= weekEnd);
      return matchSearch && matchShift && matchWeek;
    });
  }, [schedules, searchTerm, filterShift, weekDates]);

  const handleDelete = async (id) => {
    const s = schedules.find(x => x.id === id);
    if (!s) return;
    if (window.confirm(`Xóa ca làm việc ngày ${s.date} (${SHIFT_LABELS[s.shiftType] || s.shiftType})?`)) {
      try {
        await removeSchedule(id);
        toast.success('Đã xóa ca làm việc');
      } catch (e) {
        toast.error(e.message || 'Không thể xóa');
      }
    }
  };

  const goToPrevWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setWeekOffset(prev => prev + 1);
  const goToToday = () => setWeekOffset(0);

  const weekLabel = `${weekDates[0]?.date || ''} - ${weekDates[6]?.date || ''}`;

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-lg font-bold mb-2">Không thể tải danh sách lịch làm việc</h2>
          <p className="text-muted text-sm mb-4">{error}</p>
          <button className="btn btn-primary" onClick={() => fetchSchedules()}>Thử lại</button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Lịch làm việc</h2>
            <p className="text-muted text-sm">Quản lý lịch làm việc và ca làm việc của nhân viên</p>
          </div>
          {canCreate && (
            <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
              onClick={() => navigate('/schedules/create')}>
              <Plus size={18} /> Tạo lịch làm việc
            </button>
          )}
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <select className="h-36px text-sm border rounded px-2" value={filterShift} onChange={e => setFilterShift(e.target.value)}>
              <option value="">Tất cả ca</option>
              {SHIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
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

        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto mb-2 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted">Đang tải...</p>
          </div>
        )}

        {!loading && viewMode === 'calendar' && (
          <ScheduleCalendar
            weekDates={weekDates}
            schedules={weekSchedules}
            onScheduleClick={(s) => navigate(`/schedules/${s.id}`)}
            onEdit={canUpdate ? (s) => navigate(`/schedules/${s.id}/edit`) : undefined}
            onDelete={canDelete ? handleDelete : undefined}
          />
        )}

        {!loading && viewMode === 'list' && (
          <div className="card p-0 overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <ResponsiveTable>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Nhân viên</th>
                    <th>Ca</th>
                    <th>Trạng thái</th>
                    {canUpdate && <th className="text-right">Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {weekSchedules.map(s => (
                    <tr key={s.id} className="cursor-pointer transition hover-bg-primary-light"
                      onClick={() => navigate(`/schedules/${s.id}`)}>
                      <td className="whitespace-nowrap font-semibold">{s.date}</td>
                      <td>
                        <div className="font-semibold text-sm">{s.employee?.name || 'N/A'}</div>
                        <div className="text-xs text-muted">{s.employee?.role || ''}</div>
                      </td>
                      <td><span className="badge badge-neutral">{SHIFT_LABELS[s.shiftType] || s.shiftType}</span></td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[s.status] || 'badge-neutral'}`}>
                          {STATUS_LABELS[s.status] || s.status}
                        </span>
                      </td>
                      {canUpdate && (
                        <td className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                              onClick={e => { e.stopPropagation(); navigate(`/schedules/${s.id}/edit`); }}>
                              Sửa
                            </button>
                            {canDelete && (
                              <button className="p-1.5 text-muted hover-text-danger cursor-pointer"
                                onClick={e => { e.stopPropagation(); handleDelete(s.id); }}>
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {weekSchedules.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-8">Không tìm thấy lịch làm việc</td></tr>
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

function parseDateStr(dateStr) {
  const parts = dateStr.split('/');
  return new Date(+parts[2], +parts[1] - 1, +parts[0]);
}
