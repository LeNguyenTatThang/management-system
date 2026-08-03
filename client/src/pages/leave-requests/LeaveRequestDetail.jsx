import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLeave } from '../../contexts/LeaveContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Clock, CalendarDays, CheckCircle, XCircle, FileText } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: '#f59e0b' },
  approved: { label: 'Đã duyệt', color: '#10b981' },
  rejected: { label: 'Từ chối', color: '#ef4444' },
};

export default function LeaveRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequestById, approveRequest, rejectRequest } = useLeave();
  const { hasPermission } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const r = await getRequestById(id);
        if (cancelled) return;
        if (!r) {
          toast.error('Không tìm thấy đơn xin nghỉ phép');
          navigate('/leave-requests');
          return;
        }
        setRecord(r);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Không thể tải dữ liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, getRequestById, navigate]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = await approveRequest(record.id);
      setRecord(updated);
      toast.success('Đã duyệt đơn xin nghỉ');
    } catch (e) {
      toast.error(e.message || 'Không thể duyệt đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const updated = await rejectRequest(record.id);
      setRecord(updated);
      toast.success('Đã từ chối đơn xin nghỉ');
    } catch (e) {
      toast.error(e.message || 'Không thể từ chối đơn');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-muted py-12">Đang tải dữ liệu...</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto flex flex-col items-center py-12">
          <XCircle size={48} className="text-danger mb-4" />
          <p className="text-danger font-semibold">{error}</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/leave-requests')}>Quay lại</button>
        </div>
      </PageContainer>
    );
  }

  if (!record) return null;

  const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;
  const isPending = record.status === 'pending';

  function formatDateTimeDisplay(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }

  function calcDuration(start, end) {
    if (!start || !end) return '—';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0 && minutes > 0) return `${hours}h${minutes}p`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}p`;
  }

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/leave-requests')}>Xin nghỉ phép</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/leave-requests')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chi tiết đơn xin nghỉ phép</h1>
            <p className="text-muted text-sm mt-1">{record.employeeName} &middot; {record.employeeRole}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ backgroundColor: cfg.color + '18', color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div className="card mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={FileText} label="Nhân viên" value={record.employeeName || '—'} />
            <InfoRow icon={FileText} label="Chức vụ" value={record.employeeRole || '—'} />
            <InfoRow icon={CalendarDays} label="Từ ngày" value={formatDateTimeDisplay(record.startDateTime)} color="#10b981" />
            <InfoRow icon={CalendarDays} label="Đến ngày" value={formatDateTimeDisplay(record.endDateTime)} color="#10b981" />
            <InfoRow icon={Clock} label="Thời gian nghỉ" value={calcDuration(record.startDateTime, record.endDateTime)} />
            <InfoRow icon={CheckCircle} label="Trạng thái" value={cfg.label} color={cfg.color} />
          </div>
        </div>

        <div className="card mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base mb-2">LÝ DO</h3>
              <p className="text-sm text-muted">{record.reason || 'Không có lý do'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 mb-8">
          {isPending && hasPermission('hr.leave.approve') && (
            <button className="btn px-6 h-40px flex items-center gap-2 bg-success-light text-success font-semibold"
              onClick={handleApprove} disabled={actionLoading}>
              <CheckCircle size={16} /> {actionLoading ? 'Đang duyệt...' : 'Duyệt'}
            </button>
          )}
          {isPending && hasPermission('hr.leave.reject') && (
            <button className="btn px-6 h-40px flex items-center gap-2 bg-danger-light text-danger font-semibold"
              onClick={handleReject} disabled={actionLoading}>
              <XCircle size={16} /> {actionLoading ? 'Đang từ chối...' : 'Từ chối'}
            </button>
          )}
          <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/leave-requests')}>Đóng</button>
        </div>
      </div>
    </PageContainer>
  );
}
