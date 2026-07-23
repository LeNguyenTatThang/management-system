import { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Gift, X } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';
import { mockPromotions, products } from '../data/mockData';
import { toast } from 'react-hot-toast';

const TYPES = ['percent', 'fixed'];
const TYPE_LABELS = { percent: '%', fixed: 'Tiền mặt' };
const APPLY_OPTIONS = [
  { value: 'category', label: 'Theo danh mục' },
  { value: 'product', label: 'Theo sản phẩm' },
];

const CATEGORIES = ['Cà phê', 'Trà', 'Trà sữa', 'Đá xay', 'Nước ép'];

const defaultForm = {
  name: '', description: '', type: 'percent', value: '',
  applyTo: 'category', categoryIds: [], productIds: [],
  startDate: '', endDate: '', timeStart: '', timeEnd: '', status: 'active'
};

function fmtPrice(n) {
  return Number(n).toLocaleString('vi-VN') + 'đ';
}

export default function Promotions() {
  const [promotions, setPromotions] = useState(mockPromotions);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const filtered = promotions.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleArrayItem = (field, item) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item]
    }));
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description || '',
      type: item.type, value: String(item.value),
      applyTo: item.applyTo, categoryIds: item.categoryIds || [], productIds: item.productIds || [],
      startDate: item.startDate, endDate: item.endDate,
      timeStart: item.timeStart || '', timeEnd: item.timeEnd || '', status: item.status
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.value) return;
    if (form.applyTo === 'category' && form.categoryIds.length === 0) { toast.error('Vui lòng chọn danh mục'); return; }
    if (form.applyTo === 'product' && form.productIds.length === 0) { toast.error('Vui lòng chọn sản phẩm'); return; }
    const payload = {
      ...form,
      value: Number(form.value),
    };
    if (editItem) {
      setPromotions(prev => prev.map(p => p.id === editItem.id ? { ...p, ...payload } : p));
      toast.success('Cập nhật chương trình thành công');
    } else {
      const newItem = { id: `KM${String(promotions.length + 1).padStart(2, '0')}`, ...payload };
      setPromotions(prev => [...prev, newItem]);
      toast.success('Thêm chương trình khuyến mãi thành công');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa chương trình này?')) {
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xóa chương trình');
    }
  };

  const toggleStatus = (id) => {
    setPromotions(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    ));
  };

  const getProductName = (id) => products.find(p => p.id === id)?.name || id;

  const getApplyTarget = (promo) => {
    if (promo.applyTo === 'category') return promo.categoryIds?.join(', ') || '—';
    return promo.productIds?.map(id => getProductName(id)).join(', ') || '—';
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Quản lý chương trình khuyến mãi</h2>
            <p className="text-muted text-sm">Quản lý {promotions.length} chương trình</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm chương trình
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm chương trình..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-36px text-sm w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã tắt</option>
          </select>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Tên chương trình</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Áp dụng</th>
                <th className="hidden md:table-cell">Thời gian</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.name}</td>
                  <td><span className="badge badge-neutral">{TYPE_LABELS[p.type]}</span></td>
                  <td className="font-semibold">{p.type === 'fixed' ? fmtPrice(p.value) : `${p.value}%`}</td>
                  <td className="text-sm text-muted truncate max-w-200px">{getApplyTarget(p)}</td>
                  <td className="text-sm text-muted hidden md:table-cell whitespace-nowrap">
                    {p.startDate} - {p.endDate}
                    {p.timeStart && <span className="ml-1">({p.timeStart}-{p.timeEnd})</span>}
                  </td>
                  <td>
                    <button className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleStatus(p.id)}>
                      {p.status === 'active' ? 'Đang hoạt động' : 'Đã tắt'}
                    </button>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => openEdit(p)}><Edit3 size={16} /></button>
                      <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-8">Không tìm thấy chương trình</td></tr>
              )}
            </tbody>
          </ResponsiveTable>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={() => setShowModal(false)}>
          <div className="card animate-fade-slide-in w-full max-w-lg max-h-90vh overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 gap-4">
              <h3 className="font-bold text-lg truncate"><Gift size={18} className="inline mr-1.5 text-primary" />{editItem ? 'Sửa chương trình' : 'Thêm chương trình'}</h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tên chương trình <span className="text-danger">*</span></label>
                <input type="text" placeholder="VD: HAPPY HOUR" className="w-full modal-input" value={form.name} onChange={handleChange('name')} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Mô tả</label>
                <textarea className="w-full resize-vertical" rows={2} placeholder="Mô tả chương trình..." value={form.description} onChange={handleChange('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Loại khuyến mãi <span className="text-danger">*</span></label>
                  <select className="w-full modal-input" value={form.type} onChange={handleChange('type')}>
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Giá trị <span className="text-danger">*</span></label>
                  <input type="number" placeholder={form.type === 'fixed' ? 'Số tiền' : '%'} className="w-full modal-input" value={form.value} onChange={handleChange('value')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Áp dụng cho</label>
                <div className="flex items-center gap-3 mb-2">
                  {APPLY_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="applyTo" value={opt.value} checked={form.applyTo === opt.value}
                        onChange={handleChange('applyTo')} />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {form.applyTo === 'category' && (
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {CATEGORIES.map(cat => (
                      <button key={cat}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${form.categoryIds.includes(cat) ? 'bg-primary-light border-primary text-primary' : 'border-gray-200 text-muted'}`}
                        onClick={() => toggleArrayItem('categoryIds', cat)}
                      >{cat}</button>
                    ))}
                  </div>
                )}
                {form.applyTo === 'product' && (
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {products.map(prod => (
                      <button key={prod.id}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${form.productIds.includes(prod.id) ? 'bg-primary-light border-primary text-primary' : 'border-gray-200 text-muted'}`}
                        onClick={() => toggleArrayItem('productIds', prod.id)}
                      >{prod.name}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Ngày bắt đầu</label>
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full modal-input" value={form.startDate} onChange={handleChange('startDate')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ngày kết thúc</label>
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full modal-input" value={form.endDate} onChange={handleChange('endDate')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Giờ bắt đầu</label>
                  <input type="text" placeholder="VD: 14:00" className="w-full modal-input" value={form.timeStart} onChange={handleChange('timeStart')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Giờ kết thúc</label>
                  <input type="text" placeholder="VD: 17:00" className="w-full modal-input" value={form.timeEnd} onChange={handleChange('timeEnd')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Trạng thái</label>
                <select className="w-full modal-input" value={form.status} onChange={handleChange('status')}>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đã tắt</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>{editItem ? 'Cập nhật' : 'Thêm chương trình'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
