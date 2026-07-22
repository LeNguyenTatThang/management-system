import { useState } from 'react';
import { useMenuProduct } from '../contexts/MenuProductContext';
import { Coffee, Plus, Edit3, Trash2, Search } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const defaultForm = {
  name: '', category: 'Cà phê', price: '', image: '', description: '', status: 'Đang bán'
};

export default function MenuProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useMenuProduct();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const openAdd = () => {
    setEditItem(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), image: item.image, description: item.description, status: item.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const payload = { ...form, price: Number(form.price) };
    if (editItem) {
      await updateProduct(editItem.id, payload);
    } else {
      await addProduct(payload);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa món này?')) await deleteProduct(id);
  };

  const previewImage = form.image || 'https://via.placeholder.com/80?text=No+Image';

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">Danh mục món</h2>
            <p className="text-muted text-sm truncate">Quản lý {products.length} món</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm món mới
          </button>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="p-4 border-b min-w-0">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
              <input type="text" placeholder="Tìm kiếm món..." className="w-full pl-10 h-36px"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Món</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-bg overflow-hidden">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted"><Coffee size={20} /></div>}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{item.name}</div>
                        {item.description && <div className="text-xs text-muted truncate">{item.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm text-muted">{item.category}</span></td>
                  <td className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                  <td><span className={`badge ${item.status === 'Đang bán' ? 'badge-success' : 'badge-danger'}`}>{item.status}</span></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => openEdit(item)}><Edit3 size={16} /></button>
                      <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-8">{searchTerm ? 'Không tìm thấy món nào' : 'Chưa có món nào. Hãy thêm món mới!'}</td></tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="card animate-fade-slide-in w-full max-w-520px max-h-90vh">
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate">{editItem ? 'Sửa món' : 'Thêm món mới'}</h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-bg overflow-hidden">
                  <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="text-sm font-semibold mb-1 block">URL hình ảnh</label>
                  <input type="url" placeholder="https://..." className="w-full h-40px" value={form.image} onChange={handleChange('image')} />
                </div>
              </div>
              <input type="text" placeholder="Tên món *" className="w-full modal-input" value={form.name} onChange={handleChange('name')} />
              <div className="flex gap-3 min-w-0">
                <select className="flex-1 modal-input" value={form.category} onChange={handleChange('category')}>
                  <option>Cà phê</option>
                  <option>Trà</option>
                  <option>Đá xay</option>
                  <option>Sinh tố</option>
                  <option>Bánh</option>
                  <option>Khác</option>
                </select>
                <input type="number" placeholder="Giá bán *" className="flex-1 modal-input" value={form.price} onChange={handleChange('price')} />
              </div>
              <textarea placeholder="Mô tả (không bắt buộc)" className="w-full" rows={3} value={form.description} onChange={handleChange('description')} />
              <select className="w-full modal-input" value={form.status} onChange={handleChange('status')}>
                <option>Đang bán</option>
                <option>Ngừng bán</option>
              </select>
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>{editItem ? 'Cập nhật' : 'Thêm món'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
