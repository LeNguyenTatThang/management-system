import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSchedule } from '../../contexts/ScheduleContext';
import { ArrowLeft, Calendar, MapPin, Clock, Users, FileText, Edit3, Trash2, XCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { BRANCHES, SHIFT_TYPES, SHIFT_STATUSES } from '../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_LABELS = {};
SHIFT_STATUSES.forEach(s => { STATUS_LABELS[s.value] = s.label; });

const SHIFT_LABELS = {};
SHIFT_TYPES.forEach(t => { SHIFT_LABELS[t.value] = t.label; });

const STATUS_BADGE = {
  scheduled: 'badge-info',
  in_progress: 'badge-warning',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

export default function ScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getScheduleById, updateSchedule, deleteSchedule } = useSchedule();
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const s = getScheduleById(id);
    if (!s) {
      toast.error('Không tìm thấy lịch làm việc');
      navigate('/schedules');
      return;
    }
    setSchedule(s);
  }, [id, getScheduleById, navigate]);

  if (!schedule) return null;

  const branchName = BRANCHES.find(b => b.id === schedule.branchId)?.name || schedule.branchName;

  const handleDelete = () => {
    if (window.confirm(`Xóa ca làm việc ngày ${schedule.date} (${schedule.startTime}-${schedule.endTime})?`)) {
      deleteSchedule(schedule.id);
      toast.success('Đã xóa ca làm việc');
      navigate('/schedules');
    }
  };

  const handleCancel = () => {
    if (window.confirm(`Hủy ca làm việc ngày ${schedule.date}?`)) {
      updateSchedule(schedule.id, { status: 'cancelled' });
      toast.success('Đã hủy ca làm việc');
      setSchedule(prev => ({ ...prev, status: 'cancelled' }));
    }
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/schedules')}>QL Lịch Làm Việc</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Chi tiết</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/schedules')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chi tiết ca làm việc</h1>
            <p className="text-muted text-sm mt-1">{schedule.date} &middot; {schedule.startTime} - {schedule.endTime}</p>
          </div>
          <span className={`badge mt-2 ${STATUS_BADGE[schedule.status] || 'badge-neutral'}`}>
            {STATUS_LABELS[schedule.status] || schedule.status}
          </span>
        </div>

        <div className="card mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={Calendar} label="Ngày làm việc" value={schedule.date} />
            <InfoRow icon={MapPin} label="Chi nhánh" value={branchName} />
            <InfoRow icon={Clock} label="Thời gian" value={`${schedule.startTime} - ${schedule.endTime} (${schedule.duration}h)`} />
            <InfoRow icon={Clock} label="Loại ca" value={SHIFT_LABELS[schedule.shiftType] || schedule.shiftType} />
          </div>
        </div>

        <div className="card mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base">NHÂN VIÊN</h3>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {schedule.employees?.length > 0 ? schedule.employees.map((emp, i) => (
              <div key={emp.id || i} className="flex items-center gap-3 p-3 rounded-lg border border-soft">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold">
                  {emp.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{emp.name}</div>
                  <div className="text-xs text-muted">{emp.role || 'Nhân viên'}</div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted">Chưa có nhân viên</p>
            )}
          </div>
        </div>

        {schedule.note && (
          <div className="card mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base mb-2">GHI CHÚ</h3>
                <p className="text-sm text-muted whitespace-pre-line">{schedule.note}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          {schedule.status === 'scheduled' && (
            <>
              <button className="btn btn-outline modal-btn px-6 flex items-center gap-2" onClick={handleCancel}>
                <XCircle size={16} /> Hủy ca
              </button>
              <button className="btn btn-outline modal-btn px-6 flex items-center gap-2"
                onClick={() => navigate(`/schedules/${schedule.id}/edit`)}>
                <Edit3 size={16} /> Chỉnh sửa
              </button>
            </>
          )}
          <button className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger hover-bg-danger-light"
            onClick={handleDelete}>
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
