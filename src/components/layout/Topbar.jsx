import { Search, Bell, User, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const getTitle = (pathname) => {
  if (pathname.includes('/dashboard')) return 'Tổng quan';
  if (pathname.includes('/products')) return 'Danh mục món';
  if (pathname.includes('/recipes')) return 'Danh sách công thức';
  if (pathname.includes('/ingredients')) return 'Nguyên liệu';
  if (pathname.includes('/orders')) return 'Đơn hàng';
  if (pathname.includes('/staff')) return 'Nhân viên';
  if (pathname.includes('/suppliers')) return 'Nhà cung cấp';
  if (pathname.includes('/pos')) return 'Bán hàng / POS';
  return 'Dez Lab';
};

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="topbar min-w-0 flex items-center justify-between px-4 md:px-6 w-full">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button className="md:hidden text-muted p-1"><Menu size={24} /></button>
        <div className="min-w-0 truncate">
          <h1 className="text-lg md:text-xl font-bold truncate">{title}</h1>
          <div className="text-xs md:text-sm text-muted truncate hidden md:block">Dashboard / {title}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="relative hidden md:flex items-center min-w-0">
          <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
          <input type="text" placeholder="Tìm kiếm..." className="topbar-search pl-10" />
        </div>
        <button className="md:hidden p-2 text-muted"><Search size={20} /></button>
        
        <button className="p-2 relative">
          <Bell size={20} className="text-muted" />
          <span className="w-2 h-2 absolute top-4px right-4px bg-danger rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-2 pl-2 md:pl-4 border-l border-gray-200">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
            <User size={20} />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold truncate max-w-120px">{user?.name || 'Người dùng'}</div>
            <div className="text-xs text-muted">{user?.role || ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
