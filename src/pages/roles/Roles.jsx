import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Shield, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageContainer from '../../components/layout/PageContainer';
import FilterPopover from '../../components/ui/FilterPopover';
import { useRole } from '../../contexts/RoleContext';
import RoleTable from '../../components/roles/RoleTable';
import RoleModal from '../../components/roles/RoleModal';

export default function Roles() {
  const navigate = useNavigate();
  const { roles, addRole, updateRole, deleteRole, getAccountCountByRole } = useRole();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSave = (data) => {
    if (editItem) {
      updateRole(editItem.id, data);
      toast.success('Cập nhật vai trò thành công');
    } else {
      addRole(data);
      toast.success('Thêm vai trò thành công');
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleEdit = (role) => {
    setEditItem(role);
    setShowModal(true);
  };

  const handleDelete = (role) => {
    const count = getAccountCountByRole(role.name);
    if (count > 0) {
      toast.error(`Không thể xóa "${role.name}" vì có ${count} tài khoản đang sử dụng`);
      return;
    }
    setConfirmDelete(role);
  };

  const confirmDeleteRole = () => {
    if (!confirmDelete) return;
    deleteRole(confirmDelete.id);
    toast.success(`Đã xóa vai trò "${confirmDelete.name}"`);
    setConfirmDelete(null);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Quản lý vai trò</h2>
            <p className="text-muted text-sm">Quản lý {roles.length} vai trò và phân quyền</p>
          </div>
          <button
            className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/accounts/roles/create')}
          >
            <Plus size={18} /> Thêm vai trò
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <FilterPopover
            filters={[
              {
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: 'Đang hoạt động', label: 'Đang hoạt động' },
                  { value: 'Không hoạt động', label: 'Không hoạt động' },
                ],
              },
            ]}
            activeFilters={{ status: filterStatus }}
            onFilterChange={(key, value) => setFilterStatus(value)}
            onClearAll={() => setFilterStatus('')}
          />
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mô tả..."
              className="w-full pl-10 h-36px"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <RoleTable
          roles={roles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getAccountCount={getAccountCountByRole}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
        />
      </div>

      <RoleModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSave={handleSave}
        editItem={editItem}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={() => setConfirmDelete(null)}>
          <div className="card animate-fade-slide-in w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center">
                <Shield size={24} className="text-danger" />
              </div>
              <h3 className="font-bold text-lg">Xác nhận xóa</h3>
              <p className="text-sm text-muted">
                Bạn có chắc chắn muốn xóa vai trò <strong>"{confirmDelete.name}"</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn flex-1 modal-btn" onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="btn bg-danger text-white flex-1 modal-btn" onClick={confirmDeleteRole}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
