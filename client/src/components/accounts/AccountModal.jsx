import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { ACCOUNT_STATUS_OPTIONS } from '../../types/account';
import { useRole } from '../../contexts/RoleContext';

const defaultForm = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'Staff',
  status: 'Đang hoạt động',
};

export default function AccountModal({ show, onClose, onSave, editItem }) {
  const { roles } = useRole();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  const activeRoles = roles.filter(r => r.status === 'Đang hoạt động');

  useEffect(() => {
    if (editItem) {
      setForm({
        fullName: editItem.fullName,
        username: editItem.username,
        email: editItem.email,
        phone: editItem.phone || '',
        password: '',
        confirmPassword: '',
        role: editItem.role,
        status: editItem.status,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editItem, show]);

  const handleChange = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!form.username.trim()) errs.username = 'Vui lòng nhập username';
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!editItem) {
      if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
      else if (form.password.length < 6) errs.password = 'Mật khẩu ít nhất 6 ký tự';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { ...form };
    if (!editItem) {
      delete payload.confirmPassword;
    } else {
      if (!payload.password) {
        delete payload.password;
      }
      delete payload.confirmPassword;
    }
    onSave(payload);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div className="card animate-fade-slide-in w-full max-w-lg max-h-90vh overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-lg truncate flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            {editItem ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}
          </h3>
          <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={onClose}>×</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Họ và tên <span className="text-danger">*</span></label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className={`w-full modal-input ${errors.fullName ? 'border-danger' : ''}`}
              value={form.fullName}
              onChange={handleChange('fullName')}
            />
            {errors.fullName && <span className="text-xs text-danger mt-1">{errors.fullName}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Username <span className="text-danger">*</span></label>
              <input
                type="text"
                placeholder="username"
                className={`w-full modal-input ${errors.username ? 'border-danger' : ''}`}
                value={form.username}
                onChange={handleChange('username')}
              />
              {errors.username && <span className="text-xs text-danger mt-1">{errors.username}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email <span className="text-danger">*</span></label>
              <input
                type="email"
                placeholder="email@example.com"
                className={`w-full modal-input ${errors.email ? 'border-danger' : ''}`}
                value={form.email}
                onChange={handleChange('email')}
              />
              {errors.email && <span className="text-xs text-danger mt-1">{errors.email}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Số điện thoại</label>
            <input
              type="tel"
              placeholder="090xxxxxxx"
              className="w-full modal-input"
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </div>

          {editItem ? (
            <div>
              <label className="block text-sm font-semibold mb-1">
                Mật khẩu mới <span className="text-muted font-normal">(để trống nếu không đổi)</span>
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới..."
                className="w-full modal-input"
                value={form.password}
                onChange={handleChange('password')}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Mật khẩu <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    placeholder="••••••"
                    className={`w-full modal-input ${errors.password ? 'border-danger' : ''}`}
                    value={form.password}
                    onChange={handleChange('password')}
                  />
                  {errors.password && <span className="text-xs text-danger mt-1">{errors.password}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    placeholder="••••••"
                    className={`w-full modal-input ${errors.confirmPassword ? 'border-danger' : ''}`}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                  />
                  {errors.confirmPassword && <span className="text-xs text-danger mt-1">{errors.confirmPassword}</span>}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Vai trò <span className="text-danger">*</span></label>
              <select className="w-full modal-input" value={form.role} onChange={handleChange('role')}>
                {activeRoles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Trạng thái</label>
              <select className="w-full modal-input" value={form.status} onChange={handleChange('status')}>
                {ACCOUNT_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button className="btn flex-1 modal-btn" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>
              {editItem ? 'Cập nhật' : 'Thêm tài khoản'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
