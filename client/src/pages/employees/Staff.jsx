import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Plus, Eye } from 'lucide-react';
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

export default function Staff() {
  const navigate = useNavigate();
  const { staffList, loading, error, fetchStaff } = useStaff();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('hr.employee.create');

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Quản lý nhân viên</h2>
            <p className="text-muted text-sm">Có {staffList.length} nhân viên</p>
          </div>
          {canCreate && (
            <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
              onClick={() => navigate('/employees/create')}>
              <Plus size={18} /> Thêm nhân viên
            </button>
          )}
        </div>

        {error && (
          <div className="card p-12 text-center">
            <User size={48} className="mx-auto text-muted mb-4" />
            <h3 className="font-bold text-base mb-1">Không thể tải danh sách nhân viên</h3>
            <p className="text-sm text-muted mb-4">{error}</p>
            <button className="btn btn-primary inline-flex items-center gap-2" onClick={fetchStaff}>
              <Plus size={18} /> Thử lại
            </button>
          </div>
        )}

        {!error && staffList.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <User size={48} className="mx-auto text-muted mb-4" />
            <h3 className="font-bold text-base mb-1">Chưa có nhân viên</h3>
            <p className="text-sm text-muted mb-4">Hãy thêm nhân viên đầu tiên để bắt đầu quản lý.</p>
            {canCreate && (
              <button className="btn btn-primary inline-flex items-center gap-2" onClick={() => navigate('/employees/create')}>
                <Plus size={18} /> Thêm nhân viên
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 w-full min-w-0">
            {[1, 2].map(i => (
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
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !loading && staffList.length > 0 && (
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 w-full min-w-0">
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

                  <div className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-sm text-muted min-w-0">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted min-w-0">
                      <Phone size={14} className="flex-shrink-0" />
                      <span className="truncate">{member.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted min-w-0">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span className="truncate">Bắt đầu: {formatDate(member.startDate)}</span>
                    </div>
                  </div>

                  <div className="mt-auto p-3 bg-bg border-t flex justify-end">
                    <button className="btn btn-outline flex items-center gap-1.5 text-sm px-4 py-1.5"
                      onClick={() => navigate(`/staff/${member.id}`)}>
                      <Eye size={16} /> Xem chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
