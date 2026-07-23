import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIngredient } from '../../contexts/IngredientContext';
import { ArrowLeft, Package, Info, ToggleLeft } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Cà phê', 'Sữa', 'Trà', 'Đường', 'Trái cây', 'Syrup', 'Topping', 'Khác'];
const UNITS = ['Kg', 'Gram', 'Lít', 'Ml', 'Hộp', 'Chai', 'Gói', 'Cái'];

export default function IngredientCreate() {
  const { addIngredient } = useIngredient();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [stock, setStock] = useState('');
  const [averageImportPrice, setAverageImportPrice] = useState('');
  const [active, setActive] = useState(true);
  const [isFreeIngredient, setIsFreeIngredient] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên nguyên liệu không được để trống';
    if (!category) errs.category = 'Vui lòng chọn loại nguyên liệu';
    if (!unit) errs.unit = 'Vui lòng chọn đơn vị tính';
    if (stock !== '' && (isNaN(Number(stock)) || Number(stock) < 0)) errs.stock = 'Tồn kho không được âm';
    if (averageImportPrice !== '' && (isNaN(Number(averageImportPrice)) || Number(averageImportPrice) < 0)) errs.averageImportPrice = 'Giá nhập không được âm';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await addIngredient({
        name: name.trim(),
        category,
        unit,
        stock: stock === '' ? 0 : Number(stock),
        averageImportPrice: averageImportPrice === '' ? 0 : Number(averageImportPrice),
        active,
        isFreeIngredient
      });
      toast.success('Thêm nguyên vật liệu thành công');
      navigate('/ingredients');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/ingredients')}>QL Nguyên Vật Liệu</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/ingredients')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm nguyên vật liệu</h1>
          <p className="text-muted text-sm mt-1">Tạo mới và thiết lập thông tin nguyên vật liệu</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Info} title="THÔNG TIN NGUYÊN LIỆU" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1.5">Tên nguyên liệu <span className="text-danger">*</span></label>
                <input type="text" placeholder="Nhập tên nguyên liệu..." className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Loại nguyên liệu <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.category ? 'border-danger' : ''}`} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">-- Chọn loại --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Đơn vị tính <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.unit ? 'border-danger' : ''}`} value={unit} onChange={e => setUnit(e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {errors.unit && <p className="text-xs text-danger mt-1">{errors.unit}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Tồn kho ban đầu</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" placeholder="0" className={`w-full modal-input ${errors.stock ? 'border-danger' : ''}`}
                    value={stock} onChange={e => setStock(e.target.value)} />
                  <span className="text-sm font-semibold text-muted min-w-10">{unit}</span>
                </div>
                {errors.stock && <p className="text-xs text-danger mt-1">{errors.stock}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giá nhập trung bình</label>
                <input type="number" min="0" placeholder="Nhập giá nhập..." className={`w-full modal-input ${errors.averageImportPrice ? 'border-danger' : ''}`}
                  value={averageImportPrice} onChange={e => setAverageImportPrice(e.target.value)} />
                {errors.averageImportPrice && <p className="text-xs text-danger mt-1">{errors.averageImportPrice}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection icon={ToggleLeft} title="TRẠNG THÁI" className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Đang sử dụng</div>
                <div className="text-xs text-muted mt-0.5">Cho phép sử dụng nguyên liệu</div>
              </div>
              <label className="switch flex-shrink-0">
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                <span className="switch-slider" />
              </label>
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
              {saving ? 'Đang lưu...' : 'Thêm nguyên vật liệu'}
            </button>
          </div>
        </form>

        <div className="card">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base">LỊCH SỬ NHẬP NGUYÊN VẬT LIỆU TRONG THÁNG</h3>
            </div>
          </div>
          <div className="text-center text-muted py-8 bg-bg rounded-lg">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có lịch sử nhập nguyên vật liệu trong tháng này.</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
