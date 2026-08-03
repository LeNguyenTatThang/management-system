import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Calendar, Clock, Users, FileText, Edit3, Trash2, XCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { SHIFT_TYPES } from '../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_LABELS = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang làm',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

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
  const { getScheduleById, updateSchedule, removeSchedule } = useSchedule();
  const { hasPermission } = useAuth();
  const [schedule, setSchedule] = useState(null);

  const canUpdate = hasPermission('hr.schedule.update');
  const canDelete = hasPermission('hr.schedule.delete');

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

  const handleDelete = async () => {
    if (window.confirm(`Xóa ca làm việc ngày ${schedule.date} (${SHIFT_LABELS[schedule.shiftType] || schedule.shiftType})?`)) {
      try {
        await removeSchedule(schedule.id);
        toast.success('Đã xóa ca làm việc');
        navigate('/schedules');
      } catch (e) {
        toast.error(e.message || 'Không thể xóa');
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm(`Hủy ca làm việc ngày ${schedule.date}?`)) {
      try {
        await updateSchedule(schedule.id, { status: 'CANCELLED' });
        toast.success('Đã hủy ca làm việc');
        setSchedule(prev => ({ ...prev, status: 'cancelled' }));
      } catch (e) {
        toast.error(e.message || 'Không thể hủy');
      }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/schedules')}>QL Lịch Làm Việc</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/schedules')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chi tiết ca làm việc</h1>
            <p className="text-muted text-sm mt-1">{schedule.date} &middot; {SHIFT_LABELS[schedule.shiftType] || schedule.shift?.name}</p>
          </div>
          <span className={`badge mt-2 ${STATUS_BADGE[schedule.status] || 'badge-neutral'}`}>
            {STATUS_LABELS[schedule.status] || schedule.status}
          </span>
        </div>

        <div className="card mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={Calendar} label="Ngày làm việc" value={schedule.date} />
            <InfoRow icon={Clock} label="Ca làm việc" value={schedule.shift?.name || SHIFT_LABELS[schedule.shiftType]} />
            <InfoRow icon={Clock} label="Check-in" value={schedule.checkIn || 'Chưa check-in'} />
            <InfoRow icon={Clock} label="Check-out" value={schedule.checkOut || 'Chưa check-out'} />
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
            {schedule.employee ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-soft">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold">
                  {schedule.employee.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{schedule.employee.name}</div>
                  <div className="text-xs text-muted">{schedule.employee.role || 'Nhân viên'}</div>
                </div>
              </div>
            ) : (
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
          {schedule.status === 'scheduled' && canUpdate && (
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
          {canDelete && (
            <button className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger hover-bg-danger-light"
              onClick={handleDelete}>
              <Trash2 size={16} /> Xóa
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
