import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Briefcase, Phone, Calendar, Plus, MapPin, FileText, DollarSign, CreditCard, Trash2 } from 'lucide-react';
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted min-w-0">
      <Icon size={14} className="flex-shrink-0" />
      <span className="truncate">{value || 'Chưa cập nhật'}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">{children}</h4>;
}

export default function Staff() {
  const navigate = useNavigate();
  const { staffList, removeStaff, loading } = useStaff();
  const { user } = useAuth();

  const handleDelete = (member) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${member.name}"?`)) return;
    removeStaff(member.id);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Quản lý nhân viên</h2>
            <p className="text-muted text-sm">Có {staffList.length} nhân viên</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/employees/create')}>
            <Plus size={18} /> Thêm nhân viên
          </button>
        </div>

        {staffList.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <User size={48} className="mx-auto text-muted mb-4" />
            <h3 className="font-bold text-base mb-1">Chưa có nhân viên</h3>
            <p className="text-sm text-muted mb-4">Hãy thêm nhân viên đầu tiên để bắt đầu quản lý.</p>
            <button className="btn btn-primary inline-flex items-center gap-2" onClick={() => navigate('/employees/create')}>
              <Plus size={18} /> Thêm nhân viên
            </button>
          </div>
        )}

        {loading && (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full min-w-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-4 min-w-0 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && staffList.length > 0 && (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full min-w-0">
            {staffList.map(member => {
              const avatarSrc = member.image || member.avatar;
              return (
                <div key={member.id} className="card p-0 overflow-hidden min-w-0 flex flex-col">
                  <div className="p-4 flex items-center gap-4 min-w-0 border-b border-gray-100">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${getRoleIcon(member.role)}`}>
                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-base truncate">{member.name}</div>
                      <div className="text-xs text-muted truncate">{member.role}</div>
                    </div>
                    <span className={`badge text-xs flex-shrink-0 ${getStatusClass(member.status)}`}>
                      {member.status || 'Chưa cập nhật'}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <SectionTitle>THÔNG TIN CÁ NHÂN</SectionTitle>
                    <div className="flex flex-col gap-2">
                      <InfoRow icon={Mail} label="Email" value={member.email} />
                      <InfoRow icon={Phone} label="Số điện thoại" value={member.phone} />
                      <InfoRow icon={Calendar} label="Ngày sinh" value={formatDate(member.dateOfBirth)} />
                      <InfoRow icon={User} label="Giới tính" value={member.gender} />
                      <InfoRow icon={FileText} label="CCCD" value={member.citizenId} />
                      <InfoRow icon={MapPin} label="Địa chỉ" value={member.address} />
                    </div>

                    <hr className="border-t border-gray-100" />

                    <SectionTitle>THÔNG TIN CÔNG VIỆC</SectionTitle>
                    <div className="flex flex-col gap-2">
                      <InfoRow icon={Briefcase} label="Chức vụ" value={member.role} />
                      <InfoRow icon={Calendar} label="Ngày bắt đầu" value={formatDate(member.startDate)} />
                    </div>

                    <hr className="border-t border-gray-100" />

                    <SectionTitle>LƯƠNG &amp; CHẤM CÔNG</SectionTitle>
                    <div className="flex flex-col gap-2">
                      <InfoRow icon={CreditCard} label="Hình thức" value={member.salaryType} />
                      <InfoRow icon={DollarSign} label="Lương" value={formatSalary(member.salary)} />
                      <InfoRow icon={Calendar} label="Phép tháng" value={member.monthlyLeaveDays != null ? `${member.monthlyLeaveDays} ngày` : 'Chưa cập nhật'} />
                      <InfoRow icon={Calendar} label="Phép còn lại" value={member.remainingLeaveDays != null ? `${member.remainingLeaveDays} ngày` : 'Chưa cập nhật'} />
                    </div>

                    {member.note && (
                      <>
                        <hr className="border-t border-gray-100" />
                        <div>
                          <SectionTitle>GHI CHÚ</SectionTitle>
                          <p className="text-sm text-muted whitespace-pre-wrap line-clamp-2">{member.note}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {member.email !== user?.email && (
                    <div className="mt-auto p-3 bg-bg border-t flex justify-end">
                      <button className="flex items-center gap-1.5 text-xs text-danger font-semibold hover:underline" onClick={() => handleDelete(member)}>
                        <Trash2 size={14} /> Xóa nhân viên
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
