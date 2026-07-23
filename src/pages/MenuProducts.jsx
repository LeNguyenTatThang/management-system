import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuProduct } from '../contexts/MenuProductContext';
import { Plus, Edit3, Trash2, Search, X, LayoutGrid, List as ListIcon, Coffee } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const CATEGORIES = ['Cà phê', 'Trà', 'Đá xay', 'Sinh tố', 'Bánh', 'Khác'];

const defaultForm = {
  name: '', category: 'Cà phê', price: '', cost: '', image: '', description: '', status: 'Đang bán', tags: [], size: ''
};

export default function MenuProducts() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useMenuProduct();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const popoverRef = useRef(null);
  const filterBtnRef = useRef(null);

  const activeFilterCount = (categoryFilter ? 1 : 0) + (typeFilter ? 1 : 0);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchType = !typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  const handleChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const openAdd = () => {
    navigate('/products/new');
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, category: item.category, price: String(item.price), cost: String(item.cost || ''),
      image: item.image, description: item.description || '', status: item.status,
      tags: item.tags || [], size: item.size || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const payload = {
      ...form, price: Number(form.price), cost: Number(form.cost) || 0,
      profit: Number(form.price) - (Number(form.cost) || 0),
      fc: ((Number(form.price) - (Number(form.cost) || 0)) / Number(form.price) * 100).toFixed(1) + '%',
    };
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        filterBtnRef.current && !filterBtnRef.current.contains(e.target)
      ) {
        setShowFilterPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Danh mục món</h2>
            <p className="text-muted text-sm">Quản lý {products.length} món</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px" onClick={openAdd}>
            <Plus size={18} /> Thêm món mới
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
            <input type="text" placeholder="Tìm theo tên..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <select className="h-36px text-sm w-36" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">Tất cả loại</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="h-36px text-sm w-40" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center p-0.5 bg-muted rounded-md ml-1">
              <button className={`flex items-center justify-center p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                onClick={() => setViewMode('grid')}><LayoutGrid size={16} /></button>
              <button className={`flex items-center justify-center p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                onClick={() => setViewMode('list')}><ListIcon size={16} /></button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full min-w-0">
            {filtered.map(item => (
              <div key={item.id} className="card p-0 flex flex-col overflow-hidden rounded-xl recipe-card-hover cursor-pointer transition group">
                <div className="relative w-full h-48 bg-bg overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><Coffee size={40} /></div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-1.5 bg-white rounded-full shadow-sm text-muted hover-text-primary cursor-pointer"
                      onClick={e => { e.stopPropagation(); openEdit(item); }}><Edit3 size={14} /></button>
                    <button className="p-1.5 bg-white rounded-full shadow-sm text-muted hover-text-danger cursor-pointer"
                      onClick={e => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 size={14} /></button>
                  </div>
                  {item.category && (
                    <div className="absolute bottom-2 left-2">
                      <span className="badge badge-neutral text-xs bg-white/90">{item.category}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <div className="font-bold text-sm break-words leading-tight">{item.name}</div>
                  <div className="font-bold text-base text-primary">{item.price?.toLocaleString('vi-VN')}đ</div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted py-12">{searchTerm || categoryFilter ? 'Không tìm thấy món' : 'Chưa có món nào'}</div>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden min-w-0">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th className="w-12 text-center">STT</th>
                  <th>Món</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Giá vốn</th>
                  <th>Margin</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-center text-muted text-sm">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-bg overflow-hidden">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted"><Coffee size={20} /></div>}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          {item.size && <div className="text-xs text-muted">{item.size}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="text-sm text-muted">{item.category}</span></td>
                    <td className="font-bold">{item.price?.toLocaleString('vi-VN')}đ</td>
                    <td className="text-sm">{item.cost?.toLocaleString('vi-VN')}đ</td>
                    <td><span className="badge badge-neutral">{item.fc || '-'}</span></td>
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
                  <tr><td colSpan={8} className="text-center text-muted py-8">Không tìm thấy món</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="card animate-fade-slide-in w-full max-w-560px max-h-90vh overflow-y-auto">
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
              <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                <select className="flex-1 modal-input" value={form.category} onChange={handleChange('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Size (VD: 360ml)" className="flex-1 modal-input" value={form.size} onChange={handleChange('size')} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                <input type="number" placeholder="Giá bán *" className="flex-1 modal-input" value={form.price} onChange={handleChange('price')} />
                <input type="number" placeholder="Giá vốn" className="flex-1 modal-input" value={form.cost} onChange={handleChange('cost')} />
              </div>
              <textarea placeholder="Mô tả (không bắt buộc)" className="w-full" rows={3} value={form.description} onChange={handleChange('description')} />
              <select className="w-full modal-input" value={form.status} onChange={handleChange('status')}>
                <option value="Đang bán">Đang bán</option>
                <option value="Ngừng bán">Ngừng bán</option>
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
