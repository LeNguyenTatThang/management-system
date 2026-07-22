import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Coffee, LayoutDashboard, UtensilsCrossed, 
  ShoppingCart, Package, Users, FileText, Settings, HelpCircle, LogOut, Store
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navGroups = [
  {
    title: 'NHẬP LIỆU',
    items: [
      { name: 'Danh mục nguyên liệu', icon: Package, path: '/ingredients' },
      { name: 'Công thức / Định lượng', icon: UtensilsCrossed, path: '/recipes' },
      { name: 'Danh mục món', icon: Coffee, path: '/products' },
      { name: 'Nhà cung cấp', icon: Store, path: '/suppliers' },
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
    title: 'QUẢN LÝ',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Nhân viên', icon: Users, path: '/staff' },
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
    <div className="sidebar hidden md:flex flex-col">
      <div className="sidebar-header">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary text-white font-bold rounded-full">D</div>
        <div>
          <div className="font-bold text-sm">DEZ LAB</div>
          <div className="text-xs text-muted">QUẢN LÝ QUÁN CAFE</div>
        </div>
      </div>
      
      <div className="sidebar-nav">
        {navGroups.map((group, i) => (
          <div key={i} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.items.map((item, j) => (
              <NavLink 
                key={j} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="nav-item"><Settings size={18} /> Cài đặt</div>
        <div className="nav-item"><HelpCircle size={18} /> Trợ giúp</div>
        <div className="nav-item text-danger cursor-pointer" onClick={handleLogout}><LogOut size={18} /> Đăng xuất</div>
      </div>
    </div>
  );
}
