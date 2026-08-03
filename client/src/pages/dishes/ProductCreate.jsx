import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuProduct } from '../../contexts/MenuProductContext';
import PageContainer from '../../components/layout/PageContainer';
import MultiSelect from '../../components/ui/MultiSelect';
import { toast } from 'react-hot-toast';

export default function ProductCreate() {
  const navigate = useNavigate();
  const { categories, setups, addProduct } = useMenuProduct();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    image: '',
    size: '',
    categoryId: '',
    status: 'active',
    setupIds: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên món');
    if (!form.price || Number(form.price) <= 0) return toast.error('Giá bán phải lớn hơn 0');

    setSubmitting(true);
    try {
      await addProduct({
        ...form,
        price: Number(form.price),
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        setupIds: form.setupIds,
      });
      toast.success('Đã thêm món mới');
      navigate('/products');
    } catch (e) {
      toast.error(e.message || 'Không thể thêm món');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl w-full mx-auto">
        <h2 className="text-xl font-bold mb-4">Thêm món mới</h2>
        <form className="card p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên món *</label>
            <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Nhập tên món" />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} placeholder="Mô tả món (không bắt buộc)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Giá bán (VND) *</label>
              <input type="number" name="price" className="form-input" value={form.price} onChange={handleChange} min={0} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Giá vốn (VND)</label>
              <input type="number" name="costPrice" className="form-input" value={form.costPrice} onChange={handleChange} min={0} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Danh mục</label>
              <select name="categoryId" className="form-input" value={form.categoryId} onChange={handleChange}>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Kích thước</label>
              <input type="text" name="size" className="form-input" value={form.size} onChange={handleChange} placeholder="S, M, L..." />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Hình ảnh URL</label>
            <input type="text" name="image" className="form-input" value={form.image} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select name="status" className="form-input" value={form.status} onChange={handleChange}>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Setups</label>
            <MultiSelect
              options={setups.map(s => ({ value: s.id, label: s.name }))}
              value={form.setupIds}
              onChange={(ids) => setForm(prev => ({ ...prev, setupIds: ids }))}
              placeholder="Chọn setups..."
            />
          </div>
          <div className="flex items-center gap-2 justify-end pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Thêm mới'}</button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
