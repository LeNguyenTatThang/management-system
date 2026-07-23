import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Coffee, LayoutDashboard, UtensilsCrossed, 
  ShoppingCart, Package, Users, FileText, Settings, HelpCircle, LogOut, Store, Palette, Tag, Gift, UserCog, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navGroups = [
  {
    title: 'QUẢN LÝ',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Nhân viên', icon: Users, path: '/staff' },
      { name: 'Tài khoản', icon: UserCog, path: '/accounts' },
      { name: 'Vai trò', icon: Shield, path: '/accounts/roles' },
      { name: 'Theme', icon: Palette, path: '/themes' },
      { name: 'Voucher', icon: Tag, path: '/vouchers' },
      { name: 'Chương trình KM', icon: Gift, path: '/promotions' },
    ]
  },
  {
    title: 'BÁN HÀNG',
    items: [
      { name: 'Bán hàng / POS', icon: ShoppingCart, path: '/pos' },
      { name: 'Đơn hàng', icon: FileText, path: '/orders' },
    ]
  },
  {
    title: 'NHẬP LIỆU',
    items: [
      { name: 'Nguyên liệu', icon: Package, path: '/ingredients' },
      { name: 'Công thức', icon: UtensilsCrossed, path: '/recipes' },
      { name: 'Món', icon: Coffee, path: '/products' },
      { name: 'Nhà cung cấp', icon: Store, path: '/suppliers' },
    ]
  }
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar hidden md:flex flex-col">
      <div className="sidebar-header flex-shrink-0">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary text-white font-bold rounded-full">D</div>
        <div>
          <div className="font-bold text-sm">DEZ LAB</div>
          <div className="text-xs text-muted">QUẢN LÝ QUÁN CAFE</div>
        </div>
      </div>
      
      <nav className="sidebar-nav flex-1 min-h-0">
        {navGroups.map((group, i) => (
          <div key={i} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.items.map((item, j) => (
              <NavLink 
                key={j} 
                to={item.path} 
                end={item.path === '/accounts'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      
      <div className="px-4 py-2 border-t flex-shrink-0 bg-[var(--card-bg)]">
        <div className="nav-item !py-1.5 !gap-2 text-sm"><Settings size={16} /> Cài đặt</div>
        <div className="nav-item !py-1.5 !gap-2 text-sm"><HelpCircle size={16} /> Trợ giúp</div>
        <div className="nav-item !py-1.5 !gap-2 text-sm text-danger cursor-pointer" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</div>
      </div>
    </aside>
  );
}
