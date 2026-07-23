import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAttendance } from '../../contexts/AttendanceContext';
import { ArrowLeft, Clock, LogIn, LogOut, MapPin, CalendarDays, AlertTriangle, CheckCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Chưa chấm công', color: '#6b7280' },
  working: { label: 'Đang làm việc', color: '#3b82f6' },
  completed: { label: 'Đã hoàn thành', color: '#10b981' },
  late: { label: 'Đi trễ', color: '#f59e0b' },
  early_leave: { label: 'Về sớm', color: '#f59e0b' },
  late_early: { label: 'Đi trễ + Về sớm', color: '#f59e0b' },
  absent: { label: 'Vắng mặt', color: '#ef4444' },
  leave: { label: 'Nghỉ phép', color: '#3b82f6' },
};

export default function AttendanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecordById, updateRecord, formatMinutes } = useAttendance();
  const [record, setRecord] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const r = getRecordById(id);
    if (!r) {
      toast.error('Không tìm thấy bản ghi chấm công');
      navigate('/attendance');
      return;
    }
    setRecord(r);
    setEditNote(r.note || '');
  }, [id, getRecordById, navigate]);

  if (!record) return null;

  const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;

  const handleSaveNote = () => {
    updateRecord(record.id, { note: editNote.trim() });
    setRecord(prev => ({ ...prev, note: editNote.trim() }));
    setEditing(false);
    toast.success('Đã cập nhật ghi chú');
  };

  const InfoRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-semibold" style={color ? { color } : undefined}>{value}</div>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/attendance')}>QL Chấm Công</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Chi tiết</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/attendance')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chi tiết chấm công</h1>
            <p className="text-muted text-sm mt-1">{record.employeeName} &middot; {record.workDate}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ backgroundColor: cfg.color + '18', color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div className="card mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={CalendarDays} label="Ngày làm việc" value={record.workDate} />
            <InfoRow icon={MapPin} label="Chi nhánh" value={record.branchName || '—'} />
            <InfoRow icon={Clock} label="Giờ dự kiến" value={record.scheduledStart && record.scheduledEnd ? `${record.scheduledStart} - ${record.scheduledEnd}` : '—'} />
            <InfoRow icon={LogIn} label="Check-in" value={record.checkIn || '—'} color={record.checkIn ? '#10b981' : undefined} />
            <InfoRow icon={LogOut} label="Check-out" value={record.checkOut || '—'} color={record.checkOut ? '#10b981' : undefined} />
            <InfoRow icon={Clock} label="Tổng thời gian" value={formatMinutes(record.workedMinutes) || '—'} />
            {record.lateMinutes > 0 && (
              <InfoRow icon={AlertTriangle} label="Đi trễ" value={formatMinutes(record.lateMinutes)} color="#f59e0b" />
            )}
            {record.earlyLeaveMinutes > 0 && (
              <InfoRow icon={AlertTriangle} label="Về sớm" value={formatMinutes(record.earlyLeaveMinutes)} color="#f59e0b" />
            )}
            <InfoRow icon={CheckCircle} label="Trạng thái" value={cfg.label} color={cfg.color} />
          </div>
        </div>

        <div className="card mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base mb-2">GHI CHÚ</h3>
              {editing ? (
                <div className="flex flex-col gap-2">
                  <textarea className="w-full modal-input" rows={3} value={editNote}
                    onChange={e => setEditNote(e.target.value)} placeholder="Nhập ghi chú..." />
                  <div className="flex items-center gap-2">
                    <button className="btn btn-primary h-34px text-xs px-4" onClick={handleSaveNote}>Lưu</button>
                    <button className="btn btn-outline h-34px text-xs px-4" onClick={() => { setEditNote(record.note || ''); setEditing(false); }}>Hủy</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted flex-1">{record.note || 'Chưa có ghi chú'}</p>
                  <button className="text-xs text-primary font-semibold hover:underline cursor-pointer flex-shrink-0"
                    onClick={() => setEditing(true)}>Sửa</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 mb-8">
          <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/attendance')}>Đóng</button>
        </div>
      </div>
    </PageContainer>
  );
}
