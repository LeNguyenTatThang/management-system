import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuProduct } from '../../contexts/MenuProductContext';
import { useRecipe } from '../../contexts/RecipeContext';
import { useIngredient } from '../../contexts/IngredientContext';
import { ArrowLeft, Plus, Edit3, Trash2, ChefHat, DollarSign, Package, Info } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import FormTextarea from '../../components/ui/FormTextarea';
import RichTextEditor from '../../components/recipe/RichTextEditor';
import IngredientModal from '../../components/recipe/IngredientModal';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Cà phê', 'Trà', 'Đá xay', 'Sinh tố', 'Bánh', 'Khác'];

export default function ProductCreate() {
  const navigate = useNavigate();
  const { addProduct } = useMenuProduct();
  const { addRecipe } = useRecipe();
  const { ingredients } = useIngredient();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('Đang sử dụng');
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const displayPrice = price ? Number(price).toLocaleString('vi-VN') + 'đ' : '';
  const displayCost = cost ? Number(cost).toLocaleString('vi-VN') + 'đ' : '';
  const profit = price && cost ? Number(price) - Number(cost) : 0;
  const margin = price && Number(price) > 0 ? ((profit / Number(price)) * 100).toFixed(1) : 0;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên món không được để trống';
    if (!category) errs.category = 'Vui lòng chọn danh mục';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Giá bán phải lớn hơn 0';
    if (!cost || isNaN(Number(cost)) || Number(cost) <= 0) errs.cost = 'Giá vốn phải lớn hơn 0';
    if (!instructions.trim()) errs.instructions = 'Vui lòng nhập cách làm';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const prod = {
        name: name.trim(),
        category,
        price: Number(price),
        cost: Number(cost),
        profit: Number(price) - Number(cost),
        image: '',
        description: description.trim(),
        status,
        tags: [],
        size: '',
        fc: margin + '%'
      };
      const created = await addProduct(prod);
      await addRecipe({
        productId: created.id,
        productName: name.trim(),
        image: '',
        note: description.trim(),
        instructions: instructions ? [instructions] : [],
        ingredients: recipeIngredients.map(ing => ({
          ingredientId: ing.ingredientId,
          amount: Number(ing.amount),
          note: ''
        }))
      });
      toast.success('Thêm công thức món thành công');
      navigate('/products');
    } finally {
      setSaving(false);
    }
  };

  const openAddIngredient = () => {
    setEditingIngredient(null);
    setShowIngredientModal(true);
  };

  const openEditIngredient = (ing) => {
    setEditingIngredient(ing);
    setShowIngredientModal(true);
  };

  const handleIngredientSave = (ing) => {
    if (editingIngredient) {
      setRecipeIngredients(prev => prev.map((item, i) =>
        i === recipeIngredients.indexOf(editingIngredient) ? ing : item
      ));
    } else {
      setRecipeIngredients(prev => [...prev, ing]);
    }
    setShowIngredientModal(false);
    setEditingIngredient(null);
  };

  const handleRemoveIngredient = (idx) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const getIngredientName = (id) => ingredients.find(i => i.id === id)?.name || id;
  const getIngredientUnit = (id) => ingredients.find(i => i.id === id)?.unit || '';

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/products')}>Danh mục món</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/products')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm công thức món</h1>
          <p className="text-muted text-sm mt-1">Tạo công thức và thông tin món mới</p>
        </div>

        <FormSection icon={Info} title="THÔNG TIN CƠ BẢN" className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Tên món <span className="text-danger">*</span></label>
              <input type="text" placeholder="Nhập tên món..."
                className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Danh mục <span className="text-danger">*</span></label>
              <select className={`w-full modal-input ${errors.category ? 'border-danger' : ''}`}
                value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Giá bán <span className="text-danger">*</span></label>
              <input type="text" placeholder="25.000"
                className={`w-full modal-input ${errors.price ? 'border-danger' : ''}`}
                value={price} onChange={e => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setPrice(val);
                }} />
              {errors.price && <p className="text-xs text-danger mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Giá vốn <span className="text-danger">*</span></label>
              <input type="text" placeholder="7.640"
                className={`w-full modal-input ${errors.cost ? 'border-danger' : ''}`}
                value={cost} onChange={e => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setCost(val);
                }} />
              {errors.cost && <p className="text-xs text-danger mt-1">{errors.cost}</p>}
            </div>
          </div>
          <FormTextarea label="Mô tả ngắn" placeholder="Nhập mô tả ngắn về món..."
            value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          {price && cost && Number(price) > 0 && (
            <div className="p-4 bg-bg rounded-lg text-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted">Giá bán: </span><span className="font-semibold">{displayPrice}</span></div>
              <div><span className="text-muted">Giá vốn: </span><span className="font-semibold">{displayCost}</span></div>
              <div><span className="text-muted">Lợi nhuận: </span><span className="font-semibold text-success">{profit.toLocaleString('vi-VN')}đ</span></div>
              <div><span className="text-muted">Biên lợi nhuận: </span><span className="font-semibold text-primary">{margin}%</span></div>
            </div>
          )}
        </FormSection>

        <FormSection icon={ChefHat} title="CÁCH LÀM" subtitle="Nhập hướng dẫn chi tiết cách làm món" className="mb-5">
          <RichTextEditor
            value={instructions}
            onChange={setInstructions}
            placeholder="Nhập cách làm..."
            error={errors.instructions}
          />
        </FormSection>

        <FormSection icon={Package} title="NGUYÊN LIỆU" subtitle="Danh sách nguyên liệu cần cho món" className="mb-5">
          {recipeIngredients.length === 0 ? (
            <div className="text-center text-muted py-8 text-sm bg-bg rounded-lg">
              Chưa có nguyên liệu. Nhấn "Thêm nguyên liệu" để bắt đầu.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="w-12 text-center">STT</th>
                    <th>Tên NVL</th>
                    <th className="text-right">Định lượng</th>
                    <th>Đơn vị</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {recipeIngredients.map((ing, idx) => (
                    <tr key={idx}>
                      <td className="text-center text-muted text-sm">{idx + 1}</td>
                      <td className="font-semibold">{getIngredientName(ing.ingredientId)}</td>
                      <td className="text-right font-semibold">{ing.amount}</td>
                      <td>{getIngredientUnit(ing.ingredientId)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                            onClick={() => openEditIngredient(ing)}><Edit3 size={15} /></button>
                          <button className="p-1.5 text-muted hover-text-danger cursor-pointer"
                            onClick={() => handleRemoveIngredient(idx)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button className="btn btn-outline text-sm self-start flex items-center gap-1.5 h-40px"
            onClick={openAddIngredient}>
            <Plus size={16} /> Thêm nguyên liệu
          </button>
        </FormSection>

        <FormSection icon={DollarSign} title="TRẠNG THÁI" className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Đang sử dụng</div>
              <div className="text-xs text-muted mt-0.5">Cho phép món được bán trên hệ thống</div>
            </div>
            <label className="switch flex-shrink-0">
              <input type="checkbox" checked={status === 'Đang sử dụng'}
                onChange={e => setStatus(e.target.checked ? 'Đang sử dụng' : 'Đã tắt')} />
              <span className="switch-slider" />
            </label>
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/products')}>Hủy</button>
          <button className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Thêm công thức'}
          </button>
        </div>
      </div>

      {showIngredientModal && (
        <IngredientModal
          ingredient={editingIngredient}
          onSave={handleIngredientSave}
          onClose={() => { setShowIngredientModal(false); setEditingIngredient(null); }}
        />
      )}
    </PageContainer>
  );
}
