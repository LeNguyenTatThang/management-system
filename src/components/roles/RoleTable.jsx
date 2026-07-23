import { Shield, Edit3, Trash2, Users } from 'lucide-react';
import ResponsiveTable from '../ui/ResponsiveTable';

export default function RoleTable({
  roles,
  onEdit,
  onDelete,
  getAccountCount,
  searchTerm,
  filterStatus,
}) {
  const filtered = roles.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (filtered.length === 0) {
    return (
      <div className="card p-0 overflow-hidden min-w-0">
        <div className="flex flex-col items-center justify-center py-16 text-muted gap-3">
          <Shield size={48} className="opacity-30" />
          <span className="text-sm font-semibold">
            {searchTerm || filterStatus ? 'Không tìm thấy vai trò' : 'Chưa có vai trò nào'}
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
            <th>Tên vai trò</th>
            <th className="hidden md:table-cell">Mô tả</th>
            <th className="text-center">Số tài khoản</th>
            <th>Trạng thái</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((role, idx) => {
            const count = getAccountCount(role.name);
            return (
              <tr key={role.id}>
                <td className="text-center text-muted text-sm">{idx + 1}</td>
                <td>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-2">
                        {role.name}
                        {role.system && (
                          <span className="badge badge-neutral text-xs">Hệ thống</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-sm text-muted hidden md:table-cell max-w-200px truncate">{role.description}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Users size={14} className="text-muted" />
                    <span className={count > 0 ? 'font-semibold' : 'text-muted'}>{count}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${role.status === 'Đang hoạt động' ? 'badge-success' : 'badge-danger'}`}>
                    {role.status}
                  </span>
                </td>
                <td className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="p-1.5 text-muted hover-text-primary cursor-pointer"
                      onClick={() => onEdit(role)}
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className={`p-1.5 cursor-pointer ${role.system ? 'text-gray-300 cursor-not-allowed' : 'text-muted hover-text-danger'}`}
                      onClick={() => !role.system && onDelete(role)}
                      disabled={role.system}
                      title={role.system ? 'Không thể xóa vai trò hệ thống' : 'Xóa'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ResponsiveTable>
    </div>
  );
}
