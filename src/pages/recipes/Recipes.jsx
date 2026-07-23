import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../../contexts/RecipeContext';
import { useMenuProduct } from '../../contexts/MenuProductContext';
import { useIngredient } from '../../contexts/IngredientContext';
import { Plus, Edit3, Trash2, Search, X, LayoutGrid, List as ListIcon, ChefHat, Package, UtensilsCrossed } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FormTextarea from '../../components/ui/FormTextarea';
import FilterPopover from '../../components/ui/FilterPopover';
import RecipeCard from '../../components/recipe/RecipeCard';

const CATEGORIES = ['Cà phê', 'Trà', 'Đá xay', 'Sinh tố', 'Bánh', 'Khác'];

export default function Recipes() {
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipe();
  const { products } = useMenuProduct();
  const { ingredients: allIngredients } = useIngredient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [detailItem, setDetailItem] = useState(null);
  const [form, setForm] = useState({ productId: '', image: '', note: '', instructions: [], ingredients: [] });

  const filtered = recipes.filter(r => {
    const matchSearch = r.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const product = products.find(p => p.id === r.productId);
    const matchCategory = !categoryFilter || product?.category === categoryFilter;
    const matchType = !typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleIngredientChange = (idx, key) => e => {
    const updated = [...form.ingredients];
    updated[idx] = { ...updated[idx], [key]: key === 'amount' ? Number(e.target.value) : e.target.value };
    setForm(p => ({ ...p, ingredients: updated }));
  };

  const addIngredientRow = () => {
    setForm(p => ({ ...p, ingredients: [...p.ingredients, { ingredientId: '', amount: '', note: '' }] }));
  };

  const removeIngredientRow = (idx) => {
    setForm(p => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }));
  };

  const handleInstructionChange = (idx, value) => {
    const updated = [...form.instructions];
    updated[idx] = value;
    setForm(p => ({ ...p, instructions: updated }));
  };

  const addInstructionRow = () => {
    setForm(p => ({ ...p, instructions: [...p.instructions, ''] }));
  };

  const removeInstructionRow = (idx) => {
    setForm(p => ({ ...p, instructions: p.instructions.filter((_, i) => i !== idx) }));
  };

  const openAdd = () => {
    navigate('/recipes/new');
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      productId: item.productId || '',
      image: item.image || '',
      note: item.note || '',
      instructions: item.instructions ? [...item.instructions] : [],
      ingredients: (item.ingredients || []).map(ing => ({
        ingredientId: ing.ingredientId || ing.id || '',
        amount: ing.amount || '',
        note: ing.note || ''
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
      instructions: form.instructions.filter(s => s.trim()),
      ingredients: form.ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        amount: Number(ing.amount),
        note: ing.note || ''
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

  const getIngredientName = (id) => allIngredients.find(i => i.id === id)?.name || id;
  const getIngredientUnit = (id) => allIngredients.find(i => i.id === id)?.unit || '';

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Công thức thành phần nguyên liệu</h2>
            <p className="text-muted text-sm">{recipes.length} công thức</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm công thức
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3">
          <FilterPopover
            filters={[
              {
                key: 'category',
                label: 'Loại',
                options: [
                  { value: '', label: 'Tất cả loại' },
                  ...CATEGORIES.map(c => ({ value: c, label: c })),
                ],
              },
              {
                key: 'type',
                label: 'Danh mục',
                options: [
                  { value: '', label: 'Tất cả danh mục' },
                  ...CATEGORIES.map(c => ({ value: c, label: c })),
                ],
              },
            ]}
            activeFilters={{ category: categoryFilter, type: typeFilter }}
            onFilterChange={(key, value) => {
              if (key === 'category') setCategoryFilter(value);
              if (key === 'type') setTypeFilter(value);
            }}
            onClearAll={() => { setCategoryFilter(''); setTypeFilter(''); }}
          />
          <div className="relative flex-1 min-w-0">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm theo tên..." className="w-full pl-10 h-36px"
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
            {filtered.map(item => {
              const product = products.find(p => p.id === item.productId);
              return (
                <RecipeCard
                  key={item.id}
                  item={item}
                  product={product}
                  onClick={() => setDetailItem(item)}
                  onEdit={() => openEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted py-12">{searchTerm || categoryFilter ? 'Không tìm thấy công thức' : 'Chưa có công thức nào'}</div>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden min-w-0">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th className="w-12 text-center">STT</th>
                  <th>Tên món</th>
                  <th className="hidden md:table-cell">Loại</th>
                  <th className="hidden md:table-cell">Số NL</th>
                  <th>Giá bán</th>
                  <th>Giá vốn</th>
                  <th>Margin</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  const ingCount = item.ingredients?.length || 0;
                  return (
                    <tr key={item.id} className="cursor-pointer transition hover-bg-primary-light" onClick={() => setDetailItem(item)}>
                      <td className="text-center text-muted text-sm">{idx + 1}</td>
                      <td className="font-semibold">{item.productName}</td>
                      <td className="hidden md:table-cell text-sm text-muted">{product?.category || '-'}</td>
                      <td className="hidden md:table-cell text-sm">{ingCount}</td>
                      <td className="font-bold">{product?.price?.toLocaleString('vi-VN') + 'đ' || '-'}</td>
                      <td className="text-sm">{product?.cost?.toLocaleString('vi-VN') + 'đ' || '-'}</td>
                      <td><span className="badge badge-neutral">{product?.fc || '-'}</span></td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={e => { e.stopPropagation(); openEdit(item); }}><Edit3 size={16} /></button>
                          <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={e => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-muted py-8">Không tìm thấy công thức</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="card animate-fade-slide-in w-full max-w-560px max-h-90vh overflow-y-auto">
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
              <FormTextarea placeholder="Ghi chú / mô tả (không bắt buộc)" rows={2} value={form.note} onChange={handleChange('note')} />

              <div className="flex items-center justify-between gap-4 mt-2 min-w-0">
                <span className="text-sm font-semibold text-muted flex-shrink-0">Cách làm</span>
                <button className="btn btn-outline text-xs flex items-center gap-1 flex-shrink-0 h-32px" onClick={addInstructionRow}>
                  <Plus size={14} /> Thêm bước
                </button>
              </div>
              <div className="flex flex-col gap-2 min-w-0 max-h-300px overflow-y-auto">
                {form.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted font-semibold flex-shrink-0 w-5">#{idx + 1}</span>
                    <input type="text" placeholder={`Bước ${idx + 1}`} className="flex-1 h-36px text-sm"
                      value={step} onChange={e => handleInstructionChange(idx, e.target.value)} />
                    <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0" onClick={() => removeInstructionRow(idx)}><X size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 mt-2 min-w-0">
                <span className="text-sm font-semibold text-muted flex-shrink-0">Nguyên liệu</span>
                <button className="btn btn-outline text-xs flex items-center gap-1 flex-shrink-0 h-32px" onClick={addIngredientRow}>
                  <Plus size={14} /> Thêm NL
                </button>
              </div>
              <div className="flex flex-col gap-3 min-w-0 max-h-300px overflow-y-auto">
                {form.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                    <select className="flex-1 min-w-0 h-40px" value={ing.ingredientId} onChange={handleIngredientChange(idx, 'ingredientId')}>
                      <option value="">-- Chọn NL --</option>
                      {allIngredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                    </select>
                    <input type="number" placeholder="SL" className="w-full sm:w-20 h-40px" value={ing.amount} onChange={handleIngredientChange(idx, 'amount')} />
                    <input type="text" placeholder="Ghi chú" className="w-full sm:w-28 h-40px text-sm" value={ing.note} onChange={handleIngredientChange(idx, 'note')} />
                    <button className="p-1.5 text-muted hover-text-danger cursor-pointer flex-shrink-0 self-end sm:self-auto" onClick={() => removeIngredientRow(idx)}><X size={16} /></button>
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

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={() => setDetailItem(null)}>
          <div className="card animate-fade-slide-in w-full max-w-4xl max-h-90vh overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-4 mb-6">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-24 h-24 rounded-xl bg-bg overflow-hidden flex-shrink-0">
                  {detailItem.image ? (
                    <img src={detailItem.image} alt={detailItem.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><UtensilsCrossed size={36} /></div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold break-words">{detailItem.productName}</h2>
                  {(() => {
                    const p = products.find(x => x.id === detailItem.productId);
                    return p ? (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="badge badge-neutral">{p.category}</span>
                        {p.size && <span className="badge badge-neutral">{p.size}</span>}
                      </div>
                    ) : null;
                  })()}
                  {detailItem.note && <p className="text-sm text-muted mt-2">{detailItem.note}</p>}
                </div>
              </div>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-28px leading-none" onClick={() => setDetailItem(null)}>×</button>
            </div>

            {(() => {
              const p = products.find(x => x.id === detailItem.productId);
              if (!p) return null;
              return (
                <div className="flex flex-wrap gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-muted">Giá bán</div>
                    <div className="text-lg font-bold text-primary">{p.price?.toLocaleString('vi-VN')}đ</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Giá vốn</div>
                    <div className="text-lg font-semibold">{p.cost?.toLocaleString('vi-VN')}đ</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Margin</div>
                    <div className="text-lg font-bold">{p.fc || '-'}</div>
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div>
                      <div className="text-xs text-muted">Tags</div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {p.tags.map((t, i) => (
                          <span key={i} className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mx-3 my-3 px-4 py-3 bg-rose-50 rounded-xl border border-soft">
                <div className="flex items-center gap-1.5 text-sm font-bold uppercase text-primary mb-3">
                    <ChefHat size={16} />
                    Cách làm
                </div>

                {detailItem.instructions && detailItem.instructions.length > 0 ? (
                    <ol className="list-decimal pl-5 text-sm text-main space-y-1.5">
                        {detailItem.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ol>
                ) : (
                    <p className="text-sm text-muted italic">
                        Chưa có hướng dẫn.
                    </p>
                )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-bold uppercase text-primary mb-3">
                <Package size={16} /> Nguyên liệu
              </div>
              {detailItem.ingredients && detailItem.ingredients.length > 0 ? (
                <div className="w-full min-w-0">
                  <table style={{ minWidth: 0 }} className="w-full text-sm">
                    <thead>
                      <tr className="text-muted border-b border-soft">
                        <th className="text-left font-semibold py-2 pr-3">NVL</th>
                        <th className="text-right font-semibold py-2 px-3 whitespace-nowrap">Lượng</th>
                        <th className="text-left font-semibold py-2 px-3">ĐV</th>
                        <th className="text-left font-semibold py-2 pl-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailItem.ingredients.map((ing, i) => (
                        <tr key={i} className="border-b border-soft">
                          <td className="py-2 pr-3 break-words">{getIngredientName(ing.ingredientId || ing.id)}</td>
                          <td className="text-right py-2 px-3 font-semibold whitespace-nowrap">{ing.amount}</td>
                          <td className="py-2 px-3">{getIngredientUnit(ing.ingredientId || ing.id)}</td>
                          <td className="py-2 pl-3 text-muted break-words">{ing.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted italic">Chưa có nguyên liệu.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-soft">
              <button className="btn btn-outline modal-btn px-6" onClick={() => setDetailItem(null)}>Đóng</button>
              <button className="btn btn-primary modal-btn px-6 flex items-center gap-2" onClick={() => { const item = detailItem; setDetailItem(null); openEdit(item); }}>
                <Edit3 size={16} /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
