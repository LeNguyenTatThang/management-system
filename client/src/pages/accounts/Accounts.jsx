import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageContainer from '../../components/layout/PageContainer';
import AccountModal from '../../components/accounts/AccountModal';
import AccountDetailModal from '../../components/accounts/AccountDetailModal';
import AccountTable from '../../components/accounts/AccountTable';
import FilterPopover from '../../components/ui/FilterPopover';
import { useAccount } from '../../contexts/AccountContext';
import { useRole } from '../../contexts/RoleContext';

export default function Accounts() {
  const navigate = useNavigate();
  const { accounts, addAccount, updateAccount, deleteAccount, toggleLockAccount, changePassword } = useAccount();
  const { roles } = useRole();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (data) => {
    if (editItem) {
      updateAccount(editItem.id, data);
      toast.success('Cập nhật tài khoản thành công');
    } else {
      addAccount(data);
      toast.success('Thêm tài khoản thành công');
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleEdit = (account) => {
    setEditItem(account);
    setShowModal(true);
  };

  const handleDelete = (account) => {
    setConfirmDelete(account);
  };

  const confirmDeleteAccount = () => {
    if (!confirmDelete) return;
    deleteAccount(confirmDelete.id);
    toast.success(`Đã xóa tài khoản "${confirmDelete.fullName}"`);
    setConfirmDelete(null);
  };

  const handleToggleLock = (account) => {
    toggleLockAccount(account.id);
    toast.success(
      account.status === 'Đang hoạt động'
        ? `Đã khóa tài khoản "${account.fullName}"`
        : `Đã mở khóa tài khoản "${account.fullName}"`
    );
  };

  const handleOpenPasswordModal = (account) => {
    setPasswordModal(account);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }
    changePassword(passwordModal.id, newPassword);
    toast.success('Đổi mật khẩu thành công');
    setPasswordModal(null);
  };

  const roleOptions = roles.map(r => r.name).filter((v, i, a) => a.indexOf(v) === i);

  const accountFilters = [
    {
      key: 'role',
      label: 'Vai trò',
      options: [
        { value: '', label: 'Tất cả vai trò' },
        ...roleOptions.map(r => ({ value: r, label: r })),
      ],
    },
    {
      key: 'status',
      label: 'Trạng thái',
      options: [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'Đang hoạt động', label: 'Đang hoạt động' },
        { value: 'Đã khóa', label: 'Đã khóa' },
      ],
    },
  ];

  const activeFilters = { role: roleFilter, status: statusFilter };

  const handleFilterChange = (key, value) => {
    if (key === 'role') setRoleFilter(value);
    if (key === 'status') setStatusFilter(value);
  };

  const clearAllFilters = () => {
    setRoleFilter('');
    setStatusFilter('');
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Quản lý tài khoản</h2>
            <p className="text-muted text-sm">Quản lý {accounts.length} tài khoản nhân viên</p>
          </div>
          <button
            className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/accounts/create')}
          >
            <Plus size={18} /> Thêm tài khoản
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <FilterPopover
            filters={accountFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={clearAllFilters}
          />
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc username..."
              className="w-full pl-10 h-36px"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <AccountTable
          accounts={accounts}
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onView={setViewItem}
          onEdit={handleEdit}
          onToggleLock={handleToggleLock}
          onChangePassword={handleOpenPasswordModal}
          onDelete={handleDelete}
        />
      </div>

      <AccountModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSave={handleSave}
        editItem={editItem}
      />

      <AccountDetailModal
        show={!!viewItem}
        onClose={() => setViewItem(null)}
        account={viewItem}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={() => setConfirmDelete(null)}>
          <div className="card animate-fade-slide-in w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center">
                <Users size={24} className="text-danger" />
              </div>
              <h3 className="font-bold text-lg">Xác nhận xóa</h3>
              <p className="text-sm text-muted">
                Bạn có chắc chắn muốn xóa tài khoản <strong>"{confirmDelete.fullName}"</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn flex-1 modal-btn" onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="btn bg-danger text-white flex-1 modal-btn" onClick={confirmDeleteAccount}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={() => setPasswordModal(null)}>
          <div className="card animate-fade-slide-in w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate flex items-center gap-2">
                <KeyRound size={20} className="text-primary" />
                Đổi mật khẩu
              </h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setPasswordModal(null)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-bg rounded-lg text-sm mb-2">
                Đổi mật khẩu cho: <strong>{passwordModal.fullName}</strong> ({passwordModal.username})
              </div>
              <input
                type="password"
                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                className="w-full modal-input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                className="w-full modal-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setPasswordModal(null)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleChangePassword}>Lưu mật khẩu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
