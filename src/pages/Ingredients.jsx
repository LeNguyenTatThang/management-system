import { Search, Plus, Filter, AlertTriangle, Package, TrendingDown, Archive } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const ingredients = [
  { id: 'NL01', name: 'Cà phê Robusta', group: 'Cà phê', unit: 'Kg', stock: 12.5, minStock: 5, price: 150000, status: 'Đủ hàng' },
  { id: 'NL02', name: 'Sữa đặc Ngôi Sao', group: 'Sữa', unit: 'Hộp', stock: 2, minStock: 10, price: 22000, status: 'Sắp hết' },
  { id: 'NL03', name: 'Syrup Đào', group: 'Syrup', unit: 'Chai', stock: 0.5, minStock: 2, price: 180000, status: 'Sắp hết' },
  { id: 'NL04', name: 'Trà Đen', group: 'Trà', unit: 'Kg', stock: 8, minStock: 3, price: 120000, status: 'Đủ hàng' },
];

export default function Ingredients() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">

        {/* Page header */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Nguyên liệu</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Quản lý danh mục nguyên liệu và tồn kho</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
          <div className="card flex items-center gap-4">
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(108,17,30,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng nguyên liệu</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>45</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)', flexShrink: 0 }}>
              <Archive size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng giá trị tồn</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--info)', lineHeight: 1.2 }}>12.540.000đ</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', flexShrink: 0 }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sắp hết</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--warning)', lineHeight: 1.2 }}>8</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', flexShrink: 0 }}>
              <TrendingDown size={22} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hết hàng</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--danger)', lineHeight: 1.2 }}>2</div>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="card p-0 min-w-0">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div style={{ position: 'relative' }} className="w-full sm:w-auto">
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Tìm kiếm nguyên liệu..." className="w-full sm:w-[250px]" style={{ paddingLeft: 38, height: 38, borderRadius: 10 }} />
              </div>
              <button className="btn btn-outline" style={{ height: 38, borderRadius: 10 }}><Filter size={16} /> Lọc</button>
            </div>
            <button className="btn btn-primary w-full md:w-auto" style={{ height: 38, borderRadius: 10 }}>
              <Plus size={16} /> Nhập kho
            </button>
          </div>

          <ResponsiveTable>
            <thead>
              <tr>
                <th>Tên nguyên liệu</th>
                <th>Nhóm</th>
                <th>Đơn vị</th>
                <th>Tồn kho</th>
                <th>Tồn tối thiểu</th>
                <th>Giá nhập</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.group}</td>
                  <td>{item.unit}</td>
                  <td style={{ fontWeight: 700 }}>{item.stock}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.minStock}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                  <td>
                    <span className={`badge ${item.status === 'Đủ hàng' ? 'badge-success' : 'badge-warning'}`}>{item.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 10px' }}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>
    </PageContainer>
  );
}
