import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import { useRole } from '../../contexts/RoleContext';
import { ArrowLeft, UserPlus, Shield, Info } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import { ACCOUNT_STATUS_OPTIONS } from '../../types/account';
import { toast } from 'react-hot-toast';

export default function AccountCreate() {
  const { addAccount } = useAccount();
  const { roles } = useRole();
  const navigate = useNavigate();

  const activeRoles = roles.filter(r => r.status === 'Đang hoạt động');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Staff');
  const [status, setStatus] = useState('Đang hoạt động');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!username.trim()) errs.username = 'Vui lòng nhập username';
    if (!email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) errs.password = 'Mật khẩu ít nhất 6 ký tự';
    if (password !== confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      addAccount({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        status,
      });
      toast.success('Thêm tài khoản thành công');
      navigate('/accounts');
    } catch {
      toast.error('Có lỗi xảy ra khi thêm tài khoản');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/accounts')}>QL Tài khoản</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/accounts')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm tài khoản</h1>
          <p className="text-muted text-sm mt-1">Nhập thông tin để tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Info} title="THÔNG TIN CƠ BẢN" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Họ và tên <span className="text-danger">*</span></label>
                <input type="text" placeholder="Nguyễn Văn A"
                  className={`w-full modal-input ${errors.fullName ? 'border-danger' : ''}`}
                  value={fullName} onChange={e => setFullName(e.target.value)} />
                {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Số điện thoại</label>
                <input type="tel" placeholder="090xxxxxxx"
                  className="w-full modal-input"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Username <span className="text-danger">*</span></label>
                <input type="text" placeholder="username"
                  className={`w-full modal-input ${errors.username ? 'border-danger' : ''}`}
                  value={username} onChange={e => setUsername(e.target.value)} />
                {errors.username && <p className="text-xs text-danger mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email <span className="text-danger">*</span></label>
                <input type="email" placeholder="email@example.com"
                  className={`w-full modal-input ${errors.email ? 'border-danger' : ''}`}
                  value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mật khẩu <span className="text-danger">*</span></label>
                <input type="password" placeholder="••••••"
                  className={`w-full modal-input ${errors.password ? 'border-danger' : ''}`}
                  value={password} onChange={e => setPassword(e.target.value)} />
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                <input type="password" placeholder="••••••"
                  className={`w-full modal-input ${errors.confirmPassword ? 'border-danger' : ''}`}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection icon={Shield} title="PHÂN QUYỀN" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Vai trò <span className="text-danger">*</span></label>
                <select className="w-full modal-input" value={role} onChange={e => setRole(e.target.value)}>
                  {activeRoles.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Trạng thái</label>
                <select className="w-full modal-input" value={status} onChange={e => setStatus(e.target.value)}>
                  {ACCOUNT_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/accounts')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
