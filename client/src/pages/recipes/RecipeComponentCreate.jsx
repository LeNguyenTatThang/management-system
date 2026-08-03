import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../../contexts/RecipeContext';
import { useMenuProduct } from '../../contexts/MenuProductContext';
import { useIngredient } from '../../contexts/IngredientContext';
import { ArrowLeft, Plus, Edit3, Trash2, Package, DollarSign } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import RichTextEditor from '../../components/recipe/RichTextEditor';
import IngredientModal from '../../components/recipe/IngredientModal';
import MultiSelect from '../../components/ui/MultiSelect';
import { toast } from 'react-hot-toast';

const setupOptions = [
  { value: 'Ly nhỏ', label: 'Ly nhỏ' },
  { value: 'Ly lớn', label: 'Ly lớn' },
  { value: 'Ống hút ngắn', label: 'Ống hút ngắn' },
  { value: 'Ống hút dài', label: 'Ống hút dài' },
  { value: 'Thìa ngắn', label: 'Thìa ngắn' },
  { value: 'Thìa dài', label: 'Thìa dài' },
  { value: 'Khay', label: 'Khay' },
  { value: 'Đá viên', label: 'Đá viên' },
  { value: 'Trân châu', label: 'Trân châu' },
];

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay p-4" onClick={onCancel}>
      <div className="card animate-fade-slide-in w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <button className="btn flex-1 modal-btn" onClick={onCancel}>Hủy</button>
          <button className="btn btn-danger flex-1 modal-btn" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailModal({ detail, onSave, onClose }) {
  const isEditing = !!detail;
  const [price, setPrice] = useState(detail?.price || '');
  const [cost, setCost] = useState(detail?.cost || '');
  const [setups, setSetups] = useState(detail?.setups || []);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Giá bán phải lớn hơn 0';
    if (!cost || isNaN(Number(cost)) || Number(cost) <= 0) errs.cost = 'Giá vốn phải lớn hơn 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ price: Number(price), cost: Number(cost), setups });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div className="card animate-fade-slide-in w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-lg truncate">{isEditing ? 'Sửa chi tiết món' : 'Thêm chi tiết món'}</h3>
          <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={onClose}>×</button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Giá bán <span className="text-danger">*</span></label>
            <input type="number" min="0" placeholder="Nhập giá bán..."
              className={`w-full modal-input ${errors.price ? 'border-danger' : ''}`}
              value={price} onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: '' })); }} />
            {errors.price && <p className="text-xs text-danger mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Giá vốn <span className="text-danger">*</span></label>
            <input type="number" min="0" placeholder="Nhập giá vốn..."
              className={`w-full modal-input ${errors.cost ? 'border-danger' : ''}`}
              value={cost} onChange={e => { setCost(e.target.value); setErrors(p => ({ ...p, cost: '' })); }} />
            {errors.cost && <p className="text-xs text-danger mt-1">{errors.cost}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Setup</label>
            <MultiSelect
              options={setupOptions}
              value={setups}
              onChange={setSetups}
              placeholder="Chọn setup..."
              searchPlaceholder="Tìm setup..."
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button className="btn flex-1 modal-btn" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>
              {isEditing ? 'Lưu thay đổi' : 'Thêm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipeComponentCreate() {
  const navigate = useNavigate();
  const { addRecipe } = useRecipe();
  const { products, addProduct, updateProduct } = useMenuProduct();
  const { ingredients } = useIngredient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [editingProductDetail, setEditingProductDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const getIngredientName = (id) => ingredients.find(i => i.id === id)?.name || id;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên món/công thức không được để trống';
    if (!instructions.trim()) errs.instructions = 'Vui lòng nhập cách làm';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const newProduct = await addProduct({
        name: name.trim(),
        category: '',
        price: productDetails.length > 0 ? productDetails[0].price : 0,
        cost: productDetails.length > 0 ? productDetails[0].cost : 0,
        profit: productDetails.length > 0 ? productDetails[0].price - productDetails[0].cost : 0,
        image: '',
        description: description.trim(),
        status: 'Đang bán',
        tags: productDetails.length > 0 ? productDetails[0].setups : [],
        size: '',
        fc: productDetails.length > 0 && productDetails[0].price > 0
          ? ((productDetails[0].price - productDetails[0].cost) / productDetails[0].price * 100).toFixed(1) + '%'
          : '',
      });

      await addRecipe({
        productId: newProduct.id,
        productName: name.trim(),
        image: '',
        note: description.trim(),
        instructions: instructions ? [instructions] : [],
        ingredients: recipeIngredients.map(ing => ({
          ingredientId: ing.ingredientId,
          amount: Number(ing.amount),
          note: ''
        })),
        price: productDetails.length > 0 ? productDetails[0].price : 0,
        cost: productDetails.length > 0 ? productDetails[0].cost : 0,
        setups: productDetails.length > 0 ? productDetails[0].setups : [],
      });

      toast.success('Thêm công thức thành phần nguyên liệu thành công');
      navigate('/recipes');
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
      setRecipeIngredients(prev => prev.map(item =>
        item === editingIngredient ? ing : item
      ));
    } else {
      setRecipeIngredients(prev => [...prev, ing]);
    }
    setShowIngredientModal(false);
    setEditingIngredient(null);
  };

  const requestDeleteIngredient = (idx) => {
    setConfirmDelete({ type: 'ingredient', index: idx });
  };

  const openAddProductDetail = () => {
    setEditingProductDetail(null);
    setShowProductDetailModal(true);
  };

  const openEditProductDetail = (det) => {
    setEditingProductDetail(det);
    setShowProductDetailModal(true);
  };

  const handleProductDetailSave = (det) => {
    if (editingProductDetail) {
      setProductDetails(prev => prev.map(item =>
        item === editingProductDetail ? det : item
      ));
    } else {
      setProductDetails(prev => [...prev, det]);
    }
    setShowProductDetailModal(false);
    setEditingProductDetail(null);
  };

  const requestDeleteProductDetail = (idx) => {
    setConfirmDelete({ type: 'productDetail', index: idx });
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'ingredient') {
      setRecipeIngredients(prev => prev.filter((_, i) => i !== confirmDelete.index));
    } else if (confirmDelete.type === 'productDetail') {
      setProductDetails(prev => prev.filter((_, i) => i !== confirmDelete.index));
    }
    setConfirmDelete(null);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/recipes')}>Công thức thành phần</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Thêm</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/recipes')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Công thức thành phần nguyên liệu</h1>
          <p className="text-muted text-sm mt-1">Tạo công thức mới với nguyên vật liệu và thông tin chi tiết món</p>
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
              <label className="block text-sm font-semibold mb-1.5">Mô tả</label>
              <textarea placeholder="Nhập mô tả ngắn về món/công thức..."
                className="w-full modal-input" rows={3}
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <RichTextEditor
                value={instructions}
                onChange={v => { setInstructions(v); setErrors(p => ({ ...p, instructions: '' })); }}
                placeholder="Nhập cách làm..."
                label="Cách làm"
                error={errors.instructions}
                minHeight="200px"
              />
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
              <button className="btn btn-outline text-sm flex items-center gap-1.5 h-40px mb-4"
                onClick={openAddIngredient}>
                <Plus size={16} /> Thêm nguyên vật liệu
              </button>

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
                        <th className="text-right font-semibold py-2 pl-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeIngredients.map((ing, idx) => (
                        <tr key={idx} className="border-b border-soft">
                          <td className="py-2 pr-3 break-words">{getIngredientName(ing.ingredientId)}</td>
                          <td className="text-right py-2 px-3 font-semibold">{ing.amount}</td>
                          <td className="py-2 px-3">{ing.unit || ingredients.find(i => i.id === ing.ingredientId)?.unit || ''}</td>
                          <td className="text-right py-2 pl-3">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                                onClick={() => openEditIngredient(ing)}><Edit3 size={15} /></button>
                              <button className="p-1.5 text-muted hover-text-danger cursor-pointer"
                                onClick={() => requestDeleteIngredient(idx)}><Trash2 size={15} /></button>
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
              <button className="btn btn-outline text-sm flex items-center gap-1.5 h-40px mb-4"
                onClick={openAddProductDetail}>
                <Plus size={16} /> Thêm chi tiết món
              </button>

              {productDetails.length === 0 ? (
                <div className="text-center text-muted py-8 text-sm bg-bg rounded-lg">
                  Chưa có chi tiết món. Nhấn "Thêm chi tiết món" để bắt đầu.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted border-b border-soft">
                        <th className="text-left font-semibold py-2 pr-3">Giá bán</th>
                        <th className="text-left font-semibold py-2 px-3">Giá vốn</th>
                        <th className="text-left font-semibold py-2 px-3">Setup</th>
                        <th className="text-right font-semibold py-2 pl-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productDetails.map((det, idx) => (
                        <tr key={idx} className="border-b border-soft">
                          <td className="py-2 pr-3 font-semibold">{det.price.toLocaleString('vi-VN')}đ</td>
                          <td className="py-2 px-3">{det.cost.toLocaleString('vi-VN')}đ</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              {det.setups && det.setups.length > 0 ? det.setups.map((s, si) => (
                                <span key={si} className="text-xs bg-gray-100 text-muted px-2 py-0.5 rounded-full">{s}</span>
                              )) : <span className="text-muted">—</span>}
                            </div>
                          </td>
                          <td className="text-right py-2 pl-3">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                                onClick={() => openEditProductDetail(det)}><Edit3 size={15} /></button>
                              <button className="p-1.5 text-muted hover-text-danger cursor-pointer"
                                onClick={() => requestDeleteProductDetail(idx)}><Trash2 size={15} /></button>
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
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/recipes')}>Hủy</button>
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

      {showProductDetailModal && (
        <ProductDetailModal
          detail={editingProductDetail}
          onSave={handleProductDetailSave}
          onClose={() => { setShowProductDetailModal(false); setEditingProductDetail(null); }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete.type === 'ingredient' ? 'Xóa nguyên vật liệu?' : 'Xóa chi tiết món?'}
          message={confirmDelete.type === 'ingredient'
            ? 'Bạn có chắc muốn xóa nguyên vật liệu này khỏi công thức?'
            : 'Bạn có chắc muốn xóa chi tiết món này?'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </PageContainer>
  );
}