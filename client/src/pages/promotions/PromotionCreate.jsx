import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Percent, Calendar, Settings } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import FormTextarea from '../../components/ui/FormTextarea';
import MultiSelect from '../../components/ui/MultiSelect';
import TimePicker from '../../components/ui/TimePicker';
import DatePicker from '../../components/ui/DatePicker';
import { mockPromotions, products } from '../../data/mockData';
import { toast } from 'react-hot-toast';

const TYPES = ['percent', 'fixed'];
const TYPE_LABELS = { percent: '%', fixed: 'Tiền mặt' };
const APPLY_OPTIONS = [
  { value: 'timeframe', label: 'Áp dụng theo khung giờ' },
  { value: 'product', label: 'Áp dụng theo món' },
  { value: 'category', label: 'Áp dụng theo danh mục' },
];
const CATEGORIES = ['Cà phê', 'Trà', 'Trà sữa', 'Đá xay', 'Nước ép'];

const productOptions = products.map(p => ({ value: p.id, label: p.name }));
const categoryOptions = CATEGORIES.map(c => ({ value: c, label: c }));

export default function PromotionCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState('');
  const [applyTo, setApplyTo] = useState('timeframe');
  const [categoryIds, setCategoryIds] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [status, setStatus] = useState('active');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên chương trình không được để trống';
    if (!value || isNaN(Number(value)) || Number(value) <= 0) errs.value = 'Giá trị khuyến mãi phải lớn hơn 0';

    if (applyTo === 'timeframe') {
      if (!timeStart) errs.timeStart = 'Vui lòng chọn giờ bắt đầu';
      if (!timeEnd) errs.timeEnd = 'Vui lòng chọn giờ kết thúc';
      if (timeStart && timeEnd && timeStart >= timeEnd) errs.timeEnd = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
    }

    if (applyTo === 'product' && productIds.length === 0) errs.applyTo = 'Vui lòng chọn ít nhất một món';
    if (applyTo === 'category' && categoryIds.length === 0) errs.applyTo = 'Vui lòng chọn ít nhất một danh mục';

    if (!startDate.trim()) errs.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!endDate.trim()) errs.endDate = 'Vui lòng chọn ngày kết thúc';
    if (startDate && endDate && startDate >= endDate) errs.endDate = 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu';

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/promotions')}>QL Khuyến Mãi</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Thêm</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/promotions')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

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
              <label className="block text-sm font-semibold mb-1.5">Điều kiện áp dụng</label>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {APPLY_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" name="applyTo" value={opt.value} checked={applyTo === opt.value}
                      onChange={e => { setApplyTo(e.target.value); setErrors(p => ({ ...p, applyTo: undefined })); }} />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.applyTo && <p className="text-xs text-danger mb-2">{errors.applyTo}</p>}

              {applyTo === 'timeframe' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Giờ bắt đầu <span className="text-danger">*</span></label>
                    <TimePicker value={timeStart} onChange={v => { setTimeStart(v); setErrors(p => ({ ...p, timeStart: undefined })); }} />
                    {errors.timeStart && <p className="text-xs text-danger mt-1">{errors.timeStart}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Giờ kết thúc <span className="text-danger">*</span></label>
                    <TimePicker value={timeEnd} onChange={v => { setTimeEnd(v); setErrors(p => ({ ...p, timeEnd: undefined })); }} />
                    {errors.timeEnd && <p className="text-xs text-danger mt-1">{errors.timeEnd}</p>}
                  </div>
                </div>
              )}

              {applyTo === 'product' && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Chọn món <span className="text-danger">*</span></label>
                    <MultiSelect
                      options={productOptions}
                      value={productIds}
                      onChange={v => { setProductIds(v); setErrors(p => ({ ...p, applyTo: undefined })); }}
                      placeholder="Chọn món..."
                      searchPlaceholder="Tìm món..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Giờ bắt đầu (không bắt buộc)</label>
                      <TimePicker value={timeStart} onChange={setTimeStart} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Giờ kết thúc (không bắt buộc)</label>
                      <TimePicker value={timeEnd} onChange={setTimeEnd} />
                    </div>
                  </div>
                  {!timeStart && !timeEnd && <p className="text-xs text-muted">Toàn thời gian</p>}
                </div>
              )}

              {applyTo === 'category' && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Chọn danh mục <span className="text-danger">*</span></label>
                    <MultiSelect
                      options={categoryOptions}
                      value={categoryIds}
                      onChange={v => { setCategoryIds(v); setErrors(p => ({ ...p, applyTo: undefined })); }}
                      placeholder="Chọn danh mục..."
                      searchPlaceholder="Tìm danh mục..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Giờ bắt đầu (không bắt buộc)</label>
                      <TimePicker value={timeStart} onChange={setTimeStart} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Giờ kết thúc (không bắt buộc)</label>
                      <TimePicker value={timeEnd} onChange={setTimeEnd} />
                    </div>
                  </div>
                  {!timeStart && !timeEnd && <p className="text-xs text-muted">Toàn thời gian</p>}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection icon={Calendar} title="THỜI GIAN ÁP DỤNG" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày bắt đầu <span className="text-danger">*</span></label>
                <DatePicker value={startDate} onChange={v => { setStartDate(v); setErrors(p => ({ ...p, startDate: undefined })); }} placeholder="Chọn ngày bắt đầu" allowPast={true} error={errors.startDate} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày kết thúc <span className="text-danger">*</span></label>
                <DatePicker value={endDate} onChange={v => { setEndDate(v); setErrors(p => ({ ...p, endDate: undefined })); }} placeholder="Chọn ngày kết thúc" allowPast={true} error={errors.endDate} />
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
