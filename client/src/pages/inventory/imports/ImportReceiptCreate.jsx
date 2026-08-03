import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImportReceipt } from '../../../contexts/ImportReceiptContext';
import { useIngredient } from '../../../contexts/IngredientContext';
import { ArrowLeft, Calendar, FileText, Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import FormSection from '../../../components/ui/FormSection';
import { toast } from 'react-hot-toast';

export default function ImportReceiptCreate() {
  const navigate = useNavigate();
  const { addImport } = useImportReceipt();
  const { ingredients, units } = useIngredient();

  const todayISO = () => new Date().toISOString().slice(0, 10);
  const [importDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [items, setItems] = useState([
    { ingredientId: '', unitId: '', quantity: '', unitPrice: '', amount: 0, expirationDate: '', note: '' },
  ]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const activeIngredients = ingredients.filter(i => i.status === 'ACTIVE');

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'ingredientId') {
        const ing = activeIngredients.find(i => i.id === Number(value));
        updated[index] = {
          ...updated[index],
          ingredientId: value,
          unitId: ing?.unitId || '',
          quantity: '',
          unitPrice: '',
          amount: 0,
          expirationDate: '',
          note: '',
        };
      } else if (field === 'unitId') {
        updated[index] = { ...updated[index], unitId: value };
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
    setItems(prev => [...prev, { ingredientId: '', unitId: '', quantity: '', unitPrice: '', amount: 0, expirationDate: '', note: '' }]);
  };

  const removeRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const getAvailableIngredients = (currentIndex) => {
    const selectedIds = items.map((item, i) => i !== currentIndex ? Number(item.ingredientId) : null).filter(Boolean);
    return activeIngredients.filter(i => !selectedIds.includes(i.id));
  };

  const totalQuantity = items.reduce((s, item) => s + (parseFloat(item.quantity) || 0), 0);
  const totalAmount = items.reduce((s, item) => s + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0);
  const validItemsCount = items.filter(i => i.ingredientId).length;

  const validate = () => {
    const errs = {};
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

  const handleSave = async (status) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dto = {
        importDate,
        note: note.trim(),
        items: items.filter(i => i.ingredientId).map(i => ({
          ingredientId: Number(i.ingredientId),
          unitId: i.unitId ? Number(i.unitId) : undefined,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice) || undefined,
          expirationDate: i.expirationDate || undefined,
          note: i.note.trim() || undefined,
        })),
      };
      await addImport(dto);
      toast.success(status === 'DRAFT' ? 'Đã lưu nháp phiếu nhập' : 'Đã xác nhận phiếu nhập');
      navigate('/inventory/imports');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/imports')}>Nhập kho</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Tạo phiếu nhập</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/inventory/imports')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tạo phiếu nhập kho</h1>
          <p className="text-muted text-sm mt-1">Nhập thông tin phiếu nhập hàng và nguyên liệu</p>
        </div>

        <FormSection icon={Calendar} title="THÔNG TIN PHIẾU NHẬP" className="mb-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Ngày nhập <span className="text-danger">*</span></label>
            <input type="text" className="w-full modal-input bg-gray-50 text-sm text-muted cursor-not-allowed"
              value={importDate} readOnly disabled />
          </div>
        </FormSection>

        <FormSection icon={Package} title="NGUYÊN LIỆU NHẬP" subtitle="Thêm ít nhất 1 nguyên liệu" className="mb-5">
          {errors.items && (
            <div className="flex items-start gap-2 p-3 bg-danger-light rounded-lg mb-3">
              <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger">{errors.items}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '850px' }}>
              <thead>
                <tr className="text-xs font-semibold text-muted">
                  <th className="text-left p-2" style={{ width: '22%' }}>Nguyên liệu</th>
                  <th className="text-left p-2" style={{ width: '10%' }}>ĐVT</th>
                  <th className="text-left p-2" style={{ width: '12%' }}>Hạn sử dụng</th>
                  <th className="text-left p-2" style={{ width: '10%' }}>Số lượng</th>
                  <th className="text-left p-2" style={{ width: '12%' }}>Đơn giá</th>
                  <th className="text-left p-2" style={{ width: '13%' }}>Thành tiền</th>
                  <th className="text-left p-2" style={{ width: '13%' }}>Ghi chú</th>
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
                            {ing.name} {ing.status !== 'ACTIVE' ? '(ngừng SD)' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1">
                      <select className="w-full modal-input text-sm"
                        value={item.unitId} onChange={e => handleItemChange(i, 'unitId', e.target.value)}>
                        <option value="">-- ĐVT --</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1">
                      <input type="date" className="w-full modal-input text-sm"
                        value={item.expirationDate} onChange={e => handleItemChange(i, 'expirationDate', e.target.value)} />
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
          <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/inventory/imports')}>Hủy</button>
          <button type="button" className={`btn btn-outline modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={saving} onClick={() => handleSave('DRAFT')}>
            {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          <button type="button" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={saving} onClick={() => {
              if (!window.confirm('Xác nhận phiếu nhập này? Sau khi xác nhận, bạn có thể thực hiện nhập kho.')) return;
              handleSave('CONFIRMED');
            }}>
            {saving ? 'Đang lưu...' : 'Xác nhận phiếu'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
