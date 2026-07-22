import { useState } from 'react';
import { useRecipe } from '../contexts/RecipeContext';
import { useMenuProduct } from '../contexts/MenuProductContext';
import { useIngredient } from '../contexts/IngredientContext';
import { UtensilsCrossed, Plus, Edit3, Trash2, Search, X, Eye, LayoutGrid, List as ListIcon } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

export default function Recipes() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipe();
  const { products } = useMenuProduct();
  const { ingredients } = useIngredient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [form, setForm] = useState({ productId: '', image: '', note: '', ingredients: [] });

  const filtered = recipes.filter(r =>
    r.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleIngredientChange = (idx, key) => e => {
    const updated = [...form.ingredients];
    updated[idx] = { ...updated[idx], [key]: key === 'amount' ? Number(e.target.value) : e.target.value };
    setForm(p => ({ ...p, ingredients: updated }));
  };

  const addIngredientRow = () => {
    setForm(p => ({ ...p, ingredients: [...p.ingredients, { ingredientId: '', amount: '' }] }));
  };

  const removeIngredientRow = (idx) => {
    setForm(p => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }));
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ productId: '', image: '', note: '', ingredients: [{ ingredientId: '', amount: '' }] });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      productId: item.productId || '',
      image: item.image || '',
      note: item.note || '',
      ingredients: (item.ingredients || []).map(ing => ({
        ingredientId: ing.ingredientId || ing.id || '',
        amount: ing.amount || ''
      }))
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.productId || form.ingredients.length === 0) return;
    const product = products.find(p => p.id === form.productId);
    const payload = {
      productId: form.productId,
      productName: product?.name || '',
      image: form.image || product?.image || '',
      note: form.note || product?.description || '',
      ingredients: form.ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        amount: Number(ing.amount)
      }))
    };
    if (editItem) {
      await updateRecipe(editItem.id, payload);
    } else {
      await addRecipe(payload);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa công thức này?')) await deleteRecipe(id);
  };

  const getIngredientName = (id) => ingredients.find(i => i.id === id)?.name || id;
  const getIngredientUnit = (id) => ingredients.find(i => i.id === id)?.unit || '';

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">Công thức / Định lượng</h2>
            <p className="text-muted text-sm truncate">{recipes.length} công thức</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm công thức
          </button>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b min-w-0">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
              <input type="text" placeholder="Tìm theo tên món..." className="w-full pl-10 h-36px"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center p-1 bg-muted rounded-md">
                <button
                  className={`flex items-center justify-center p-2 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                  onClick={() => setViewMode('grid')}
                ><LayoutGrid size={18} /></button>
                <button
                  className={`flex items-center justify-center p-2 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                  onClick={() => setViewMode('list')}
                ><ListIcon size={18} /></button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 w-full min-w-0">
              {filtered.map(item => {
                const ingCount = item.ingredients?.length || 0;
                return (
                  <div key={item.id} className="card p-0 overflow-hidden flex flex-col min-w-0">
                    <div className="h-40 bg-bg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={32} /></div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1 min-w-0">
                      <div className="min-w-0">
                        <div className="font-bold text-base truncate">{item.productName || 'Unknown'}</div>
                        {item.note && <div className="text-xs text-muted mt-1 line-clamp-2">{item.note}</div>}
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-xs font-semibold text-muted uppercase mb-2">{ingCount} nguyên liệu</div>
                        <div className="flex flex-col gap-1.5 min-w-0">
                          {(item.ingredients || []).slice(0, 5).map((ing, i) => (
                            <div key={i} className="flex justify-between items-center gap-2 min-w-0 text-xs">
                              <span className="truncate text-main">{getIngredientName(ing.ingredientId || ing.id)}</span>
                              <span className="font-semibold text-primary flex-shrink-0">{ing.amount} {getIngredientUnit(ing.ingredientId || ing.id)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-auto pt-3 border-t flex-shrink-0">
                        <button className="p-1.5 text-muted hover-text-primary cursor-pointer" title="Xem"><Eye size={16} /></button>
                        <button className="p-1.5 text-muted hover-text-primary cursor-pointer" title="Chỉnh sửa" onClick={() => openEdit(item)}><Edit3 size={16} /></button>
                        <button className="p-1.5 text-muted hover-text-danger cursor-pointer" title="Xóa" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-muted py-12">{searchTerm ? 'Không tìm thấy công thức' : 'Chưa có công thức nào'}</div>
              )}
            </div>
          ) : (
            <ResponsiveTable>
              <thead>
                <tr>
                  <th className="w-16">Hình</th>
                  <th>Món</th>
                  <th className="hidden md:table-cell">Ghi chú</th>
                  <th>Nguyên liệu</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const ingCount = item.ingredients?.length || 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="w-10 h-10 rounded-md bg-bg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={16} /></div>
                          )}
                        </div>
                      </td>
                      <td className="font-semibold">{item.productName || 'Unknown'}</td>
                      <td className="hidden md:table-cell text-sm text-muted max-w-200px truncate">{item.note || '—'}</td>
                      <td>
                        <div className="text-xs text-muted mb-1">{ingCount} nguyên liệu</div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          {(item.ingredients || []).slice(0, 4).map((ing, i) => (
                            <div key={i} className="flex items-center gap-1 min-w-0 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                              <span className="truncate">{getIngredientName(ing.ingredientId || ing.id)}</span>
                              <span className="font-semibold text-primary flex-shrink-0">{ing.amount} {getIngredientUnit(ing.ingredientId || ing.id)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer" title="Xem"><Eye size={16} /></button>
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer" title="Chỉnh sửa" onClick={() => openEdit(item)}><Edit3 size={16} /></button>
                          <button className="p-1.5 text-muted hover-text-danger cursor-pointer" title="Xóa" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-8">{searchTerm ? 'Không tìm thấy công thức' : 'Chưa có công thức nào'}</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="card animate-fade-slide-in w-full max-w-520px max-h-90vh">
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate">{editItem ? 'Sửa công thức' : 'Thêm công thức'}</h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <select className="w-full modal-input" value={form.productId} onChange={handleChange('productId')}>
                <option value="">-- Chọn món --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="url" placeholder="URL hình ảnh (không bắt buộc)" className="w-full modal-input" value={form.image} onChange={handleChange('image')} />
              <textarea placeholder="Ghi chú / mô tả (không bắt buộc)" className="w-full" rows={2} value={form.note} onChange={handleChange('note')} />

              <div className="flex items-center justify-between gap-4 mt-2 min-w-0">
                <span className="text-sm font-semibold text-muted flex-shrink-0">Nguyên liệu</span>
                <button className="btn btn-outline text-xs flex items-center gap-1 flex-shrink-0 h-32px" onClick={addIngredientRow}>
                  <Plus size={14} /> Thêm NL
                </button>
              </div>

              <div className="flex flex-col gap-3 min-w-0 max-h-300px overflow-y-auto">
                {form.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-2 min-w-0">
                    <select className="flex-1 min-w-0 h-40px" value={ing.ingredientId} onChange={handleIngredientChange(idx, 'ingredientId')}>
                      <option value="">-- Chọn NL --</option>
                      {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                    </select>
                    <input type="number" placeholder="SL" className="w-20 h-40px" value={ing.amount} onChange={handleIngredientChange(idx, 'amount')} />
                    <button className="p-1.5 text-muted hover-text-danger cursor-pointer flex-shrink-0" onClick={() => removeIngredientRow(idx)}><X size={16} /></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>{editItem ? 'Cập nhật' : 'Thêm công thức'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
