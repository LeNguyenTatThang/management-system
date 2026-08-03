import { Edit3, Trash2, LogIn, LogOut } from 'lucide-react';

const SHIFT_ROWS = [
  { key: 'morning', label: 'SÁNG' },
  { key: 'noon', label: 'TRƯA' },
  { key: 'afternoon', label: 'CHIỀU' },
  { key: 'evening', label: 'TỐI' },
];

function EmployeeBlock({ employee, attendance }) {
  const hasCheckIn = attendance?.checkIn;
  const hasCheckOut = attendance?.checkOut;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-2.5 mb-1.5 text-xs hover-shadow-sm transition">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
          {employee.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate leading-tight">{employee.name}</div>
          <div className="text-[10px] text-muted truncate leading-tight">{employee.role || 'Nhân viên'}</div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 pl-8">
        <div className="flex items-center gap-1">
          <LogIn size={11} className={hasCheckIn ? 'text-success' : 'text-muted'} />
          <span className={hasCheckIn ? 'text-success font-medium' : 'text-muted'}>
            {hasCheckIn || 'Chưa check-in'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LogOut size={11} className={hasCheckOut ? 'text-success' : 'text-muted'} />
          <span className={hasCheckOut ? 'text-success font-medium' : 'text-muted'}>
            {hasCheckOut || 'Chưa check-out'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleCalendar({ weekDates, schedules, attendanceRecords = [], onScheduleClick, onEdit, onDelete }) {
  const attendanceMap = {};
  attendanceRecords.forEach(r => {
    const key = `${r.employeeId}_${r.workDate}`;
    attendanceMap[key] = r;
  });

  const schedulesByDateShift = {};
  weekDates.forEach(({ date }) => {
    schedulesByDateShift[date] = {};
    SHIFT_ROWS.forEach(({ key }) => {
      schedulesByDateShift[date][key] = [];
    });
  });
  schedules.forEach(s => {
    if (schedulesByDateShift[s.date] && schedulesByDateShift[s.date][s.shiftType]) {
      schedulesByDateShift[s.date][s.shiftType].push(s);
    }
  });

  return (
    <div className="card p-0 overflow-hidden min-w-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 750 }}>
          <thead>
            <tr className="border-b border-soft">
              <th className="w-24 py-2.5 px-2 text-xs text-muted font-semibold text-center sticky left-0 bg-white z-10">Ca</th>
              {weekDates.map(({ date, dayLabel }) => (
                <th key={date} className="py-2.5 px-2 text-center min-w-140px border-l border-soft">
                  <div className="text-xs text-muted">{dayLabel}</div>
                  <div className="text-sm font-bold">{date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_ROWS.map(({ key, label }) => (
              <tr key={key} className="border-b border-soft align-top">
                <td className="py-3 px-2 text-xs font-bold text-muted sticky left-0 bg-white z-10 whitespace-nowrap border-r border-soft">
                  {label}
                </td>
                {weekDates.map(({ date }) => {
                  const cellSchedules = schedulesByDateShift[date]?.[key] || [];
                  return (
                    <td key={date} className="py-2 px-1.5 align-top border-l border-soft">
                      {cellSchedules.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {cellSchedules.map(s => (
                            <div key={s.id} className="relative group">
                              <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5 z-10">
                                <button className="p-0.5 rounded bg-white shadow-sm text-muted hover-text-primary cursor-pointer"
                                  onClick={e => { e.stopPropagation(); onEdit?.(s); }}>
                                  <Edit3 size={10} />
                                </button>
                                <button className="p-0.5 rounded bg-white shadow-sm text-muted hover-text-danger cursor-pointer"
                                  onClick={e => { e.stopPropagation(); onDelete?.(s.id); }}>
                                  <Trash2 size={10} />
                                </button>
                              </div>
                              {s.employees?.map((emp, idx) => {
                                const attKey = `${emp.id}_${date}`;
                                const att = attendanceMap[attKey];
                                return (
                                  <div key={emp.id || idx} className="cursor-pointer"
                                    onClick={() => onScheduleClick?.(s)}>
                                    <EmployeeBlock employee={emp} attendance={att} />
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted text-center py-6">—</div>
                      )}
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
