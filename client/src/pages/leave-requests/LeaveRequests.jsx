import { useState, useMemo } from 'react';
import { useLeave } from '../../contexts/LeaveContext';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Search, CheckCircle, XCircle, Plus } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import DatePicker from '../../components/ui/DatePicker';
import TimePicker from '../../components/ui/TimePicker';
import FormTextarea from '../../components/ui/FormTextarea';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', badge: 'badge-warning' },
  approved: { label: 'Đã duyệt', badge: 'badge-success' },
  rejected: { label: 'Từ chối', badge: 'badge-danger' },
};

function formatDateTime(dateStr, timeStr) {
  if (!dateStr && !timeStr) return '—';
  return `${dateStr || '??'} ${timeStr || '--:--'}`;
}

export default function LeaveRequests() {
  const { requests, createRequest, approveRequest, rejectRequest } = useLeave();
  const { staffList } = useStaff();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [form, setForm] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isManager = user?.role === 'Quản lý';

  const currentEmployee = useMemo(() => {
    if (!user) return null;
    return staffList.find(s => s.email === user.email) || null;
  }, [user, staffList]);

  const employeeInfo = useMemo(() => {
    if (currentEmployee) return currentEmployee;
    if (user) return { id: user.id, name: user.name, role: user.role };
    return null;
  }, [currentEmployee, user]);

  const userEmployeeId = employeeInfo?.id;

  const displayRequests = useMemo(() => {
    let list = isManager ? [...requests] : requests.filter(r => r.employeeId === userEmployeeId);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => r.employeeName?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q));
    }
    if (filterStatus) {
      list = list.filter(r => r.status === filterStatus);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests, isManager, userEmployeeId, searchTerm, filterStatus]);

  const handleChange = (key) => (value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.startDate) errs.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!form.startTime) errs.startTime = 'Vui lòng chọn giờ bắt đầu';
    if (!form.endDate) errs.endDate = 'Vui lòng chọn ngày kết thúc';
    if (!form.endTime) errs.endTime = 'Vui lòng chọn giờ kết thúc';
    if (!form.reason.trim()) errs.reason = 'Vui lòng nhập lý do';

    if (form.startDate && form.endDate && form.startTime && form.endTime) {
      const [sd, sm, sy] = form.startDate.split('/').map(Number);
      const [ed, em, ey] = form.endDate.split('/').map(Number);
      const [shh, smm] = form.startTime.split(':').map(Number);
      const [ehh, emm] = form.endTime.split(':').map(Number);
      const start = new Date(sy, sm - 1, sd, shh, smm);
      const end = new Date(ey, em - 1, ed, ehh, emm);
      if (end <= start) {
        errs.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!employeeInfo) { toast.error('Không tìm thấy thông tin nhân viên'); return; }
    setSubmitting(true);
    try {
      createRequest({
        employeeId: employeeInfo.id,
        employeeName: employeeInfo.name,
        employeeRole: employeeInfo.role,
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate,
        endTime: form.endTime,
        reason: form.reason.trim(),
      });
      toast.success('Đã gửi đơn xin nghỉ phép');
      setShowModal(false);
      setForm({ startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
      setErrors({});
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = (id) => {
    approveRequest(id);
    toast.success('Đã duyệt đơn xin nghỉ');
  };

  const handleReject = (id) => {
    rejectRequest(id);
    toast.success('Đã từ chối đơn xin nghỉ');
  };

  const openModal = () => {
    if (!employeeInfo) { toast.error('Không tìm thấy thông tin nhân viên'); return; }
    setForm({ startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
    setErrors({});
    setShowModal(true);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Xin nghỉ phép</h2>
            <p className="text-muted text-sm">Quản lý đơn xin nghỉ phép của nhân viên</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 h-40px whitespace-nowrap" onClick={openModal}>
            <Plus size={18} /> Tạo đơn xin nghỉ
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder={isManager ? "Tìm nhân viên hoặc lý do..." : "Tìm lý do..."} className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-36px w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th className="w-12 text-center">STT</th>
                  {isManager && <th>Nhân viên</th>}
                  <th>Từ ngày</th>
                  <th>Đến ngày</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((r, idx) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={r.id}>
                      <td className="text-center text-muted text-sm">{idx + 1}</td>
                      {isManager && (
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
                      )}
                      <td className="whitespace-nowrap text-sm font-semibold">
                        {formatDateTime(r.startDate, r.startTime)}
                      </td>
                      <td className="whitespace-nowrap text-sm font-semibold">
                        {formatDateTime(r.endDate, r.endTime)}
                      </td>
                      <td className="text-sm max-w-200px truncate" title={r.reason}>{r.reason}</td>
                      <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                      <td className="text-right">
                        {r.status === 'pending' && isManager && r.employeeId !== userEmployeeId && (
                          <div className="flex items-center justify-end gap-2">
                            <button className="btn btn-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-success-light text-success font-semibold text-xs cursor-pointer hover-bg-success transition"
                              onClick={() => handleApprove(r.id)}>
                              <CheckCircle size={14} /> Duyệt
                            </button>
                            <button className="btn btn-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-danger-light text-danger font-semibold text-xs cursor-pointer hover-bg-danger transition"
                              onClick={() => handleReject(r.id)}>
                              <XCircle size={14} /> Từ chối
                            </button>
                          </div>
                        )}
                        {r.status === 'pending' && (!isManager || r.employeeId === userEmployeeId) && (
                          <span className="text-xs text-muted">Đang chờ duyệt</span>
                        )}
                        {r.status !== 'pending' && (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {displayRequests.length === 0 && (
                  <tr><td colSpan={isManager ? 7 : 6} className="text-center text-muted py-8">Chưa có đơn xin nghỉ phép nào</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={() => setShowModal(false)}>
          <div className="card animate-fade-slide-in w-full max-w-lg max-h-90vh overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Tạo đơn xin nghỉ phép
              </h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Từ ngày <span className="text-danger">*</span></label>
                  <DatePicker
                    value={form.startDate}
                    onChange={handleChange('startDate')}
                    placeholder="Chọn ngày"
                    error={errors.startDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Giờ bắt đầu <span className="text-danger">*</span></label>
                  <TimePicker
                    value={form.startTime}
                    onChange={handleChange('startTime')}
                    placeholder="Chọn giờ"
                  />
                  {errors.startTime && <p className="text-xs text-danger mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Đến ngày <span className="text-danger">*</span></label>
                  <DatePicker
                    value={form.endDate}
                    onChange={handleChange('endDate')}
                    placeholder="Chọn ngày"
                    error={errors.endDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Giờ kết thúc <span className="text-danger">*</span></label>
                  <TimePicker
                    value={form.endTime}
                    onChange={handleChange('endTime')}
                    placeholder="Chọn giờ"
                  />
                  {errors.endTime && <p className="text-xs text-danger mt-1">{errors.endTime}</p>}
                </div>
              </div>

              <FormTextarea
                label="Lý do"
                placeholder="Nhập lý do xin nghỉ..."
                value={form.reason}
                onChange={handleChange('reason')}
                error={errors.reason}
                required
                rows={3}
              />

              <div>
                <label className="block text-sm font-semibold mb-1">Trạng thái</label>
                <div className="w-full modal-input flex items-center px-3 bg-gray-100 rounded-lg text-sm text-muted">
                  <span className="badge badge-warning">Chờ duyệt</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2 pt-4 border-t">
                <button className="btn flex-1 modal-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-bg-success:hover { background-color: #a7f3d0 !important; }
        .hover-bg-danger:hover { background-color: #fecaca !important; }
      `}</style>
    </PageContainer>
  );
}
