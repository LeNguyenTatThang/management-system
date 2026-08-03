import { useParams, useNavigate } from 'react-router-dom';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, FileText, Briefcase, DollarSign, CreditCard } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const formatDate = (date) => {
  if (!date) return 'Chưa cập nhật';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return new Intl.DateTimeFormat('vi-VN').format(d);
  } catch {
    return 'Chưa cập nhật';
  }
};

const formatSalary = (salary) => {
  if (salary === null || salary === undefined || salary === '') return 'Chưa cập nhật';
  const num = Number(salary);
  if (isNaN(num)) return 'Chưa cập nhật';
  return `${new Intl.NumberFormat('vi-VN').format(num)} ₫`;
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Đang làm': return 'badge-success';
    case 'Tạm nghỉ': return 'badge-warning';
    case 'Đã nghỉ việc': return 'badge-danger';
    default: return '';
  }
};

const getRoleIcon = (role) => {
  if (role === 'Quản lý') return 'bg-purple-100 text-purple-600';
  if (role === 'Nhân viên pha chế') return 'bg-blue-100 text-blue-600';
  if (role === 'Thu ngân') return 'bg-green-100 text-green-600';
  if (role === 'Phục vụ') return 'bg-orange-100 text-orange-600';
  return 'bg-gray-100 text-gray-600';
};

function DetailField({ label, value, span }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold break-words">{value || 'Chưa cập nhật'}</p>
    </div>
  );
}

function CardSection({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-primary" />
        </div>
        <h3 className="font-bold text-sm text-main">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staffList, removeStaff } = useStaff();
  const { user } = useAuth();

  const member = staffList.find(m => m.id === id);

  if (!member) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-lg font-bold mb-2">Không tìm thấy nhân viên</h2>
          <p className="text-muted text-sm mb-4">Mã nhân viên &quot;{id}&quot; không tồn tại</p>
          <button className="btn btn-primary" onClick={() => navigate('/staff')}>Quay lại danh sách</button>
        </div>
      </PageContainer>
    );
  }

  const avatarSrc = member.image || member.avatar;

  const handleDelete = () => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${member.name}"?`)) return;
    removeStaff(member.id);
    navigate('/staff');
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/staff')}>QL Nhân viên</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết nhân viên</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="card p-5 mb-5">
          <div className="flex items-center gap-5">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0 ${getRoleIcon(member.role)}`}>
                {member.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">{member.name}</h1>
              <p className="text-sm text-muted mt-0.5">{member.role}</p>
            </div>
            <span className={`badge text-sm flex-shrink-0 ${getStatusClass(member.status)}`}>
              {member.status || 'Chưa cập nhật'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <CardSection icon={User} title="THÔNG TIN CÁ NHÂN">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              <DetailField label="Họ và tên" value={member.name} />
              <DetailField label="Email" value={member.email} />
              <DetailField label="Số điện thoại" value={member.phone} />
              <DetailField label="Ngày sinh" value={formatDate(member.dateOfBirth)} />
              <DetailField label="Giới tính" value={member.gender} />
              <DetailField label="CCCD" value={member.citizenId} />
              <DetailField label="Địa chỉ" value={member.address} span />
            </div>
          </CardSection>

          <CardSection icon={Briefcase} title="THÔNG TIN CÔNG VIỆC">
            <div className="flex flex-col gap-4">
              <DetailField label="Chức vụ" value={member.role} />
              <DetailField label="Ngày bắt đầu" value={formatDate(member.startDate)} />
              <div>
                <p className="text-xs text-muted mb-0.5">Trạng thái</p>
                <span className={`badge text-xs ${getStatusClass(member.status)}`}>
                  {member.status || 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </CardSection>
        </div>

        <CardSection icon={DollarSign} title="LƯƠNG & CHẤM CÔNG" className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-bg rounded-lg p-4">
              <p className="text-xs text-muted mb-1">Hình thức tính lương</p>
              <p className="text-sm font-semibold">{member.salaryType || 'Chưa cập nhật'}</p>
            </div>
            <div className="bg-bg rounded-lg p-4">
              <p className="text-xs text-muted mb-1">Lương</p>
              <p className="text-sm font-semibold text-primary">{formatSalary(member.salary)}</p>
            </div>
            <div className="bg-bg rounded-lg p-4">
              <p className="text-xs text-muted mb-1">Số ngày phép tháng</p>
              <p className="text-sm font-semibold">{member.monthlyLeaveDays != null ? `${member.monthlyLeaveDays} ngày` : 'Chưa cập nhật'}</p>
            </div>
            <div className="bg-bg rounded-lg p-4">
              <p className="text-xs text-muted mb-1">Số ngày phép còn lại</p>
              <p className="text-sm font-semibold">{member.remainingLeaveDays != null ? `${member.remainingLeaveDays} ngày` : 'Chưa cập nhật'}</p>
            </div>
          </div>
        </CardSection>

        {member.note && (
          <CardSection icon={FileText} title="GHI CHÚ" className="mb-5">
            <p className="text-sm text-muted whitespace-pre-wrap">{member.note}</p>
          </CardSection>
        )}

        <div className="flex items-center justify-between gap-3 mt-6 mb-8">
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            {member.email !== user?.email && (
              <button className="btn btn-outline text-danger border-danger flex items-center gap-1.5 text-sm"
                onClick={handleDelete}>
                Xóa nhân viên
              </button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
