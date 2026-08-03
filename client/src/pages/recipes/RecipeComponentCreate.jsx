import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipe } from '../../contexts/RecipeContext';
import { useMenuProduct } from '../../contexts/MenuProductContext';
import { useIngredient } from '../../contexts/IngredientContext';
import { ArrowLeft, Plus, Edit3, Trash2, Package } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

function IngredientModal({ ingredients, units, ingredient, onSave, onClose }) {
  const [form, setForm] = useState({
    ingredientId: ingredient?.ingredientId || '',
    quantity: ingredient?.quantity || '',
    unitId: ingredient?.unitId || '',
    note: ingredient?.note || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.ingredientId) errs.ingredientId = 'Chọn nguyên liệu';
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Định lượng phải lớn hơn 0';
    if (!form.unitId) errs.unitId = 'Chọn đơn vị';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const ing = ingredients.find(i => i.id === Number(form.ingredientId));
    const unit = units.find(u => u.id === Number(form.unitId));
    onSave({
      ingredientId: Number(form.ingredientId),
      ingredientName: ing?.name || '',
      quantity: Number(form.quantity),
      unitId: Number(form.unitId),
      unitName: unit?.name || '',
      unitSymbol: unit?.symbol || '',
      note: form.note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div className="card animate-fade-slide-in w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-lg truncate">{ingredient ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}</h3>
          <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={onClose}>×</button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nguyên liệu <span className="text-danger">*</span></label>
            <select className={`w-full modal-input ${errors.ingredientId ? 'border-danger' : ''}`}
              value={form.ingredientId} onChange={e => setForm(p => ({ ...p, ingredientId: e.target.value }))}>
              <option value="">Chọn nguyên liệu</option>
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            {errors.ingredientId && <p className="text-xs text-danger mt-1">{errors.ingredientId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Định lượng <span className="text-danger">*</span></label>
              <input type="number" min="0" step="any" placeholder="0"
                className={`w-full modal-input ${errors.quantity ? 'border-danger' : ''}`}
                value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
              {errors.quantity && <p className="text-xs text-danger mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Đơn vị <span className="text-danger">*</span></label>
              <select className={`w-full modal-input ${errors.unitId ? 'border-danger' : ''}`}
                value={form.unitId} onChange={e => setForm(p => ({ ...p, unitId: e.target.value }))}>
                <option value="">Chọn đơn vị</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.unitId && <p className="text-xs text-danger mt-1">{errors.unitId}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Ghi chú</label>
            <input type="text" placeholder="Ghi chú (không bắt buộc)" className="w-full modal-input"
              value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-2">
            <button className="btn flex-1 modal-btn" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipeComponentCreate() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getRecipeById, addRecipe, editRecipe } = useRecipe();
  const { products } = useMenuProduct();
  const { ingredients, units } = useIngredient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [productId, setProductId] = useState('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoadingRecipe(true);
      const data = await getRecipeById(id);
      if (!data) {
        toast.error('Không tìm thấy công thức');
        navigate('/recipes');
        return;
      }
      setName(data.name || '');
      setDescription(data.description || '');
      setInstructions(data.instructions || '');
      setProductId(data.productId ? String(data.productId) : '');
      setRecipeIngredients(data.ingredients || []);
      setLoadingRecipe(false);
    })();
  }, [id, isEdit, getRecipeById, navigate]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên công thức không được để trống';
    if (recipeIngredients.length === 0) errs.ingredients = 'Phải có ít nhất 1 nguyên liệu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        productId: productId ? Number(productId) : undefined,
        ingredients: recipeIngredients.map(ing => ({
          ingredientId: ing.ingredientId,
          quantity: Number(ing.quantity),
          unitId: ing.unitId,
          note: ing.note || undefined,
        })),
      };

      if (isEdit) {
        await editRecipe(id, payload);
        toast.success('Đã cập nhật công thức');
      } else {
        await addRecipe(payload);
        toast.success('Đã thêm công thức mới');
      }
      navigate('/recipes');
    } catch (e) {
      toast.error(e.message || 'Không thể lưu công thức');
    } finally {
      setSaving(false);
    }
  };

  const openAddIngredient = () => {
    setEditingIngredient(null);
    setShowIngredientModal(true);
  };

  const openEditIngredient = (ing, idx) => {
    setEditingIngredient({ ...ing, _idx: idx });
    setShowIngredientModal(true);
  };

  const handleIngredientSave = (ing) => {
    if (editingIngredient && editingIngredient._idx !== undefined) {
      setRecipeIngredients(prev => prev.map((item, i) => i === editingIngredient._idx ? ing : item));
    } else {
      setRecipeIngredients(prev => [...prev, ing]);
    }
    setShowIngredientModal(false);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (idx) => {
    if (!window.confirm('Xóa nguyên liệu này?')) return;
    setRecipeIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  if (loadingRecipe) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Đang tải...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/recipes')}>Công thức thành phần</button>
            <span>/</span>
            <span className="text-main font-semibold">{isEdit ? 'Chỉnh sửa' : 'Thêm'}</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/recipes')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Công thức thành phần nguyên liệu</h1>
          <p className="text-muted text-sm mt-1">{isEdit ? 'Chỉnh sửa công thức' : 'Tạo công thức mới với nguyên vật liệu'}</p>
        </div>

        <div className="card mb-5">
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Tên món/công thức <span className="text-danger">*</span></label>
              <input type="text" placeholder="Nhập tên món/công thức..."
                className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Món liên kết</label>
              <select className="w-full modal-input" value={productId} onChange={e => setProductId(e.target.value)}>
                <option value="">Không liên kết món</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Mô tả</label>
              <textarea placeholder="Nhập mô tả ngắn về món/công thức..."
                className="w-full modal-input" rows={3}
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Cách làm</label>
              <textarea placeholder="Nhập cách làm..."
                className="w-full modal-input" rows={8}
                value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex border-b border-soft mb-0">
            <button
              className={`px-5 py-3 text-sm font-semibold transition cursor-pointer border-b-2 -mb-px ${activeTab === 'ingredients' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-main'}`}
              onClick={() => setActiveTab('ingredients')}>
              Nguyên vật liệu
            </button>
            <button
              className={`px-5 py-3 text-sm font-semibold transition cursor-pointer border-b-2 -mb-px ${activeTab === 'details' ? 'text-primary border-primary' : 'text-muted border-transparent hover:text-main'}`}
              onClick={() => setActiveTab('details')}>
              Chi tiết món
            </button>
          </div>

          {activeTab === 'ingredients' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <button className="btn btn-outline text-sm flex items-center gap-1.5 h-40px"
                  onClick={openAddIngredient}>
                  <Plus size={16} /> Thêm nguyên vật liệu
                </button>
                {errors.ingredients && <p className="text-xs text-danger">{errors.ingredients}</p>}
              </div>

              {recipeIngredients.length === 0 ? (
                <div className="text-center text-muted py-8 text-sm bg-bg rounded-lg">
                  Chưa có nguyên vật liệu. Nhấn "Thêm nguyên vật liệu" để bắt đầu.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted border-b border-soft">
                        <th className="text-left font-semibold py-2 pr-3">Tên nguyên vật liệu</th>
                        <th className="text-right font-semibold py-2 px-3 whitespace-nowrap">Định lượng</th>
                        <th className="text-left font-semibold py-2 px-3">Đơn vị</th>
                        <th className="text-left font-semibold py-2 px-3 hidden md:table-cell">Ghi chú</th>
                        <th className="text-right font-semibold py-2 pl-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeIngredients.map((ing, idx) => (
                        <tr key={idx} className="border-b border-soft">
                          <td className="py-2 pr-3 break-words">{ing.ingredientName || ingredients.find(i => i.id === ing.ingredientId)?.name || ing.ingredientId}</td>
                          <td className="text-right py-2 px-3 font-semibold">{ing.quantity}</td>
                          <td className="py-2 px-3">{ing.unitSymbol || ing.unitName || units.find(u => u.id === ing.unitId)?.name || ''}</td>
                          <td className="py-2 px-3 text-muted hidden md:table-cell">{ing.note || '-'}</td>
                          <td className="text-right py-2 pl-3">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                                onClick={() => openEditIngredient(ing, idx)}><Edit3 size={15} /></button>
                              <button className="p-1.5 text-muted hover-text-danger cursor-pointer"
                                onClick={() => handleDeleteIngredient(idx)}><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-5">
              <div className="text-sm text-muted">
                <p>Thông tin chi tiết món được quản lý từ trang Món.</p>
                {productId && (
                  <button className="btn btn-outline text-sm mt-3" onClick={() => navigate(`/products/${productId}`)}>
                    Xem chi tiết món
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/recipes')}>Hủy</button>
          <button className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm công thức'}
          </button>
        </div>
      </div>

      {showIngredientModal && (
        <IngredientModal
          ingredients={ingredients}
          units={units}
          ingredient={editingIngredient}
          onSave={handleIngredientSave}
          onClose={() => { setShowIngredientModal(false); setEditingIngredient(null); }}
        />
      )}
    </PageContainer>
  );
}
