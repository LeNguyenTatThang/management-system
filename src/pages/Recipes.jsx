import { useState } from 'react';
import { Search, Plus, LayoutGrid, List as ListIcon, Edit, Eye, Trash2 } from 'lucide-react';
import { products } from '../data/mockData';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

export default function Recipes() {
  const [viewMode, setViewMode] = useState('card');

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full min-w-0">
          <div className="card">
            <div className="text-xs text-muted font-bold uppercase mb-1">Tổng món</div>
            <div className="text-2xl font-bold text-primary">24 món</div>
          </div>
          <div className="card">
            <div className="text-xs text-muted font-bold uppercase mb-1">Giá vốn TB/Phần</div>
            <div className="text-2xl font-bold">8.370đ</div>
          </div>
          <div className="card">
            <div className="text-xs text-muted font-bold uppercase mb-1">% Giá vốn TB</div>
            <div className="text-2xl font-bold">23.6%</div>
          </div>
          <div className="card">
            <div className="text-xs text-muted font-bold uppercase mb-1">Món FC &gt; 35%</div>
            <div className="text-2xl font-bold text-danger">3 món</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm border border-[rgba(0,0,0,0.05)] gap-4 w-full min-w-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div style={{ position: 'relative' }} className="w-full sm:w-auto">
              <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Tìm món..." className="w-full sm:w-[250px]" style={{ paddingLeft: '40px', height: '40px' }} />
            </div>
            <select style={{ height: '40px' }} className="flex-1 sm:flex-none">
              <option>Tất cả danh mục</option>
              <option>Cà phê</option>
              <option>Trà</option>
            </select>
            <select style={{ height: '40px' }} className="flex-1 sm:flex-none">
              <option>Tên A → Z</option>
              <option>Giá vốn tăng dần</option>
            </select>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center p-1" style={{ backgroundColor: '#f3f4f6', borderRadius: 'var(--radius-md)' }}>
              <button
                className={`flex items-center justify-center`}
                style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'card' ? 'white' : 'transparent', color: viewMode === 'card' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'card' ? 'var(--shadow-sm)' : 'none' }}
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={`flex items-center justify-center`}
                style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={18} />
              </button>
            </div>
            <button className="btn btn-primary" style={{ height: '40px' }}>
              <Plus size={18} /> Thêm công thức
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full min-w-0">
          {products.map(p => (
            <div key={p.id} className="card p-0 flex flex-col" style={{ padding: 0 }}>
              <div className="p-4 flex gap-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <img src={p.image} alt={p.name} style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="badge badge-neutral">{p.category}</span>
                    <span className="badge badge-neutral">{p.size}</span>
                  </div>
                  <div className="flex gap-1 mt-2 text-xs text-muted flex-wrap">
                    {p.tags.map(tag => <span key={tag} style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{tag}</span>)}
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-muted uppercase">Giá bán</span>
                  <span className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-muted uppercase">Giá vốn</span>
                  <span className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.cost)}</span>
                </div>
                <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <span className="text-xs font-bold text-muted uppercase">Food Cost</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg">{p.fc}</span>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Trung bình</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-bold text-muted uppercase mb-2">Cách làm</div>
                  <ol className="text-sm pl-4 text-muted" style={{ listStyleType: 'decimal' }}>
                    <li>Chiết xuất 35ml cà phê</li>
                    <li>Cho sữa đặc vào ly khuấy đều</li>
                    <li>Cho đá vào ly</li>
                  </ol>
                </div>

                <div className="mt-6 flex gap-2 pt-4" style={{ borderTop: '1px solid var(--border-soft)' }}>
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
              <th>Food Cost %</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td className="text-muted text-sm">{p.id}</td>
                <td className="font-semibold">{p.name}</td>
                <td>{p.category}</td>
                <td className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.cost)}</td>
                <td className="font-bold text-primary">{p.fc}</td>
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
