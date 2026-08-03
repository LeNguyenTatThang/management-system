import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIngredient } from '../../contexts/IngredientContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang dùng' },
  { value: 'inactive', label: 'Ngừng dùng' },
];

export default function Ingredients() {
  const { ingredients, loading, error, fetchIngredients, removeIngredient } = useIngredient();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    let list = ingredients;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(i => i.name?.toLowerCase().includes(q));
    }
    if (statusFilter) {
      list = list.filter(i => i.status === statusFilter);
    }
    return list;
  }, [ingredients, searchTerm, statusFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa nguyên liệu "${name}"?`)) return;
    try {
      await removeIngredient(id);
      toast.success('Đã xóa nguyên liệu');
    } catch (e) {
      toast.error(e.message || 'Không thể xóa nguyên liệu');
    }
  };

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-danger font-semibold">{error}</p>
          <button className="btn btn-primary mt-4" onClick={() => fetchIngredients()}>Thử lại</button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Nguyên liệu</h2>
            <p className="text-muted text-sm">Quản lý {ingredients.length} nguyên liệu</p>
          </div>
          {hasPermission('product.ingredient.create') && (
            <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={() => navigate('/ingredients/create')}>
              <Plus size={18} /> Thêm nguyên liệu
            </button>
          )}
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3">
          <FilterPopover
            filters={[
              {
                key: 'status',
                label: 'Trạng thái',
                options: STATUS_OPTIONS,
              },
            ]}
            activeFilters={{ status: statusFilter }}
            onFilterChange={(key, value) => {
              if (key === 'status') setStatusFilter(value);
            }}
            onClearAll={() => setStatusFilter('')}
          />
          <div className="relative flex-1 min-w-0">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm nguyên liệu..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <ResponsiveTable>
            <thead>
              <tr>
                <th className="w-12 text-center">STT</th>
                <th>Nguyên liệu</th>
                <th className="hidden md:table-cell">Đơn vị</th>
                <th className="hidden md:table-cell">Nhà cung cấp</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-muted py-8">Đang tải dữ liệu...</td></tr>
              ) : filtered.map((item, idx) => (
                <tr key={item.id} className="cursor-pointer" onClick={() => navigate(`/ingredients/${item.id}`)}>
                  <td className="text-center text-muted text-sm">{idx + 1}</td>
                  <td>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{item.name}</div>
                      {item.category && <div className="text-xs text-muted mt-0.5">{item.category}</div>}
                    </div>
                  </td>
                  <td className="hidden md:table-cell text-sm">{item.unit?.name || '—'}</td>
                  <td className="hidden md:table-cell text-sm text-muted">{item.supplier?.name || '—'}</td>
                  <td>
                    <span className="font-bold text-sm">{item.stock} {item.unit?.symbol || ''}</span>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {item.statusLabel}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      {hasPermission('product.ingredient.update') && (
                        <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                          onClick={() => navigate(`/ingredients/${item.id}`)}><Edit3 size={16} /></button>
                      )}
                      {hasPermission('product.ingredient.delete') && (
                        <button className="p-1.5 text-muted hover-text-danger cursor-pointer"
                          onClick={() => handleDelete(item.id, item.name)}><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-8">{searchTerm || statusFilter ? 'Không tìm thấy nguyên liệu' : 'Chưa có nguyên liệu nào'}</td></tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>
    </PageContainer>
  );
}
