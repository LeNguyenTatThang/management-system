import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useImportReceipt } from '../../../contexts/ImportReceiptContext';
import { useSupplier } from '../../../contexts/SupplierContext';
import { useIngredient } from '../../../contexts/IngredientContext';
import { ArrowLeft, Calendar, MapPin, Store, FileText, Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import FormSection from '../../../components/ui/FormSection';
import DatePicker from '../../../components/ui/DatePicker';
import { BRANCHES } from '../../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

export default function ImportReceiptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getImportById, updateImport } = useImportReceipt();
  const { suppliers } = useSupplier();
  const { ingredients } = useIngredient();

  const [date, setDate] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activeIngredients = ingredients.filter(i => i.active !== false);

  useEffect(() => {
    const r = getImportById(id);
    if (!r) {
      toast.error('Không tìm thấy phiếu nhập');
      navigate('/inventory/imports');
      return;
    }
    if (r.status !== 'draft') {
      toast.error('Không thể chỉnh sửa phiếu đã xác nhận hoặc đã nhập kho');
      navigate(`/inventory/imports/${id}`);
      return;
    }
    setDate(r.date);
    setSupplierId(r.supplierId);
    setBranchId(r.branchId);
    setNote(r.note || '');
    setItems(r.items.map(item => ({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      unit: item.unit,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      amount: item.amount,
      note: item.note || '',
    })));
    setLoaded(true);
  }, [id, getImportById, navigate]);

  useEffect(() => {
    if (date) setErrors(prev => ({ ...prev, date: '' }));
  }, [date]);

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'ingredientId') {
        const ing = activeIngredients.find(i => i.id === value);
        updated[index] = {
          ...updated[index],
          ingredientId: value,
          ingredientName: ing?.name || '',
          unit: ing?.unit || '',
          quantity: '',
          unitPrice: ing?.averageImportPrice || '',
          amount: 0,
          note: '',
        };
      } else if (field === 'quantity' || field === 'unitPrice') {
        updated[index] = { ...updated[index], [field]: value };
        const qty = parseFloat(updated[index].quantity) || 0;
        const price = parseFloat(updated[index].unitPrice) || 0;
        updated[index].amount = qty * price;
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addRow = () => {
    setItems(prev => [...prev, { ingredientId: '', ingredientName: '', unit: '', quantity: '', unitPrice: '', amount: 0, note: '' }]);
  };

  const removeRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const getAvailableIngredients = (currentIndex) => {
    const selectedIds = items.map((item, i) => i !== currentIndex ? item.ingredientId : null).filter(Boolean);
    return activeIngredients.filter(i => !selectedIds.includes(i.id));
  };

  const totalQuantity = items.reduce((s, item) => s + (parseFloat(item.quantity) || 0), 0);
  const totalAmount = items.reduce((s, item) => s + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0);
  const validItemsCount = items.filter(i => i.ingredientId).length;

  const validate = () => {
    const errs = {};
    if (!date.trim()) errs.date = 'Vui lòng chọn ngày nhập';
    if (!supplierId) errs.supplierId = 'Vui lòng chọn nhà cung cấp';
    if (!branchId) errs.branchId = 'Vui lòng chọn kho/chi nhánh';
    if (validItemsCount === 0) errs.items = 'Vui lòng thêm ít nhất 1 nguyên liệu';

    items.forEach((item, i) => {
      if (item.ingredientId) {
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errs[`qty_${i}`] = 'SL phải > 0';
        }
        if (item.unitPrice === '' || parseFloat(item.unitPrice) < 0) {
          errs[`price_${i}`] = 'Đơn giá không hợp lệ';
        }
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const supplier = suppliers.find(s => s.id === supplierId);
      const branch = BRANCHES.find(b => b.id === branchId);
      await updateImport(id, {
        date: date.trim(),
        supplierId,
        supplierName: supplier?.name || '',
        branchId,
        branchName: branch?.name || '',
        note: note.trim(),
        items: items.filter(i => i.ingredientId).map(i => ({
          ingredientId: i.ingredientId,
          ingredientName: i.ingredientName,
          unit: i.unit,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
          amount: (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
          note: i.note.trim(),
        })),
      });
      toast.success('Cập nhật phiếu nhập thành công');
      navigate(`/inventory/imports/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/imports')}>Nhập kho</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Sửa</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate(`/inventory/imports/${id}`)}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sửa phiếu nhập kho</h1>
          <p className="text-muted text-sm mt-1">Cập nhật thông tin phiếu nhập</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Calendar} title="THÔNG TIN PHIẾU NHẬP" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày nhập <span className="text-danger">*</span></label>
                <DatePicker value={date} onChange={setDate} placeholder="Chọn ngày nhập" error={errors.date} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Nhà cung cấp <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.supplierId ? 'border-danger' : ''}`}
                  value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.supplierId && <p className="text-xs text-danger mt-1">{errors.supplierId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Kho/Chi nhánh <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.branchId ? 'border-danger' : ''}`}
                  value={branchId} onChange={e => setBranchId(e.target.value)}>
                  <option value="">-- Chọn kho/chi nhánh --</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.branchId && <p className="text-xs text-danger mt-1">{errors.branchId}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection icon={Package} title="NGUYÊN LIỆU NHẬP" className="mb-5">
            {errors.items && (
              <div className="flex items-start gap-2 p-3 bg-danger-light rounded-lg mb-3">
                <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger">{errors.items}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '700px' }}>
                <thead>
                  <tr className="text-xs font-semibold text-muted">
                    <th className="text-left p-2" style={{ width: '28%' }}>Nguyên liệu</th>
                    <th className="text-left p-2" style={{ width: '8%' }}>ĐVT</th>
                    <th className="text-left p-2" style={{ width: '12%' }}>Số lượng</th>
                    <th className="text-left p-2" style={{ width: '15%' }}>Đơn giá</th>
                    <th className="text-left p-2" style={{ width: '15%' }}>Thành tiền</th>
                    <th className="text-left p-2" style={{ width: '17%' }}>Ghi chú</th>
                    <th className="text-center p-2" style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-1">
                        <select className={`w-full modal-input text-sm ${errors[`ing_${i}`] ? 'border-danger' : ''}`}
                          value={item.ingredientId} onChange={e => handleItemChange(i, 'ingredientId', e.target.value)}>
                          <option value="">-- Chọn --</option>
                          {getAvailableIngredients(i).map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} {!ing.active ? '(ngừng SD)' : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input type="text" className="w-full modal-input text-sm bg-gray-50 text-muted text-center" value={item.unit} readOnly />
                      </td>
                      <td className="p-1">
                        <input type="number" step="0.01" min="0" className={`w-full modal-input text-sm text-right ${errors[`qty_${i}`] ? 'border-danger' : ''}`}
                          value={item.quantity} placeholder="0" onChange={e => handleItemChange(i, 'quantity', e.target.value)} />
                        {errors[`qty_${i}`] && <p className="text-xs text-danger">{errors[`qty_${i}`]}</p>}
                      </td>
                      <td className="p-1">
                        <input type="number" min="0" className={`w-full modal-input text-sm text-right ${errors[`price_${i}`] ? 'border-danger' : ''}`}
                          value={item.unitPrice} placeholder="0" onChange={e => handleItemChange(i, 'unitPrice', e.target.value)} />
                        {errors[`price_${i}`] && <p className="text-xs text-danger">{errors[`price_${i}`]}</p>}
                      </td>
                      <td className="p-1">
                        <input type="text" className="w-full modal-input text-sm bg-gray-50 text-muted text-right font-semibold"
                          value={item.amount > 0 ? `${item.amount.toLocaleString('vi-VN')} ₫` : ''} readOnly />
                      </td>
                      <td className="p-1">
                        <input type="text" className="w-full modal-input text-sm" value={item.note}
                          placeholder="Ghi chú..." onChange={e => handleItemChange(i, 'note', e.target.value)} />
                      </td>
                      <td className="p-1 text-center">
                        <button className={`p-1.5 cursor-pointer ${items.length <= 1 ? 'text-muted' : 'text-danger hover-text-danger/80'}`}
                          onClick={() => removeRow(i)} disabled={items.length <= 1}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="flex items-center gap-1.5 text-sm text-primary font-semibold mt-3 cursor-pointer hover:underline"
              onClick={addRow}>
              <Plus size={16} /> Thêm nguyên liệu
            </button>

            {validItemsCount > 0 && (
              <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-soft">
                <div className="text-sm text-muted">
                  Số mặt hàng: <span className="font-bold text-main">{validItemsCount}</span>
                </div>
                <div className="text-sm text-muted">
                  Tổng số lượng: <span className="font-bold text-main">{totalQuantity.toLocaleString('vi-VN')}</span>
                </div>
                <div className="text-base font-bold text-primary">
                  Tổng tiền: {totalAmount.toLocaleString('vi-VN')} ₫
                </div>
              </div>
            )}
          </FormSection>

          <FormSection icon={FileText} title="GHI CHÚ" className="mb-6">
            <textarea placeholder="Ghi chú (không bắt buộc)..." className="w-full modal-input" rows={3}
              value={note} onChange={e => setNote(e.target.value)} />
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate(`/inventory/imports/${id}`)}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
