import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import { ArrowLeft, Shield, Info } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import FormTextarea from '../../components/ui/FormTextarea';
import PermissionMatrix from '../../components/roles/PermissionMatrix';
import { buildEmptyPermissions } from '../../types/role';
import { toast } from 'react-hot-toast';

export default function RoleCreate() {
  const { addRole } = useRole();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Đang hoạt động');
  const [permissions, setPermissions] = useState(buildEmptyPermissions());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập tên vai trò';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      addRole({ name: name.trim(), description: description.trim(), status, permissions });
      toast.success('Thêm vai trò thành công');
      navigate('/accounts/roles');
    } catch {
      toast.error('Có lỗi xảy ra khi thêm vai trò');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/accounts/roles')}>QL Vai trò</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/accounts/roles')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm vai trò</h1>
          <p className="text-muted text-sm mt-1">Nhập thông tin để tạo vai trò mới</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Info} title="THÔNG TIN CƠ BẢN" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Tên vai trò <span className="text-danger">*</span></label>
                <input type="text" placeholder="VD: Quản lý kho"
                  className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Trạng thái</label>
                <select className="w-full modal-input" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
                </select>
              </div>
            </div>
            <FormTextarea
              label="Mô tả"
              placeholder="Mô tả vai trò..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </FormSection>

          <FormSection icon={Shield} title="PHÂN QUYỀN" subtitle="Thiết lập quyền hạn cho vai trò" className="mb-5">
            <PermissionMatrix permissions={permissions} onChange={setPermissions} />
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/accounts/roles')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm vai trò'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
