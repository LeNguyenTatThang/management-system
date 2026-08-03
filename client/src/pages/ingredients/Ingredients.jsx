import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIngredient } from '../../contexts/IngredientContext';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';

const CATEGORIES = ['Cà phê', 'Sữa', 'Trà', 'Trái cây', 'Syrup', 'Đường', 'Topping', 'Khác'];

export default function Ingredients() {
  const { ingredients, toggleIngredient, deleteIngredient } = useIngredient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = ingredients.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !categoryFilter || i.category === categoryFilter;
    const matchStatus = !statusFilter || (statusFilter === 'active' && i.active) || (statusFilter === 'inactive' && !i.active);
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Xóa nguyên liệu này?')) await deleteIngredient(id);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Nguyên liệu</h2>
            <p className="text-muted text-sm">Quản lý {ingredients.length} nguyên liệu</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={() => navigate('/ingredients/create')}>
            <Plus size={18} /> Thêm nguyên liệu
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3">
          <FilterPopover
            filters={[
              {
                key: 'category',
                label: 'Phân loại',
                options: [
                  { value: '', label: 'Tất cả phân loại' },
                  ...CATEGORIES.map(c => ({ value: c, label: c })),
                ],
              },
              {
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Đang sử dụng' },
                  { value: 'inactive', label: 'Đã tắt' },
                ],
              },
            ]}
            activeFilters={{ category: categoryFilter, status: statusFilter }}
            onFilterChange={(key, value) => {
              if (key === 'category') setCategoryFilter(value);
              if (key === 'status') setStatusFilter(value);
            }}
            onClearAll={() => { setCategoryFilter(''); setStatusFilter(''); }}
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
                <th>Phân loại</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id}>
                  <td className="text-center text-muted text-sm">{idx + 1}</td>
                  <td className="font-semibold">{item.name}</td>
                  <td><span className="badge badge-neutral">{item.category}</span></td>
                  <td>
                    <span className="font-bold">{item.stock} {item.unit}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <label className="switch">
                        <input type="checkbox" checked={item.active} onChange={() => toggleIngredient(item.id)} />
                        <span className="switch-slider"></span>
                      </label>

                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => navigate(`/ingredients/${item.id}`)}><Edit3 size={16} /></button>
                      <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-8">{searchTerm || categoryFilter || statusFilter ? 'Không tìm thấy nguyên liệu' : 'Chưa có nguyên liệu nào'}</td></tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>
    </PageContainer>
  );
}
