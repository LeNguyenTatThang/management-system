import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIngredient } from '../../contexts/IngredientContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Info } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import { toast } from 'react-hot-toast';

export default function IngredientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getIngredientById, editIngredient, units, fetchUnits } = useIngredient();
  const { hasPermission } = useAuth();

  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unitId, setUnitId] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [isFreeIngredient, setIsFreeIngredient] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getIngredientById(id);
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setIngredient(data);
      setName(data.name || '');
      setDescription(data.description || '');
      setCategory(data.category || '');
      setUnitId(data.unitId ? String(data.unitId) : '');
      setStock(data.stock != null ? String(data.stock) : '');
      setMinStock(data.minStock != null ? String(data.minStock) : '');
      setCostPrice(data.costPrice != null ? String(data.costPrice) : '');
      setIsFreeIngredient(data.isFreeIngredient || false);
      setStatus(data.rawStatus || 'ACTIVE');
      setLoading(false);
    })();
  }, [id, getIngredientById]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên nguyên liệu không được để trống';
    if (!unitId) errs.unitId = 'Vui lòng chọn đơn vị tính';
    if (stock !== '' && (isNaN(Number(stock)) || Number(stock) < 0)) errs.stock = 'Tồn kho không được âm';
    if (minStock !== '' && (isNaN(Number(minStock)) || Number(minStock) < 0)) errs.minStock = 'Tồn kho tối thiểu không được âm';
    if (costPrice !== '' && (isNaN(Number(costPrice)) || Number(costPrice) < 0)) errs.costPrice = 'Giá vốn không được âm';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await editIngredient(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        unitId: Number(unitId),
        stock: stock === '' ? 0 : Number(stock),
        minStock: minStock ? Number(minStock) : undefined,
        costPrice: costPrice ? Number(costPrice) : undefined,
        isFreeIngredient,
        status,
      });
      toast.success('Cập nhật nguyên liệu thành công');
      navigate('/ingredients');
    } catch (e) {
      toast.error(e.message || 'Không thể cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Đang tải...</p>
        </div>
      </PageContainer>
    );
  }

  if (notFound) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-lg font-bold mb-2">Không tìm thấy nguyên liệu</h2>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/ingredients')}>Quay lại danh sách</button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/ingredients')}>QL Nguyên Vật Liệu</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/ingredients')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Chi tiết nguyên liệu</h1>
          <p className="text-muted text-sm mt-1">{ingredient?.name}</p>
        </div>

        {hasPermission('product.ingredient.update') ? (
          <form onSubmit={handleSave}>
            <FormSection icon={Info} title="THÔNG TIN NGUYÊN LIỆU" className="mb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Tên nguyên liệu <span className="text-danger">*</span></label>
                  <input type="text" placeholder="Nhập tên nguyên liệu" className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                    value={name} onChange={e => setName(e.target.value)} />
                  {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Đơn vị tính <span className="text-danger">*</span></label>
                  <select className={`w-full modal-input ${errors.unitId ? 'border-danger' : ''}`} value={unitId} onChange={e => setUnitId(e.target.value)}>
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ''}</option>)}
                  </select>
                  {errors.unitId && <p className="text-xs text-danger mt-1">{errors.unitId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Phân loại</label>
                  <input type="text" placeholder="VD: Cà phê, Sữa, Trà..." className="w-full modal-input"
                    value={category} onChange={e => setCategory(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Mô tả</label>
                  <textarea placeholder="Mô tả nguyên liệu" className="w-full modal-input" rows={2}
                    value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Tồn kho</label>
                  <input type="number" min="0" step="any" placeholder="0" className={`w-full modal-input ${errors.stock ? 'border-danger' : ''}`}
                    value={stock} onChange={e => setStock(e.target.value)} />
                  {errors.stock && <p className="text-xs text-danger mt-1">{errors.stock}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Tồn kho tối thiểu</label>
                  <input type="number" min="0" step="any" placeholder="0" className={`w-full modal-input ${errors.minStock ? 'border-danger' : ''}`}
                    value={minStock} onChange={e => setMinStock(e.target.value)} />
                  {errors.minStock && <p className="text-xs text-danger mt-1">{errors.minStock}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Giá vốn (VND)</label>
                  <input type="number" min="0" placeholder="0" className={`w-full modal-input ${errors.costPrice ? 'border-danger' : ''}`}
                    value={costPrice} onChange={e => setCostPrice(e.target.value)} />
                  {errors.costPrice && <p className="text-xs text-danger mt-1">{errors.costPrice}</p>}
                </div>
              </div>
            </FormSection>

            <FormSection icon={Info} title="TRẠNG THÁI" className="mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">Trạng thái</div>
                </div>
                <select className="w-40 modal-input" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="ACTIVE">Đang dùng</option>
                  <option value="INACTIVE">Ngừng dùng</option>
                </select>
              </div>
              <div className="border-t border-soft pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">Nguyên liệu tự do</div>
                    <div className="text-xs text-muted mt-0.5">Không ràng buộc theo công thức/định lượng cố định</div>
                  </div>
                  <label className="switch flex-shrink-0">
                    <input type="checkbox" checked={isFreeIngredient} onChange={e => setIsFreeIngredient(e.target.checked)} />
                    <span className="switch-slider" />
                  </label>
                </div>
              </div>
            </FormSection>

            <div className="flex items-center justify-end gap-3 mt-6 mb-8">
              <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/ingredients')}>Hủy</button>
              <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
                <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <span className="text-muted block mb-1">Tên nguyên liệu</span>
                <span className="font-bold text-base">{ingredient?.name}</span>
              </div>
              <div>
                <span className="text-muted block mb-1">Đơn vị</span>
                <span className="font-bold text-base">{ingredient?.unit?.name || '—'}</span>
              </div>
              {ingredient?.category && (
                <div>
                  <span className="text-muted block mb-1">Phân loại</span>
                  <span className="font-bold text-base">{ingredient.category}</span>
                </div>
              )}
              {ingredient?.description && (
                <div className="md:col-span-2">
                  <span className="text-muted block mb-1">Mô tả</span>
                  <span>{ingredient.description}</span>
                </div>
              )}
              <div>
                <span className="text-muted block mb-1">Tồn kho</span>
                <span className="font-bold text-base">{ingredient?.stock} {ingredient?.unit?.symbol || ''}</span>
              </div>
              {ingredient?.minStock != null && (
                <div>
                  <span className="text-muted block mb-1">Tồn kho tối thiểu</span>
                  <span className="font-bold text-base">{ingredient.minStock}</span>
                </div>
              )}
              {ingredient?.costPrice != null && (
                <div>
                  <span className="text-muted block mb-1">Giá vốn</span>
                  <span className="font-bold text-base">{Number(ingredient.costPrice).toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div>
                <span className="text-muted block mb-1">Trạng thái</span>
                <span className={`badge ${ingredient?.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {ingredient?.statusLabel}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
