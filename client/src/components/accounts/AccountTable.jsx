import { useState } from 'react';
import {
  Eye,
  Edit3,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  User,
} from 'lucide-react';
import ResponsiveTable from '../ui/ResponsiveTable';

const roleColors = {
  Admin: 'badge-danger',
  Manager: 'badge-warning',
  Cashier: 'badge-info',
  Barista: 'badge-success',
  Staff: 'badge-neutral',
};

export default function AccountTable({
  accounts,
  searchTerm,
  roleFilter,
  statusFilter,
  onView,
  onEdit,
  onToggleLock,
  onChangePassword,
  onDelete,
}) {
  const filtered = accounts.filter(a => {
    const matchSearch =
      a.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || a.role === roleFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  if (filtered.length === 0) {
    return (
      <div className="card p-0 overflow-hidden min-w-0">
        <div className="flex flex-col items-center justify-center py-16 text-muted gap-3">
          <User size={48} className="opacity-30" />
          <span className="text-sm font-semibold">
            {searchTerm || roleFilter || statusFilter
              ? 'Không tìm thấy tài khoản'
              : 'Chưa có tài khoản nào'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden min-w-0">
      <ResponsiveTable>
        <thead>
          <tr>
            <th className="w-12 text-center">STT</th>
            <th className="hidden sm:table-cell w-12">Avatar</th>
            <th>Họ và tên</th>
            <th className="hidden md:table-cell">Username / Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th className="hidden lg:table-cell">Ngày tạo</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((account, idx) => (
            <tr key={account.id}>
              <td className="text-center text-muted text-sm">{idx + 1}</td>
              <td className="hidden sm:table-cell">
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {account.avatar ? (
                    <img src={account.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    account.fullName?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
              </td>
              <td>
                <div className="font-semibold text-sm truncate max-w-160px">{account.fullName}</div>
              </td>
              <td className="hidden md:table-cell">
                <div className="text-sm truncate max-w-180px">{account.username}</div>
                <div className="text-xs text-muted truncate max-w-180px">{account.email}</div>
              </td>
              <td>
                <span className={`badge ${roleColors[account.role] || 'badge-neutral'}`}>
                  {account.role}
                </span>
              </td>
              <td>
                <span className={`badge ${account.status === 'Đang hoạt động' ? 'badge-success' : 'badge-danger'}`}>
                  {account.status}
                </span>
              </td>
              <td className="text-sm text-muted hidden lg:table-cell whitespace-nowrap">{account.createdAt}</td>
              <td className="text-right whitespace-nowrap">
                <ActionButtons
                  account={account}
                  onView={onView}
                  onEdit={onEdit}
                  onToggleLock={onToggleLock}
                  onChangePassword={onChangePassword}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
    </div>
  );
}

function ActionButtons({ account, onView, onEdit, onToggleLock, onChangePassword, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-end gap-1">
      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => onView(account)} title="Xem chi tiết">
        <Eye size={16} />
      </button>
      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => onEdit(account)} title="Chỉnh sửa">
        <Edit3 size={16} />
      </button>
      <button
        className={`p-1.5 cursor-pointer ${account.status === 'Đang hoạt động' ? 'text-muted hover-text-warning' : 'text-muted hover-text-success'}`}
        onClick={() => onToggleLock(account)}
        title={account.status === 'Đang hoạt động' ? 'Khóa tài khoản' : 'Mở khóa'}
      >
        {account.status === 'Đang hoạt động' ? <Lock size={16} /> : <Unlock size={16} />}
      </button>
      <button className="p-1.5 text-muted hover-text-info cursor-pointer" onClick={() => onChangePassword(account)} title="Đổi mật khẩu">
        <KeyRound size={16} />
      </button>
      <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => onDelete(account)} title="Xóa">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
