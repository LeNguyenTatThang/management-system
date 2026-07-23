import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../contexts/StaffContext';
import { ArrowLeft, User, ShieldCheck, Info } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import { toast } from 'react-hot-toast';

const ROLE_OPTIONS = ['Nhân viên pha chế', 'Thu ngân', 'Phục vụ', 'Quản lý'];

export default function EmployeeCreate() {
  const { addStaff } = useStaff();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Nhân viên pha chế');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await addStaff({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), role });
      toast.success('Thêm nhân viên thành công');
      navigate('/staff');
    } catch {
      toast.error('Có lỗi xảy ra khi thêm nhân viên');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/staff')}>QL Nhân viên</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/staff')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm nhân viên</h1>
          <p className="text-muted text-sm mt-1">Nhập thông tin để tạo nhân viên mới</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Info} title="THÔNG TIN CƠ BẢN" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Họ và tên <span className="text-danger">*</span></label>
                <input type="text" placeholder="Nhập họ tên..."
                  className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Số điện thoại</label>
                <input type="tel" placeholder="Số điện thoại (không bắt buộc)"
                  className="w-full modal-input"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email <span className="text-danger">*</span></label>
                <input type="email" placeholder="Nhập email..."
                  className={`w-full modal-input ${errors.email ? 'border-danger' : ''}`}
                  value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mật khẩu <span className="text-danger">*</span></label>
                <input type="password" placeholder="Nhập mật khẩu..."
                  className={`w-full modal-input ${errors.password ? 'border-danger' : ''}`}
                  value={password} onChange={e => setPassword(e.target.value)} />
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection icon={ShieldCheck} title="VAI TRÒ" className="mb-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Vai trò <span className="text-danger">*</span></label>
              <select className="w-full modal-input md:max-w-xs" value={role} onChange={e => setRole(e.target.value)}>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/staff')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
