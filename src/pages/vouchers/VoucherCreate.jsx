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

const defaultForm = {
  code: '', description: '', type: 'fixed', value: '',
  maxDiscount: '', startDate: '', endDate: '',
  usageLimit: '', status: 'active'
};

function fmtPrice(n) {
  return Number(n).toLocaleString('vi-VN') + 'đ';
}

function fmtVoucherDate(dateStr, isEnd) {
  if (!dateStr) return '—';
  if (dateStr.includes(' ')) return dateStr;
  return isEnd ? `${dateStr} 23:59` : `${dateStr} 00:00`;
}

export default function VoucherCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Mã voucher không được để trống';
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) errs.value = 'Giá trị giảm phải lớn hơn 0';
    if (form.maxDiscount !== '' && (isNaN(Number(form.maxDiscount)) || Number(form.maxDiscount) < 0)) errs.maxDiscount = 'Giảm tối đa không được âm';
    if (form.usageLimit !== '' && (isNaN(Number(form.usageLimit)) || Number(form.usageLimit) < 0)) errs.usageLimit = 'Giới hạn lượt không được âm';
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
        code: form.code.trim(),
        description: form.description,
        type: form.type,
        value: Number(form.value),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        startDate: form.startDate,
        endDate: form.endDate,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        status: form.status,
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/vouchers')}>QL Voucher</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Thêm</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/vouchers')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm Voucher</h1>
          <p className="text-muted text-sm mt-1">Tạo mã giảm giá mới cho chương trình khuyến mãi</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Tag} title="THÔNG TIN VOUCHER" className="mb-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mã voucher <span className="text-danger">*</span></label>
                <input type="text" placeholder="VD: SALE10" className={`w-full modal-input uppercase ${errors.code ? 'border-danger' : ''}`}
                  value={form.code} onChange={handleChange('code')} />
                {errors.code && <p className="text-xs text-danger mt-1">{errors.code}</p>}
              </div>
            </div>
            <div>
              <FormTextarea label="Mô tả" placeholder="Mô tả voucher..." rows={2}
                value={form.description} onChange={handleChange('description')} />
            </div>
          </FormSection>

          <FormSection icon={Percent} title="CẤU HÌNH GIẢM GIÁ" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Loại giảm giá <span className="text-danger">*</span></label>
                <select className="w-full modal-input" value={form.type} onChange={handleChange('type')}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giá trị giảm <span className="text-danger">*</span></label>
                <input type="number" placeholder={form.type === 'fixed' ? 'Số tiền' : 'Phần trăm'}
                  className={`w-full modal-input ${errors.value ? 'border-danger' : ''}`}
                  value={form.value} onChange={handleChange('value')} />
                {errors.value && <p className="text-xs text-danger mt-1">{errors.value}</p>}
              </div>
              {form.type === 'percent' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Giảm tối đa</label>
                  <input type="number" placeholder="Không giới hạn" className={`w-full modal-input ${errors.maxDiscount ? 'border-danger' : ''}`}
                    value={form.maxDiscount} onChange={handleChange('maxDiscount')} />
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
                  value={form.startDate} onChange={handleChange('startDate')} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày kết thúc</label>
                <input type="text" placeholder="DD/MM/YYYY" className="w-full modal-input"
                  value={form.endDate} onChange={handleChange('endDate')} />
              </div>
            </div>
          </FormSection>

          <FormSection icon={Settings} title="CÀI ĐẶT KHÁC" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giới hạn lượt</label>
                <input type="number" placeholder="Không giới hạn" className={`w-full modal-input ${errors.usageLimit ? 'border-danger' : ''}`}
                  value={form.usageLimit} onChange={handleChange('usageLimit')} />
                {errors.usageLimit && <p className="text-xs text-danger mt-1">{errors.usageLimit}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Trạng thái</label>
                <select className="w-full modal-input" value={form.status} onChange={handleChange('status')}>
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