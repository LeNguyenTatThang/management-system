import { getDayOfWeek, HOUR_LABELS, BRANCHES } from '../../utils/shiftConfig';
import { Edit3, Trash2, MapPin, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const SHIFT_COLORS = {
  morning: { bg: 'rgba(108, 17, 30, 0.08)', border: '#6c111e', text: '#6c111e' },
  afternoon: { bg: 'rgba(245, 158, 11, 0.12)', border: '#d97706', text: '#92400e' },
  evening: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#1e40af' },
  flexible: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#065f46' },
};

const STATUS_LABELS = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang làm',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

export default function ScheduleCalendar({ weekDates, schedules, onScheduleClick, onEdit, onDelete }) {
  const schedulesByDate = {};
  weekDates.forEach(({ date }) => { schedulesByDate[date] = []; });
  schedules.forEach(s => {
    if (schedulesByDate[s.date]) {
      schedulesByDate[s.date].push(s);
    }
  });

  return (
    <div className="card p-0 overflow-hidden min-w-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 700 }}>
          <thead>
            <tr className="border-b border-soft">
              <th className="w-16 py-2 px-2 text-xs text-muted font-semibold text-center sticky left-0 bg-white z-10">Giờ</th>
              {weekDates.map(({ date, dayLabel }) => (
                <th key={date} className="py-2 px-2 text-center min-w-120px">
                  <div className="text-xs text-muted">{dayLabel}</div>
                  <div className="text-sm font-bold">{date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOUR_LABELS.filter(h => {
              const hour = parseInt(h);
              return hour >= 6 && hour <= 21;
            }).map(hour => (
              <tr key={hour} className="border-b border-soft">
                <td className="py-3 px-2 text-xs text-muted sticky left-0 bg-white z-10 whitespace-nowrap">{hour}</td>
                {weekDates.map(({ date }) => {
                  const cellSchedules = schedulesByDate[date]?.filter(s => {
                    const startH = parseInt(s.startTime);
                    const endH = parseInt(s.endTime);
                    const currentH = parseInt(hour);
                    return currentH >= startH && currentH < endH;
                  }) || [];
                  return (
                    <td key={date} className="py-1 px-1 align-top relative min-h-40px">
                      {cellSchedules.map(s => {
                        const color = SHIFT_COLORS[s.shiftType] || SHIFT_COLORS.flexible;
                        return (
                          <div key={s.id}
                            className="rounded-md px-2 py-1.5 mb-1 cursor-pointer transition hover-shadow-sm"
                            style={{ backgroundColor: color.bg, borderLeft: `3px solid ${color.border}` }}
                            onClick={() => onScheduleClick?.(s)}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate" style={{ color: color.text }}>
                                {s.startTime}-{s.endTime}
                              </span>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button className="p-0.5 text-muted hover-text-primary cursor-pointer"
                                  onClick={e => { e.stopPropagation(); onEdit?.(s); }}>
                                  <Edit3 size={10} />
                                </button>
                                <button className="p-0.5 text-muted hover-text-danger cursor-pointer"
                                  onClick={e => { e.stopPropagation(); onDelete?.(s.id); }}>
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                            <div className="text-xs font-semibold truncate mt-0.5">
                              {s.employees?.map(e => e.name).join(', ')}
                            </div>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
