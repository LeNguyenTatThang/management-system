import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuProduct } from '../../contexts/MenuProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit3, Trash2, Search, LayoutGrid, List as ListIcon, UtensilsCrossed } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  active: { label: 'Đang bán', badge: 'badge-success' },
  inactive: { label: 'Ngừng bán', badge: 'badge-danger' },
};

export default function MenuProducts() {
  const navigate = useNavigate();
  const { products, categories, loading, error, fetchProducts, removeProduct } = useMenuProduct();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filtered = useMemo(() => {
    let list = products;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q));
    }
    if (filterCategory) {
      list = list.filter(p => String(p.categoryId) === filterCategory);
    }
    if (filterStatus) {
      list = list.filter(p => p.status === filterStatus);
    }
    return list;
  }, [products, searchTerm, filterCategory, filterStatus]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa món "${name}"?`)) return;
    try {
      await removeProduct(id);
      toast.success('Đã xóa món');
    } catch (e) {
      toast.error(e.message || 'Không thể xóa món');
    }
  };

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-danger font-semibold">{error}</p>
          <button className="btn btn-primary mt-4" onClick={() => fetchProducts()}>Thử lại</button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Danh mục món</h2>
            <p className="text-muted text-sm">{products.length} món</p>
          </div>
          {hasPermission('product.product.create') && (
            <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={() => navigate('/products/new')}>
              <Plus size={18} /> Thêm món
            </button>
          )}
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <FilterPopover
            filters={[
              {
                key: 'category',
                label: 'Danh mục',
                options: [
                  { value: '', label: 'Tất cả danh mục' },
                  ...categories.map(c => ({ value: String(c.id), label: c.name })),
                ],
              },
              {
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Đang bán' },
                  { value: 'inactive', label: 'Ngừng bán' },
                ],
              },
            ]}
            activeFilters={{ category: filterCategory, status: filterStatus }}
            onFilterChange={(key, value) => {
              if (key === 'category') setFilterCategory(value);
              if (key === 'status') setFilterStatus(value);
            }}
            onClearAll={() => { setFilterCategory(''); setFilterStatus(''); }}
          />
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm tên món..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center p-0.5 bg-muted rounded-md ml-1 flex-shrink-0">
            <button className={`flex items-center justify-center p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
              onClick={() => setViewMode('grid')}><LayoutGrid size={16} /></button>
            <button className={`flex items-center justify-center p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
              onClick={() => setViewMode('list')}><ListIcon size={16} /></button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
            {loading ? (
              <div className="col-span-full text-center text-muted py-12">Đang tải dữ liệu...</div>
            ) : filtered.map(product => {
              const cfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.active;
              return (
                <div key={product.id} className="card p-4 flex gap-4 cursor-pointer transition hover-bg-primary-light min-w-0"
                  onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="w-20 h-20 rounded-xl bg-bg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={28} /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-base truncate">{product.name}</div>
                    <div className="text-xs text-muted mt-0.5">{product.categoryName || 'Chưa phân loại'}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-bold text-primary">{product.price?.toLocaleString('vi-VN')}đ</span>
                      <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    {product.setupNames.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {product.setupNames.map((name, i) => (
                          <span key={i} className="text-xs bg-bg px-2 py-0.5 rounded-full">{name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {hasPermission('product.product.update') && (
                      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => navigate(`/products/${product.id}/edit`)}>
                        <Edit3 size={16} />
                      </button>
                    )}
                    {hasPermission('product.product.delete') && (
                      <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(product.id, product.name)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center text-muted py-12">{searchTerm || filterCategory || filterStatus ? 'Không tìm thấy món' : 'Chưa có món nào'}</div>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <ResponsiveTable>
                <thead>
                  <tr>
                    <th className="w-12 text-center">STT</th>
                    <th>Món</th>
                    <th className="hidden md:table-cell">Danh mục</th>
                    <th>Giá bán</th>
                    <th className="hidden md:table-cell">Giá vốn</th>
                    <th>Trạng thái</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center text-muted py-8">Đang tải dữ liệu...</td></tr>
                  ) : filtered.map((product, idx) => {
                    const cfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.active;
                    return (
                      <tr key={product.id} className="cursor-pointer transition hover-bg-primary-light"
                        onClick={() => navigate(`/products/${product.id}`)}>
                        <td className="text-center text-muted text-sm">{idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-bg overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={14} /></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm truncate">{product.name}</div>
                              {product.setupNames.length > 0 && (
                                <div className="text-xs text-muted truncate">{product.setupNames.join(', ')}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell text-sm text-muted">{product.categoryName || '—'}</td>
                        <td className="font-bold text-sm">{product.price?.toLocaleString('vi-VN')}đ</td>
                        <td className="hidden md:table-cell text-sm">{product.costPrice?.toLocaleString('vi-VN') || '—'}đ</td>
                        <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            {hasPermission('product.product.update') && (
                              <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => navigate(`/products/${product.id}/edit`)}>
                                <Edit3 size={16} />
                              </button>
                            )}
                            {hasPermission('product.product.delete') && (
                              <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(product.id, product.name)}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted py-8">Chưa có món nào</td></tr>
                  )}
                </tbody>
              </ResponsiveTable>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
