import { useState } from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Coffee, LayoutDashboard, UtensilsCrossed, ShoppingCart, Package, Users, FileText, Settings, HelpCircle, LogOut, Store, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../contexts/AuthContext';

const navGroups = [
  {
    title: 'NHẬP LIỆU',
    items: [
      { name: 'Danh mục nguyên liệu', icon: Package, path: '/ingredients' },
      { name: 'Công thức thành phần NL', icon: UtensilsCrossed, path: '/recipes' },
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

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPOS = location.pathname.includes('/pos');

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {!isPOS && <Sidebar />}
      <div className="flex-1 min-w-0 w-full flex flex-col h-full overflow-hidden">
        {!isPOS && <Topbar onToggleMenu={() => setMobileMenuOpen(true)} />}
        <main className={`w-full min-w-0 flex-1 overflow-y-auto ${isPOS ? 'p-0' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>

      {!isPOS && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg animate-slide-in-left flex flex-col">
            <div className="sidebar-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary text-white font-bold rounded-full">D</div>
                <div>
                  <div className="font-bold text-sm">DEZ LAB</div>
                  <div className="text-xs text-muted">QUẢN LÝ QUÁN CAFE</div>
                </div>
              </div>
              <button className="p-1 text-muted" onClick={() => setMobileMenuOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {navGroups.map((group, i) => (
                <div key={i} className="nav-group">
                  <div className="nav-group-title">{group.title}</div>
                  {group.items.map((item, j) => (
                    <NavLink
                      key={j}
                      to={item.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
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
        </div>
      )}
    </div>
  );
}
