import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('dez@gmail.com');
    setPassword('123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-gradient">
      <div className="card animate-fade-slide-in auth-card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary-light mb-4">
            <Coffee size={40} className="auth-coffee-icon" />
          </div>
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="text-muted text-sm mt-2">Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Email</label>
            <input type="email" placeholder="example@gmail.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="w-full h-44px" />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Mật khẩu</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} placeholder="Nhập mật khẩu" value={password}
                onChange={e => setPassword(e.target.value)} required
                className="w-full h-44px pr-10" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4px absolute-center-y text-muted p-2">
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-muted">
              <input type="checkbox" defaultChecked className="checkbox-custom" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-primary font-semibold hover:underline">Quên mật khẩu?</a>
          </div>

          <button type="submit" disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 text-base h-48px">
            {loading ? <span className="loader" /> : <LogIn size={20} />}
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          <p>Chưa có tài khoản? <Link to="/register" className="text-primary font-semibold hover:underline">Đăng ký ngay</Link></p>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-muted mb-2">Tài khoản mẫu:</p>
          <button onClick={fillDemo}
            className="btn btn-outline text-xs px-4 py-1 demo-btn">
            dez@gmail.com / 123456
          </button>
        </div>
      </div>
    </div>
  );
}
