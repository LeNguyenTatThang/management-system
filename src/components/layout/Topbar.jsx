import { Search, Bell, User, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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
        <div className="flex items-center min-w-0 hidden md:flex" style={{ position: 'relative' }}>
          <Search size={18} className="text-muted" style={{ position: 'absolute', left: 10 }} />
          <input type="text" placeholder="Tìm kiếm..." className="w-full max-w-[200px] xl:max-w-[280px] min-w-0" style={{ paddingLeft: '36px', borderRadius: 'var(--radius-full)', background: '#f3f4f6', border: 'none', height: '36px' }} />
        </div>
        <button className="md:hidden p-2 text-muted"><Search size={20} /></button>
        
        <button style={{ position: 'relative' }} className="p-2">
          <Bell size={20} className="text-muted" />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
        </button>
        
        <div className="flex items-center gap-2 pl-2 md:pl-4 border-l border-gray-200">
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold truncate max-w-[120px]">Nguyễn Văn A</div>
            <div className="text-xs text-muted">Quản lý</div>
          </div>
        </div>
      </div>
    </div>
  );
}
