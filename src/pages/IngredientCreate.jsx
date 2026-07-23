import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIngredient } from '../contexts/IngredientContext';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Cà phê', 'Sữa', 'Trà', 'Trái cây', 'Syrup', 'Đường', 'Topping', 'Khác'];
const UNITS = ['Kg', 'Gr', 'Lít', 'ml', 'Cái', 'Hộp', 'Bịch', 'Chai', 'Gói'];

export default function IngredientCreate() {
  const { addIngredient } = useIngredient();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [stock, setStock] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên nguyên liệu không được để trống';
    if (!category) errs.category = 'Vui lòng chọn phân loại';
    if (!unit) errs.unit = 'Vui lòng chọn đơn vị tính';
    if (stock !== '' && (isNaN(Number(stock)) || Number(stock) < 0)) errs.stock = 'Tồn kho không được âm';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await addIngredient({
      name: name.trim(),
      category,
      unit,
      stock: stock === '' ? 0 : Number(stock),
      active
    });
    toast.success('Thêm nguyên liệu thành công');
    navigate('/ingredients');
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <button className="flex items-center gap-2 text-muted hover-text-primary mb-6 cursor-pointer" onClick={() => navigate('/ingredients')}>
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>

        <div className="card">
          <h2 className="text-xl font-bold mb-6">Thêm nguyên liệu</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1">Tên nguyên liệu <span className="text-danger">*</span></label>
              <input type="text" placeholder="Nhập tên nguyên liệu" className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Phân loại <span className="text-danger">*</span></label>
              <select className={`w-full modal-input ${errors.category ? 'border-danger' : ''}`} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">-- Chọn phân loại --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Đơn vị tính <span className="text-danger">*</span></label>
              <select className={`w-full sm:w-40 modal-input ${errors.unit ? 'border-danger' : ''}`} value={unit} onChange={e => setUnit(e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <p className="text-xs text-danger mt-1">{errors.unit}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Tồn kho ban đầu</label>
              <input type="number" min="0" placeholder="0" className={`w-full sm:w-48 modal-input ${errors.stock ? 'border-danger' : ''}`}
                value={stock} onChange={e => setStock(e.target.value)} />
              {errors.stock && <p className="text-xs text-danger mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Trạng thái</label>
              <div className="flex items-center gap-3">
                <label className="switch">
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                  <span className="switch-slider"></span>
                </label>
                <span className={`text-sm font-semibold ${active ? 'text-success' : 'text-muted'}`}>
                  {active ? 'Đang sử dụng' : 'Đã tắt'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" className="btn btn-outline flex-1 modal-btn" onClick={() => navigate('/ingredients')}>Hủy</button>
              <button type="submit" className="btn btn-primary flex-1 modal-btn">Thêm nguyên liệu</button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
