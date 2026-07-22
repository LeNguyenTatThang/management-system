import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Mật khẩu xác nhận không khớp');
    if (form.password.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      toast.success('Đăng ký thành công!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-gradient">
      <div className="card animate-fade-slide-in auth-card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary-light mb-4">
            <Coffee size={40} className="auth-coffee-icon" />
          </div>
          <h1 className="text-2xl font-bold">Đăng ký</h1>
          <p className="text-muted text-sm mt-2">Tạo tài khoản quản lý cho quán của bạn!</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Họ và tên</label>
            <input type="text" placeholder="Nhập họ và tên" value={form.name}
              onChange={handleChange('name')} required
              className="w-full h-44px" />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Email</label>
            <input type="email" placeholder="example@gmail.com" value={form.email}
              onChange={handleChange('email')} required
              className="w-full h-44px" />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Mật khẩu</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} placeholder="Ít nhất 6 ký tự" value={form.password}
                onChange={handleChange('password')} required minLength={6}
                className="w-full h-44px pr-10" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4px absolute-center-y text-muted p-2">
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Xác nhận mật khẩu</label>
            <input type={showPwd ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" value={form.confirm}
              onChange={handleChange('confirm')} required minLength={6}
              className="w-full h-44px" />
          </div>

          <button type="submit" disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 text-base h-48px">
            {loading ? <span className="loader" /> : <UserPlus size={20} />}
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          <p>Đã có tài khoản? <Link to="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}
