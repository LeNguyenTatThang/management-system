import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupplier } from '../../contexts/SupplierContext';
import { ArrowLeft, Store, Info, Phone, MapPin } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import FormTextarea from '../../components/ui/FormTextarea';
import { toast } from 'react-hot-toast';

export default function SupplierCreate() {
  const { addSupplier } = useSupplier();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên nhà cung cấp không được để trống';
    if (!email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không hợp lệ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await addSupplier({
        name: name.trim(),
        contact: contact.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim(),
        notes: notes.trim(),
      });
      toast.success('Thêm nhà cung cấp thành công');
      navigate('/suppliers');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/suppliers')}>Nhà cung cấp</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/suppliers')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm nhà cung cấp</h1>
          <p className="text-muted text-sm mt-1">Tạo mới thông tin nhà cung cấp</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Info} title="THÔNG TIN NHÀ CUNG CẤP" className="mb-6">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Tên nhà cung cấp <span className="text-danger">*</span></label>
              <input type="text" placeholder="Nhập tên nhà cung cấp..." className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Người liên hệ</label>
                <input type="text" placeholder="Nhập tên người liên hệ..." className="w-full modal-input"
                  value={contact} onChange={e => setContact(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email <span className="text-danger">*</span></label>
                <input type="email" placeholder="Nhập email..." className={`w-full modal-input ${errors.email ? 'border-danger' : ''}`}
                  value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Số điện thoại</label>
                <input type="tel" placeholder="Nhập số điện thoại..." className="w-full modal-input"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Địa chỉ</label>
                <input type="text" placeholder="Nhập địa chỉ..." className="w-full modal-input"
                  value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>
            <FormTextarea label="Mô tả" placeholder="Nhập mô tả nhà cung cấp..."
              value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            <FormTextarea label="Ghi chú" placeholder="Nhập ghi chú..."
              value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/suppliers')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm nhà cung cấp'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
