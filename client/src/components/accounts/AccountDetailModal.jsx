import { User, Mail, Phone, Shield, Calendar, KeyRound } from 'lucide-react';

const roleColors = {
  Admin: 'badge-danger',
  Manager: 'badge-warning',
  Cashier: 'badge-info',
  Barista: 'badge-success',
  Staff: 'badge-neutral',
};

export default function AccountDetailModal({ show, onClose, account }) {
  if (!show || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div className="card animate-fade-slide-in w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-lg truncate flex items-center gap-2">
            <User size={20} className="text-primary" />
            Chi tiết tài khoản
          </h3>
          <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={onClose}>×</button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-2xl">
            {account.avatar ? (
              <img src={account.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              account.fullName?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{account.fullName}</div>
            <span className={`badge mt-1 ${roleColors[account.role] || 'badge-neutral'}`}>{account.role}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
            <User size={16} className="text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Username</div>
              <div className="text-sm font-semibold truncate">{account.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
            <Mail size={16} className="text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Email</div>
              <div className="text-sm font-semibold truncate">{account.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
            <Phone size={16} className="text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Số điện thoại</div>
              <div className="text-sm font-semibold truncate">{account.phone || 'Chưa cập nhật'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
            <Shield size={16} className="text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Vai trò</div>
              <div className="text-sm font-semibold truncate">{account.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
            <KeyRound size={16} className="text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Trạng thái</div>
              <span className={`badge mt-0.5 text-xs ${account.status === 'Đang hoạt động' ? 'badge-success' : 'badge-danger'}`}>
                {account.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
            <Calendar size={16} className="text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted">Ngày tạo</div>
              <div className="text-sm font-semibold truncate">{account.createdAt}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn btn-primary flex-1 modal-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
