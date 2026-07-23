import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Briefcase, Phone, Calendar, Plus } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

export default function Staff() {
  const navigate = useNavigate();
  const { staffList, removeStaff, loading } = useStaff();
  const { user } = useAuth();

  const getRoleIcon = (role) => {
    if (role === 'Quản lý') return 'bg-purple-100 text-purple-600';
    if (role === 'Nhân viên pha chế') return 'bg-blue-100 text-blue-600';
    if (role === 'Thu ngân') return 'bg-green-100 text-green-600';
    if (role === 'Phục vụ') return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-600';
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

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full min-w-0">
          {staffList.map(member => (
            <div key={member.id} className="card p-0 overflow-hidden min-w-0">
              <div className="p-4 flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRoleIcon(member.role)}`}>
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-base truncate">{member.name}</div>
                  <div className="text-xs text-muted truncate">{member.role}</div>
                </div>
                <span className={`badge text-xs flex-shrink-0 ${member.status === 'Đang làm' ? 'badge-success' : member.status === 'Nghỉ làm' ? 'badge-warning' : member.status === 'Đã nghỉ việc' ? 'badge-danger' : ''}`}>
                  {member.status}
                </span>
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted min-w-0"><Mail size={14} className="flex-shrink-0" /> <span className="truncate">{member.email}</span></div>
                <div className="flex items-center gap-2 text-muted min-w-0"><Briefcase size={14} className="flex-shrink-0" /> <span className="truncate">{member.role}</span></div>
                <div className="flex items-center gap-2 text-muted min-w-0"><Phone size={14} className="flex-shrink-0" /> <span className="truncate">{member.phone || 'Chưa cập nhật'}</span></div>
                <div className="flex items-center gap-2 text-muted min-w-0"><Calendar size={14} className="flex-shrink-0" /> <span className="truncate">Bắt đầu: {member.startDate}</span></div>
              </div>
              {member.email !== user?.email && (
                <div className="p-3 bg-bg border-t flex justify-end">
                  <button className="text-xs text-danger font-semibold hover:underline" onClick={() => removeStaff(member.id)}>Xóa nhân viên</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
