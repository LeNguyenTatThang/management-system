import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import PermissionMatrix from './PermissionMatrix';
import { buildEmptyPermissions } from '../../types/role';
import FormTextarea from '../ui/FormTextarea';

export default function RoleModal({ show, onClose, onSave, editItem }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'Đang hoạt động' });
  const [permissions, setPermissions] = useState(buildEmptyPermissions());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setForm({ name: editItem.name, description: editItem.description, status: editItem.status });
      setPermissions(editItem.permissions || buildEmptyPermissions());
    } else {
      setForm({ name: '', description: '', status: 'Đang hoạt động' });
      setPermissions(buildEmptyPermissions());
    }
    setErrors({});
  }, [editItem, show]);

  const handleChange = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên vai trò';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, permissions });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div className="card animate-fade-slide-in w-full max-w-3xl max-h-90vh overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-lg truncate flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            {editItem ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
          </h3>
          <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={onClose}>×</button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Tên vai trò <span className="text-danger">*</span></label>
              <input
                type="text"
                placeholder="VD: Quản lý kho"
                className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                value={form.name}
                onChange={handleChange('name')}
              />
              {errors.name && <span className="text-xs text-danger mt-1">{errors.name}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Trạng thái</label>
              <select className="w-full modal-input" value={form.status} onChange={handleChange('status')}>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </select>
            </div>
          </div>
          <FormTextarea
            label="Mô tả"
            placeholder="Mô tả vai trò..."
            value={form.description}
            onChange={handleChange('description')}
            rows={2}
          />

          <PermissionMatrix permissions={permissions} onChange={setPermissions} />

          <div className="flex gap-3 mt-2 pt-4 border-t">
            <button className="btn flex-1 modal-btn" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>
              {editItem ? 'Cập nhật' : 'Thêm vai trò'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
