import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function parseDDMMYYYY(str) {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = +parts[0], m = +parts[1], y = +parts[2];
  if (!d || !m || !y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const today = new Date();
const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' };

export default function DatePicker({ value, onChange, placeholder = 'Chọn ngày', allowPast = false, error }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const containerRef = useRef(null);

  const selectedDate = value ? parseDDMMYYYY(value) : null;

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSelect = (day, month, year) => {
    const date = new Date(year, month, day);
    if (!allowPast && date < todayDate) return;
    onChange(formatDate(date));
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const goToToday = (e) => {
    e.stopPropagation();
    onChange(formatDate(todayDate));
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  let calendarDays = [];
  for (let i = 0; i < startOffset; i++) {
    const d = getDaysInMonth(viewYear, viewMonth - 1) - startOffset + i + 1;
    calendarDays.push({ day: d, month: viewMonth - 1, year: viewMonth === 0 ? viewYear - 1 : viewYear, other: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, month: viewMonth, year: viewYear, other: false });
  }
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, month: viewMonth + 1, year: viewMonth === 11 ? viewYear + 1 : viewYear, other: true });
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div
        className={`w-full modal-input flex items-center gap-2 cursor-pointer ${error ? 'border-danger' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`flex-1 text-sm ${value ? '' : 'text-muted'}`}>
          {value || placeholder}
        </span>
        {value && (
          <button className="p-0.5 text-muted hover-text-danger cursor-pointer flex-shrink-0" onClick={handleClear}>
            <X size={14} />
          </button>
        )}
        <CalendarIcon size={16} className="text-muted flex-shrink-0" />
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-soft animate-fade-slide-in overflow-hidden"
          style={{ width: '380px', maxWidth: 'calc(100vw - 32px)' }}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <button type="button"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted hover-bg-primary-light hover-text-primary cursor-pointer transition"
              onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <div className="text-base font-bold text-main">
              {MONTHS[viewMonth]}, {viewYear}
            </div>
            <button type="button"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted hover-bg-primary-light hover-text-primary cursor-pointer transition"
              onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="px-5 pt-3 pb-2" style={gridStyle}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          <div className="px-5 pb-3" style={gridStyle}>
            {calendarDays.map((item, i) => {
              const date = new Date(item.year, item.month, item.day);
              const isToday = isSameDay(date, todayDate);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isPast = !allowPast && date < todayDate;
              const isDisabled = item.other || isPast;

              let bg = '';
              let color = 'var(--text-main)';
              let cursor = 'pointer';

              if (isSelected) {
                bg = 'var(--primary)';
                color = '#fff';
              } else if (item.other) {
                color = 'var(--text-muted)';
                cursor = 'default';
              } else if (isPast) {
                color = '#d1d5db';
                cursor = 'not-allowed';
              } else if (isToday) {
                bg = 'var(--primary-light)';
                color = 'var(--primary)';
              }

              return (
                <button key={i} type="button"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    backgroundColor: bg || undefined,
                    color,
                    cursor,
                    border: 'none',
                    outline: isSelected ? '2px solid var(--primary)' : 'none',
                    outlineOffset: isSelected ? '1px' : '0',
                    transition: 'all 0.12s ease',
                  }}
                  className={isDisabled ? '' : 'hover-bg-primary-light'}
                  onClick={() => !isDisabled && handleSelect(item.day, item.month, item.year)}
                  disabled={isDisabled}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pb-4">
            <button type="button"
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              className="hover-bg-primary hover-text-white"
              onClick={goToToday}
            >
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
