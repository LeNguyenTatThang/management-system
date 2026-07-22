import { useState } from 'react';
import { useSupplier } from '../contexts/SupplierContext';
import { Store, Mail, Phone, MapPin, Plus, Edit3, Trash2 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplier();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', address: '' });

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', contact: '', email: '', phone: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, contact: item.contact, email: item.email, phone: item.phone, address: item.address });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (editItem) {
      await updateSupplier(editItem.id, form);
    } else {
      await addSupplier(form);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa nhà cung cấp này?')) await deleteSupplier(id);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">Nhà cung cấp</h2>
            <p className="text-muted text-sm truncate">Danh sách {suppliers.length} nhà cung cấp</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm nhà cung cấp
          </button>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Tên nhà cung cấp</th>
                <th>Người liên hệ</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold flex items-center gap-2 min-w-0"><Store size={16} className="text-muted flex-shrink-0" /><span className="truncate">{item.name}</span></td>
                  <td className="text-sm">{item.contact || '—'}</td>
                  <td className="text-sm">{item.email || '—'}</td>
                  <td className="text-sm">{item.phone || '—'}</td>
                  <td className="text-sm text-muted truncate max-w-200px">{item.address || '—'}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => openEdit(item)}><Edit3 size={16} /></button>
                      <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-8">Chưa có nhà cung cấp nào</td></tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="card animate-fade-slide-in w-full max-w-500px">
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate">{editItem ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Tên nhà cung cấp *" className="w-full modal-input" value={form.name} onChange={handleChange('name')} />
              <input type="text" placeholder="Người liên hệ" className="w-full modal-input" value={form.contact} onChange={handleChange('contact')} />
              <input type="email" placeholder="Email" className="w-full modal-input" value={form.email} onChange={handleChange('email')} />
              <input type="tel" placeholder="Số điện thoại" className="w-full modal-input" value={form.phone} onChange={handleChange('phone')} />
              <input type="text" placeholder="Địa chỉ" className="w-full modal-input" value={form.address} onChange={handleChange('address')} />
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>{editItem ? 'Cập nhật' : 'Thêm nhà cung cấp'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
