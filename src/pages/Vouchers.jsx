import { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Tag, X } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';
import { mockVouchers } from '../data/mockData';
import { toast } from 'react-hot-toast';

const TYPES = ['fixed', 'percent'];
const TYPE_LABELS = { fixed: 'Tiền mặt', percent: '%' };

const defaultForm = {
  code: '', name: '', description: '', type: 'fixed', value: '',
  minOrder: '', maxDiscount: '', startDate: '', endDate: '',
  usageLimit: '', status: 'active'
};

function fmtPrice(n) {
  return Number(n).toLocaleString('vi-VN') + 'đ';
}

export default function Vouchers() {
  const [vouchers, setVouchers] = useState(mockVouchers);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const filtered = vouchers.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || v.status === filterStatus;
    const matchType = !filterType || v.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      code: item.code, name: item.name, description: item.description || '',
      type: item.type, value: String(item.value),
      minOrder: String(item.minOrder || ''), maxDiscount: String(item.maxDiscount || ''),
      startDate: item.startDate, endDate: item.endDate,
      usageLimit: String(item.usageLimit || ''), status: item.status
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code || !form.name || !form.value) return;
    const payload = {
      ...form,
      value: Number(form.value),
      minOrder: form.minOrder ? Number(form.minOrder) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };
    if (editItem) {
      setVouchers(prev => prev.map(v => v.id === editItem.id ? { ...v, ...payload } : v));
      toast.success('Cập nhật voucher thành công');
    } else {
      const newItem = { id: `VC${String(vouchers.length + 1).padStart(2, '0')}`, ...payload, usedCount: 0 };
      setVouchers(prev => [...prev, newItem]);
      toast.success('Thêm voucher thành công');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa voucher này?')) {
      setVouchers(prev => prev.filter(v => v.id !== id));
      toast.success('Đã xóa voucher');
    }
  };

  const toggleStatus = (id) => {
    setVouchers(prev => prev.map(v =>
      v.id === id ? { ...v, status: v.status === 'active' ? 'disabled' : 'active' } : v
    ));
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Quản lý Voucher</h2>
            <p className="text-muted text-sm">Quản lý {vouchers.length} mã giảm giá</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm voucher
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0 min-w-200px">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm voucher..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="h-36px text-sm w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="disabled">Đã tắt</option>
            <option value="expired">Hết hạn</option>
          </select>
          <select className="h-36px text-sm w-36" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="fixed">Tiền mặt</option>
            <option value="percent">Phần trăm</option>
          </select>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên voucher</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th className="hidden md:table-cell">Thời hạn</th>
                <th className="hidden md:table-cell">Đã dùng</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td className="font-semibold text-primary">{v.code}</td>
                  <td>{v.name}</td>
                  <td><span className="badge badge-neutral">{TYPE_LABELS[v.type]}</span></td>
                  <td className="font-semibold">{v.type === 'fixed' ? fmtPrice(v.value) : `${v.value}%`}</td>
                  <td>{v.minOrder > 0 ? fmtPrice(v.minOrder) : '—'}</td>
                  <td className="text-sm text-muted hidden md:table-cell whitespace-nowrap">{v.startDate} - {v.endDate}</td>
                  <td className="text-sm hidden md:table-cell">{v.usedCount}/{v.usageLimit || '∞'}</td>
                  <td>
                    <button className={`badge ${v.status === 'active' ? 'badge-success' : v.status === 'expired' ? 'badge-warning' : 'badge-danger'}`}
                      onClick={() => toggleStatus(v.id)}>
                      {v.status === 'active' ? 'Đang hoạt động' : v.status === 'expired' ? 'Hết hạn' : 'Đã tắt'}
                    </button>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-muted hover-text-primary cursor-pointer" onClick={() => openEdit(v)}><Edit3 size={16} /></button>
                      <button className="p-1.5 text-muted hover-text-danger cursor-pointer" onClick={() => handleDelete(v.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center text-muted py-8">Không tìm thấy voucher</td></tr>
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
              <h3 className="font-bold text-lg truncate"><Tag size={18} className="inline mr-1.5 text-primary" />{editItem ? 'Sửa voucher' : 'Thêm voucher'}</h3>
              <button className="p-1 text-muted hover-text-danger cursor-pointer flex-shrink-0 text-24px leading-none" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Mã voucher <span className="text-danger">*</span></label>
                  <input type="text" placeholder="VD: SALE10" className="w-full modal-input uppercase" value={form.code} onChange={handleChange('code')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tên voucher <span className="text-danger">*</span></label>
                  <input type="text" placeholder="Tên voucher" className="w-full modal-input" value={form.name} onChange={handleChange('name')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Mô tả</label>
                <textarea className="w-full resize-vertical" rows={2} placeholder="Mô tả voucher..." value={form.description} onChange={handleChange('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Loại giảm giá <span className="text-danger">*</span></label>
                  <select className="w-full modal-input" value={form.type} onChange={handleChange('type')}>
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Giá trị giảm <span className="text-danger">*</span></label>
                  <input type="number" placeholder={form.type === 'fixed' ? 'Số tiền' : 'Phần trăm'} className="w-full modal-input" value={form.value} onChange={handleChange('value')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Đơn tối thiểu</label>
                  <input type="number" placeholder="0" className="w-full modal-input" value={form.minOrder} onChange={handleChange('minOrder')} />
                </div>
                {form.type === 'percent' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Giảm tối đa</label>
                    <input type="number" placeholder="Không giới hạn" className="w-full modal-input" value={form.maxDiscount} onChange={handleChange('maxDiscount')} />
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
                  <label className="block text-sm font-semibold mb-1">Giới hạn lượt</label>
                  <input type="number" placeholder="Không giới hạn" className="w-full modal-input" value={form.usageLimit} onChange={handleChange('usageLimit')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Trạng thái</label>
                  <select className="w-full modal-input" value={form.status} onChange={handleChange('status')}>
                    <option value="active">Đang hoạt động</option>
                    <option value="disabled">Đã tắt</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button className="btn flex-1 modal-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary flex-1 modal-btn" onClick={handleSave}>{editItem ? 'Cập nhật' : 'Thêm voucher'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
