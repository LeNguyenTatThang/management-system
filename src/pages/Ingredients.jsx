import { useState } from 'react';
import { useIngredient } from '../contexts/IngredientContext';
import { Package, Plus, Edit3, Trash2, Search } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const defaultForm = {
  name: '', unit: 'Kg', stock: '', minStock: '', cost: '', supplier: ''
};

export default function Ingredients() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, addStock } = useIngredient();
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [stockItemId, setStockItemId] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const openAdd = () => {
    setEditItem(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, unit: item.unit, stock: String(item.stock),
      minStock: String(item.minStock), cost: String(item.cost), supplier: item.supplier
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const payload = { ...form, stock: Number(form.stock), minStock: Number(form.minStock), cost: Number(form.cost) };
    if (editItem) {
      await updateIngredient(editItem.id, payload);
    } else {
      await addIngredient(payload);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa nguyên liệu này?')) await deleteIngredient(id);
  };

  const openStockIn = (id) => {
    setStockItemId(id);
    setStockQty('');
    setShowStockModal(true);
  };

  const handleStockIn = async () => {
    if (!stockQty || Number(stockQty) <= 0) return;
    await addStock(stockItemId, Number(stockQty));
    setShowStockModal(false);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">Nguyên liệu</h2>
            <p className="text-muted text-sm truncate">Quản lý {ingredients.length} nguyên liệu</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm nguyên liệu
          </button>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="p-4 border-b min-w-0">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
              <input type="text" placeholder="Tìm nguyên liệu..." className="w-full pl-10 h-36px"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Tên nguyên liệu</th>
                <th>ĐVT</th>
                <th>Tồn kho</th>
                <th>Tồn tối thiểu</th>
                <th>Đơn giá</th>
                <th>Nhà cung cấp</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLowStock = item.stock <= item.minStock;
                return (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.name}</td>
                    <td className="text-sm">{item.unit}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-bold ${isLowStock ? 'text-danger' : ''}`}>{item.stock}</span>
                        <span className="text-muted text-xs">{item.unit}</span>
                        {isLowStock && <span className="badge badge-danger text-xs">Sắp hết</span>}
                      </div>
                    </td>
                    <td className="text-sm text-muted">{item.minStock}</td>
                    <td className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.cost)}</td>
                    <td className="text-sm">{item.supplier || '—'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="text-xs font-semibold px-2 py-1 rounded bg-primary text-white hover-bg-primary cursor-pointer flex-shrink-0 whitespace-nowrap"
                          onClick={() => openStockIn(item.id)}>Nhập kho</button>
                        <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => openEdit(item)}><Edit3 size={16} /></button>
                        <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-8">{searchTerm ? 'Không tìm thấy nguyên liệu' : 'Chưa có nguyên liệu nào'}</td></tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="card animate-fade-slide-in w-full max-w-500px">
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate">{editItem ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}</h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Tên nguyên liệu *" className="w-full modal-input" value={form.name} onChange={handleChange('name')} />
              <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                <select className="w-full sm:w-24 modal-input" value={form.unit} onChange={handleChange('unit')}>
                  <option>Kg</option>
                  <option>Gr</option>
                  <option>Lít</option>
                  <option>ml</option>
                  <option>Cái</option>
                  <option>Hộp</option>
                  <option>Bịch</option>
                  <option>Chai</option>
                </select>
                <input type="number" placeholder="Tồn kho ban đầu" className="flex-1 modal-input" value={form.stock} onChange={handleChange('stock')} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                <input type="number" placeholder="Tồn tối thiểu" className="flex-1 modal-input" value={form.minStock} onChange={handleChange('minStock')} />
                <input type="number" placeholder="Đơn giá" className="flex-1 modal-input" value={form.cost} onChange={handleChange('cost')} />
              </div>
              <input type="text" placeholder="Nhà cung cấp (không bắt buộc)" className="w-full modal-input" value={form.supplier} onChange={handleChange('supplier')} />
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>{editItem ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="card animate-fade-slide-in w-full max-w-400px">
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate">Nhập kho</h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowStockModal(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold">Số lượng nhập</label>
              <input type="number" placeholder="Nhập số lượng..." className="w-full modal-input"
                value={stockQty} onChange={e => setStockQty(e.target.value)} autoFocus />
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setShowStockModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleStockIn}>Xác nhận nhập</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
