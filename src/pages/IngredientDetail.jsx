import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIngredient } from '../contexts/IngredientContext';
import { ArrowLeft, Save } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['Cà phê', 'Sữa', 'Trà', 'Trái cây', 'Syrup', 'Đường', 'Topping', 'Khác'];
const UNITS = ['Kg', 'Gr', 'Lít', 'ml', 'Cái', 'Hộp', 'Bịch', 'Chai', 'Gói'];

export default function IngredientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ingredients, updateIngredient, stockExports } = useIngredient();

  const ingredient = ingredients.find(i => i.id === id);

  const [name, setName] = useState(ingredient?.name || '');
  const [category, setCategory] = useState(ingredient?.category || '');
  const [unit, setUnit] = useState(ingredient?.unit || 'Kg');
  const [active, setActive] = useState(ingredient?.active ?? true);
  const [errors, setErrors] = useState({});

  const exports = useMemo(() => {
    return stockExports.filter(e => e.ingredientId === id);
  }, [stockExports, id]);

  if (!ingredient) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-lg font-bold mb-2">Không tìm thấy nguyên liệu</h2>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/ingredients')}>Quay lại danh sách</button>
        </div>
      </PageContainer>
    );
  }

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên nguyên liệu không được để trống';
    if (!category) errs.category = 'Vui lòng chọn phân loại';
    if (!unit) errs.unit = 'Vui lòng chọn đơn vị tính';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await updateIngredient(id, { name: name.trim(), category, unit, active });
    toast.success('Cập nhật nguyên liệu thành công');
    navigate('/ingredients');
  };

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <button className="flex items-center gap-2 text-muted hover-text-primary mb-6 cursor-pointer" onClick={() => navigate('/ingredients')}>
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-6">Chi tiết nguyên liệu</h2>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1">Tên nguyên liệu <span className="text-danger">*</span></label>
              <input type="text" placeholder="Nhập tên nguyên liệu" className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1">Phân loại <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.category ? 'border-danger' : ''}`} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">-- Chọn phân loại --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1">Đơn vị tính <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.unit ? 'border-danger' : ''}`} value={unit} onChange={e => setUnit(e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {errors.unit && <p className="text-xs text-danger mt-1">{errors.unit}</p>}
              </div>
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
              <button type="submit" className="btn btn-primary flex-1 modal-btn flex items-center justify-center gap-2"><Save size={18} /> Lưu thay đổi</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Lịch sử xuất kho</h3>
          {exports.length === 0 ? (
            <p className="text-muted py-8 text-center">Chưa có lịch sử xuất kho</p>
          ) : (
            <ResponsiveTable>
              <thead>
                <tr>
                  <th>Người yêu cầu</th>
                  <th>Người duyệt</th>
                  <th>Ngày xuất</th>
                  <th>Số lượng xuất</th>
                </tr>
              </thead>
              <tbody>
                {exports.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.requestedBy}</td>
                    <td>{exp.approvedBy}</td>
                    <td>{exp.exportedAt}</td>
                    <td className="font-bold">{exp.quantity} {ingredient.unit}</td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
