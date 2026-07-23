import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIngredient } from '../contexts/IngredientContext';
import { Plus, Edit3, Trash2, Search, SlidersHorizontal, X } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const CATEGORIES = ['Cà phê', 'Sữa', 'Trà', 'Trái cây', 'Syrup', 'Đường', 'Topping', 'Khác'];

export default function Ingredients() {
  const { ingredients, toggleIngredient, deleteIngredient } = useIngredient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const popoverRef = useRef(null);
  const filterBtnRef = useRef(null);

  const activeFilterCount = (categoryFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  const filtered = ingredients.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !categoryFilter || i.category === categoryFilter;
    const matchStatus = !statusFilter || (statusFilter === 'active' && i.active) || (statusFilter === 'inactive' && !i.active);
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Xóa nguyên liệu này?')) await deleteIngredient(id);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target)
      ) {
        setShowFilterPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="relative flex-1 min-w-0">
              <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
              <input type="text" placeholder="Tìm nguyên liệu..." className="w-full pl-10 h-36px"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative flex-shrink-0">
              <button ref={filterBtnRef}
                className={`filter-btn flex items-center gap-1.5 px-3 h-36px cursor-pointer whitespace-nowrap ${
                  activeFilterCount > 0 ? 'filter-btn-active' : ''
                }`}
                onClick={() => setShowFilterPopover(p => !p)}>
                <SlidersHorizontal size={16} />
                <span className="text-sm font-semibold">Lọc</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">{activeFilterCount}</span>
                )}
              </button>
              {showFilterPopover && (
                <div ref={popoverRef} className="filter-popover">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">Lọc nguyên liệu</h3>
                    <button className="p-1 text-muted hover-text-danger cursor-pointer" onClick={() => setShowFilterPopover(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">Phân loại</label>
                      <select className="w-full h-36px text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                        <option value="">Tất cả phân loại</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">Trạng thái</label>
                      <select className="w-full h-36px text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang sử dụng</option>
                        <option value="inactive">Đã tắt</option>
                      </select>
                    </div>
                    {activeFilterCount > 0 && (
                      <button className="text-xs font-semibold text-primary cursor-pointer text-left mt-1 hover-text-primary-dark"
                        onClick={clearFilters}>Xóa bộ lọc</button>
                    )}
                  </div>
                </div>
              )}
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
                      <span className={`text-xs font-semibold ${item.active ? 'text-success' : 'text-muted'}`}>
                        {item.active ? 'Đang sử dụng' : 'Đã tắt'}
                      </span>
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
