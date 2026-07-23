import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Percent, Calendar, Settings } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import FormTextarea from '../../components/ui/FormTextarea';
import { mockPromotions, products } from '../../data/mockData';
import { toast } from 'react-hot-toast';

const TYPES = ['percent', 'fixed'];
const TYPE_LABELS = { percent: '%', fixed: 'Tiền mặt' };
const APPLY_OPTIONS = [
  { value: 'category', label: 'Theo danh mục' },
  { value: 'product', label: 'Theo sản phẩm' },
];
const CATEGORIES = ['Cà phê', 'Trà', 'Trà sữa', 'Đá xay', 'Nước ép'];

export default function PromotionCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState('');
  const [applyTo, setApplyTo] = useState('category');
  const [categoryIds, setCategoryIds] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [status, setStatus] = useState('active');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const toggleCategory = (cat) => {
    setCategoryIds(prev => prev.includes(cat) ? prev.filter(i => i !== cat) : [...prev, cat]);
  };

  const toggleProduct = (id) => {
    setProductIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên chương trình không được để trống';
    if (!value || isNaN(Number(value)) || Number(value) <= 0) errs.value = 'Giá trị khuyến mãi phải lớn hơn 0';
    if (applyTo === 'category' && categoryIds.length === 0) errs.applyTo = 'Vui lòng chọn ít nhất một danh mục';
    if (applyTo === 'product' && productIds.length === 0) errs.applyTo = 'Vui lòng chọn ít nhất một sản phẩm';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const newItem = {
        id: `KM${String(mockPromotions.length + 1).padStart(2, '0')}`,
        name: name.trim(),
        description,
        type,
        value: Number(value),
        applyTo,
        categoryIds: applyTo === 'category' ? categoryIds : [],
        productIds: applyTo === 'product' ? productIds : [],
        startDate,
        endDate,
        timeStart,
        timeEnd,
        status,
      };
      mockPromotions.push(newItem);
      toast.success('Thêm chương trình khuyến mãi thành công');
      navigate('/promotions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/promotions')}>QL Khuyến Mãi</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/promotions')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm chương trình khuyến mãi</h1>
          <p className="text-muted text-sm mt-1">Tạo chương trình khuyến mãi mới cho cửa hàng</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Gift} title="THÔNG TIN CHƯƠNG TRÌNH" className="mb-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Tên chương trình <span className="text-danger">*</span></label>
              <input type="text" placeholder="VD: HAPPY HOUR" className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>
            <div>
              <FormTextarea label="Mô tả" placeholder="Mô tả chương trình..." rows={2}
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </FormSection>

          <FormSection icon={Percent} title="CẤU HÌNH KHUYẾN MÃI" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Loại khuyến mãi <span className="text-danger">*</span></label>
                <select className="w-full modal-input" value={type} onChange={e => setType(e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giá trị <span className="text-danger">*</span></label>
                <input type="number" placeholder={type === 'fixed' ? 'Số tiền' : '%'}
                  className={`w-full modal-input ${errors.value ? 'border-danger' : ''}`}
                  value={value} onChange={e => setValue(e.target.value)} />
                {errors.value && <p className="text-xs text-danger mt-1">{errors.value}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Áp dụng cho</label>
              <div className="flex items-center gap-3 mb-3">
                {APPLY_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" name="applyTo" value={opt.value} checked={applyTo === opt.value}
                      onChange={e => setApplyTo(e.target.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.applyTo && <p className="text-xs text-danger mb-2">{errors.applyTo}</p>}
              {applyTo === 'category' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button"
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${categoryIds.includes(cat) ? 'bg-primary-light border-primary text-primary' : 'border-gray-200 text-muted hover-border-primary'}`}
                      onClick={() => toggleCategory(cat)}
                    >{cat}</button>
                  ))}
                </div>
              )}
              {applyTo === 'product' && (
                <div className="flex items-center gap-2 flex-wrap max-h-40 overflow-y-auto">
                  {products.map(prod => (
                    <button key={prod.id} type="button"
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${productIds.includes(prod.id) ? 'bg-primary-light border-primary text-primary' : 'border-gray-200 text-muted hover-border-primary'}`}
                      onClick={() => toggleProduct(prod.id)}
                    >{prod.name}</button>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection icon={Calendar} title="THỜI GIAN ÁP DỤNG" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày bắt đầu</label>
                <input type="text" placeholder="DD/MM/YYYY" className="w-full modal-input"
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày kết thúc</label>
                <input type="text" placeholder="DD/MM/YYYY" className="w-full modal-input"
                  value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giờ bắt đầu</label>
                <input type="text" placeholder="VD: 14:00" className="w-full modal-input"
                  value={timeStart} onChange={e => setTimeStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giờ kết thúc</label>
                <input type="text" placeholder="VD: 17:00" className="w-full modal-input"
                  value={timeEnd} onChange={e => setTimeEnd(e.target.value)} />
              </div>
            </div>
          </FormSection>

          <FormSection icon={Settings} title="TRẠNG THÁI" className="mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Trạng thái</label>
              <select className="w-full modal-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã tắt</option>
              </select>
            </div>
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/promotions')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm chương trình'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
