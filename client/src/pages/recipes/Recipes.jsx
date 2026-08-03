import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../../contexts/RecipeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';
import RecipeCard from '../../components/recipe/RecipeCard';

export default function Recipes() {
  const navigate = useNavigate();
  const { recipes, loading, error, fetchRecipes, removeRecipe } = useRecipe();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filtered = useMemo(() => {
    if (!searchTerm) return recipes;
    const q = searchTerm.toLowerCase();
    return recipes.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q)
    );
  }, [recipes, searchTerm]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa công thức "${name}"?`)) return;
    try {
      await removeRecipe(id);
    } catch (e) {
      // toast handled in context
    }
  };

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-danger font-semibold">{error}</p>
          <button className="btn btn-primary mt-4" onClick={() => fetchRecipes()}>Thử lại</button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0 px-2 py-2">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Công thức thành phần nguyên liệu</h2>
            <p className="text-muted text-sm">{recipes.length} công thức</p>
          </div>
          {hasPermission('product.recipe.create') && (
            <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={() => navigate('/recipes/new')}>
              <Plus size={18} /> Thêm công thức
            </button>
          )}
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3">
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm theo tên món..." className="w-full pl-10 h-36px"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
            {loading ? (
              <div className="col-span-full text-center text-muted py-12">Đang tải dữ liệu...</div>
            ) : filtered.map(item => (
              <RecipeCard
                key={item.id}
                item={item}
                product={item.product}
                onClick={() => navigate(`/recipes/${item.id}`)}
                onEdit={() => navigate(`/recipes/${item.id}/edit`)}
                onDelete={() => handleDelete(item.id, item.name)}
              />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center text-muted py-12">{searchTerm ? 'Không tìm thấy công thức' : 'Chưa có công thức nào'}</div>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden min-w-0">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th className="w-12 text-center">STT</th>
                  <th>Tên công thức</th>
                  <th className="hidden md:table-cell">Món</th>
                  <th className="hidden md:table-cell">Số NL</th>
                  <th className="hidden md:table-cell">Giá bán</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-muted py-8">Đang tải dữ liệu...</td></tr>
                ) : filtered.map((item, idx) => (
                  <tr key={item.id} className="cursor-pointer transition hover-bg-primary-light"
                    onClick={() => navigate(`/recipes/${item.id}`)}>
                    <td className="text-center text-muted text-sm">{idx + 1}</td>
                    <td className="font-semibold">{item.name}</td>
                    <td className="hidden md:table-cell text-sm text-muted">{item.product?.name || '—'}</td>
                    <td className="hidden md:table-cell text-sm">{item.ingredients?.length || 0}</td>
                    <td className="hidden md:table-cell font-bold text-sm">{item.product?.price?.toLocaleString('vi-VN')}đ</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        {hasPermission('product.recipe.update') && (
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => navigate(`/recipes/${item.id}/edit`)}>
                            <span className="sr-only">Sửa</span>
                          </button>
                        )}
                        {hasPermission('product.recipe.delete') && (
                          <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(item.id, item.name)}>
                            <span className="sr-only">Xóa</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-8">Chưa có công thức nào</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
