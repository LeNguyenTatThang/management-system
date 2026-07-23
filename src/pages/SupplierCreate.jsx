import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupplier } from '../contexts/SupplierContext';
import { ArrowLeft, Store } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

export default function SupplierCreate() {
  const navigate = useNavigate();
  const { addSupplier } = useSupplier();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Tên nhà cung cấp không được để trống';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await addSupplier({
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      description: description.trim(),
      notes: notes.trim()
    });
    toast.success('Thêm nhà cung cấp thành công');
    navigate('/suppliers');
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/suppliers')}>Nhà cung cấp</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Thêm</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/suppliers')}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1 className="text-2xl font-bold mb-6">Thêm nhà cung cấp</h1>

        <form onSubmit={handleSubmit}>
          <div className="card mb-6">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Store size={18} className="text-primary" /> THÔNG TIN NHÀ CUNG CẤP
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tên nhà cung cấp <span className="text-danger">*</span></label>
                <input type="text" placeholder="Nhập tên nhà cung cấp..."
                  className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Người liên hệ</label>
                  <input type="text" placeholder="Nhập tên người liên hệ..." className="w-full modal-input"
                    value={contact} onChange={e => setContact(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input type="email" placeholder="Nhập email..." className="w-full modal-input"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Số điện thoại</label>
                  <input type="tel" placeholder="Nhập số điện thoại..." className="w-full modal-input"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Địa chỉ</label>
                  <input type="text" placeholder="Nhập địa chỉ..." className="w-full modal-input"
                    value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Mô tả</label>
                <textarea placeholder="Nhập mô tả nhà cung cấp..." className="w-full resize-vertical" rows={3}
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Ghi chú</label>
                <textarea placeholder="Nhập ghi chú..." className="w-full resize-vertical" rows={3}
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/suppliers')}>Hủy</button>
            <button type="submit" className="btn btn-primary modal-btn px-6">Thêm nhà cung cấp</button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
