import { useState } from 'react';
import { Search, Plus, LayoutGrid, List as ListIcon, Edit, Eye, Trash2 } from 'lucide-react';
import { products } from '../data/mockData';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

export default function MenuProducts() {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm border border-[rgba(0,0,0,0.05)] gap-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div style={{ position: 'relative' }} className="w-full sm:w-auto">
              <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Tìm kiếm món..." className="w-full sm:w-[250px]" style={{ paddingLeft: '40px', height: '40px' }} />
            </div>
            <select style={{ height: '40px' }}>
              <option>Tất cả danh mục</option>
              <option>Cà phê</option>
              <option>Trà</option>
            </select>
            <select style={{ height: '40px' }} className="flex-1 sm:flex-none">
              <option>Đang bán</option>
              <option>Tạm ngưng</option>
            </select>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center p-1" style={{ backgroundColor: '#f3f4f6', borderRadius: 'var(--radius-md)' }}>
              <button
                className="flex items-center justify-center"
                style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'card' ? 'white' : 'transparent', color: viewMode === 'card' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'card' ? 'var(--shadow-sm)' : 'none' }}
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className="flex items-center justify-center"
                style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={18} />
              </button>
            </div>
            <button className="btn btn-primary" style={{ height: '40px' }}>
              <Plus size={18} /> Thêm món mới
            </button>
          </div>
        </div>
      </div>
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full min-w-0">
          {products.map(p => (
            <div key={p.id} className="card flex flex-col" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 180, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="flex flex-col flex-1" style={{ padding: 'var(--spacing-4)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <div className="text-sm text-muted">{p.category}</div>
                  </div>
                  <span className={`badge ${p.status === 'Đang bán' ? 'badge-success' : 'badge-neutral'}`}>{p.status}</span>
                </div>
                <div className="text-xl font-bold text-primary mb-4">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                </div>
                <div className="mt-auto space-y-2 text-sm pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted">Giá vốn:</span>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Lợi nhuận:</span>
                    <span className="font-medium" style={{ color: 'var(--success)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.profit)}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn btn-outline flex-1">Chi tiết</button>
                  <button className="btn btn-primary" style={{ padding: '8px' }}><Edit size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ResponsiveTable>
          <thead>
            <tr>
              <th>Mã món</th>
              <th>Tên món</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th>Giá vốn</th>
              <th>Lợi nhuận</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td className="text-muted text-sm">{p.id}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </td>
                <td>{p.category}</td>
                <td className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.cost)}</td>
                <td style={{ color: 'var(--success)', fontWeight: 500 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.profit)}</td>
                <td><span className={`badge ${p.status === 'Đang bán' ? 'badge-success' : 'badge-neutral'}`}>{p.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex items-center justify-end gap-2">
                    <button style={{ padding: '4px', color: 'var(--text-muted)' }}><Eye size={18} /></button>
                    <button style={{ padding: '4px', color: 'var(--text-muted)' }}><Edit size={18} /></button>
                    <button style={{ padding: '4px', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      )}
    </PageContainer>
  );
}
