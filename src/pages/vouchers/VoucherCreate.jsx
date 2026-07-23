import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Percent, Calendar, Settings } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import FormTextarea from '../../components/ui/FormTextarea';
import { mockVouchers } from '../../data/mockData';
import { toast } from 'react-hot-toast';

const TYPES = ['fixed', 'percent'];
const TYPE_LABELS = { fixed: 'Tiền mặt', percent: '%' };

export default function VoucherCreate() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('fixed');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [status, setStatus] = useState('active');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!code.trim()) errs.code = 'Mã voucher không được để trống';
    if (!name.trim()) errs.name = 'Tên voucher không được để trống';
    if (!value || isNaN(Number(value)) || Number(value) <= 0) errs.value = 'Giá trị giảm phải lớn hơn 0';
    if (minOrder !== '' && (isNaN(Number(minOrder)) || Number(minOrder) < 0)) errs.minOrder = 'Đơn tối thiểu không được âm';
    if (maxDiscount !== '' && (isNaN(Number(maxDiscount)) || Number(maxDiscount) < 0)) errs.maxDiscount = 'Giảm tối đa không được âm';
    if (usageLimit !== '' && (isNaN(Number(usageLimit)) || Number(usageLimit) < 0)) errs.usageLimit = 'Giới hạn lượt không được âm';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const voucherList = mockVouchers;
      const newItem = {
        id: `VC${String(voucherList.length + 1).padStart(2, '0')}`,
        code: code.trim(),
        name: name.trim(),
        description,
        type,
        value: Number(value),
        minOrder: minOrder ? Number(minOrder) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        startDate,
        endDate,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        status,
        usedCount: 0,
      };
      mockVouchers.push(newItem);
      toast.success('Thêm voucher thành công');
      navigate('/vouchers');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/vouchers')}>QL Voucher</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/vouchers')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm Voucher</h1>
          <p className="text-muted text-sm mt-1">Tạo mã giảm giá mới cho chương trình khuyến mãi</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Tag} title="THÔNG TIN VOUCHER" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mã voucher <span className="text-danger">*</span></label>
                <input type="text" placeholder="VD: SALE10" className={`w-full modal-input uppercase ${errors.code ? 'border-danger' : ''}`}
                  value={code} onChange={e => setCode(e.target.value)} />
                {errors.code && <p className="text-xs text-danger mt-1">{errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Tên voucher <span className="text-danger">*</span></label>
                <input type="text" placeholder="Tên voucher" className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
            </div>
            <div>
              <FormTextarea label="Mô tả" placeholder="Mô tả voucher..." rows={2}
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </FormSection>

          <FormSection icon={Percent} title="CẤU HÌNH GIẢM GIÁ" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Loại giảm giá <span className="text-danger">*</span></label>
                <select className="w-full modal-input" value={type} onChange={e => setType(e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giá trị giảm <span className="text-danger">*</span></label>
                <input type="number" placeholder={type === 'fixed' ? 'Số tiền' : 'Phần trăm'}
                  className={`w-full modal-input ${errors.value ? 'border-danger' : ''}`}
                  value={value} onChange={e => setValue(e.target.value)} />
                {errors.value && <p className="text-xs text-danger mt-1">{errors.value}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Đơn tối thiểu</label>
                <input type="number" placeholder="0" className={`w-full modal-input ${errors.minOrder ? 'border-danger' : ''}`}
                  value={minOrder} onChange={e => setMinOrder(e.target.value)} />
                {errors.minOrder && <p className="text-xs text-danger mt-1">{errors.minOrder}</p>}
              </div>
              {type === 'percent' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Giảm tối đa</label>
                  <input type="number" placeholder="Không giới hạn" className={`w-full modal-input ${errors.maxDiscount ? 'border-danger' : ''}`}
                    value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} />
                  {errors.maxDiscount && <p className="text-xs text-danger mt-1">{errors.maxDiscount}</p>}
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
            </div>
          </FormSection>

          <FormSection icon={Settings} title="CÀI ĐẶT KHÁC" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giới hạn lượt</label>
                <input type="number" placeholder="Không giới hạn" className={`w-full modal-input ${errors.usageLimit ? 'border-danger' : ''}`}
                  value={usageLimit} onChange={e => setUsageLimit(e.target.value)} />
                {errors.usageLimit && <p className="text-xs text-danger mt-1">{errors.usageLimit}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Trạng thái</label>
                <select className="w-full modal-input" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="active">Đang hoạt động</option>
                  <option value="disabled">Đã tắt</option>
                </select>
              </div>
            </div>
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/vouchers')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm voucher'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
