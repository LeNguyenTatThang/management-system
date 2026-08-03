import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryAdjustment, ADJUSTMENT_DIRECTIONS } from '../../../contexts/InventoryAdjustmentContext';
import { useIngredient } from '../../../contexts/IngredientContext';
import { ArrowLeft, Calendar, FileText, Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import FormSection from '../../../components/ui/FormSection';
import { toast } from 'react-hot-toast';

export default function AdjustmentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAdjustmentById, update } = useInventoryAdjustment();
  const { ingredients, units } = useIngredient();

  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activeIngredients = ingredients.filter((i) => i.status === 'active' || i.status === 'ACTIVE');

  useEffect(() => {
    const load = async () => {
      const r = await getAdjustmentById(id);
      if (!r) {
        toast.error('Không tìm thấy phiếu điều chỉnh');
        navigate('/inventory/adjustments');
        return;
      }
      if (r.status !== 'DRAFT') {
        toast.error('Không thể chỉnh sửa phiếu đã xác nhận hoặc đã hủy');
        navigate(`/inventory/adjustments/${id}`);
        return;
      }
      setReason(r.reason || '');
      setNote(r.note || '');
      setItems(
        r.items.map((item) => ({
          ingredientId: item.ingredientId ? String(item.ingredientId) : '',
          unitId: item.unitId ? String(item.unitId) : '',
          quantity: item.quantity ? String(item.quantity) : '',
          direction: item.direction || 'INCREASE',
          currentStock: item.ingredient?.stock ?? 0,
          note: item.note || '',
        })),
      );
      setLoaded(true);
    };
    load();
  }, [id, getAdjustmentById, navigate]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'ingredientId') {
        const ing = activeIngredients.find((i) => i.id === Number(value));
        updated[index] = {
          ...updated[index],
          ingredientId: value,
          unitId: ing?.unitId ? String(ing.unitId) : '',
          quantity: '',
          currentStock: ing?.stock ?? 0,
          note: '',
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addRow = () => {
    setItems((prev) => [...prev, { ingredientId: '', unitId: '', quantity: '', direction: 'INCREASE', currentStock: 0, note: '' }]);
  };

  const removeRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getAvailableIngredients = (currentIndex) => {
    const selectedIds = items.map((item, i) => (i !== currentIndex ? Number(item.ingredientId) : null)).filter(Boolean);
    return activeIngredients.filter((i) => !selectedIds.includes(i.id));
  };

  const validItemsCount = items.filter((i) => i.ingredientId).length;
  const totalQuantity = items.reduce((s, item) => s + (parseFloat(item.quantity) || 0), 0);

  const getStockError = (item) => {
    if (!item.ingredientId || !item.quantity) return '';
    const qty = parseFloat(item.quantity);
    if (qty <= 0) return 'SL phải > 0';
    if (item.direction === 'DECREASE' && qty > item.currentStock) {
      return `Không đủ tồn kho (còn ${item.currentStock})`;
    }
    return '';
  };

  const validate = () => {
    const errs = {};
    if (!reason.trim()) errs.reason = 'Vui lòng nhập lý do điều chỉnh';
    if (validItemsCount === 0) errs.items = 'Vui lòng thêm ít nhất 1 nguyên liệu';

    items.forEach((item, i) => {
      if (item.ingredientId) {
        const qty = parseFloat(item.quantity);
        if (!item.quantity || qty <= 0) {
          errs[`qty_${i}`] = 'SL phải > 0';
        } else if (item.direction === 'DECREASE' && qty > item.currentStock) {
          errs[`qty_${i}`] = `Tồn không đủ (còn ${item.currentStock})`;
        }
        if (!item.unitId) {
          errs[`unit_${i}`] = 'Chọn đơn vị';
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
      await update(id, {
        reason: reason.trim(),
        note: note.trim() || undefined,
        items: items
          .filter((i) => i.ingredientId)
          .map((i) => ({
            ingredientId: Number(i.ingredientId),
            quantity: parseFloat(i.quantity),
            unitId: Number(i.unitId),
            direction: i.direction,
            note: i.note.trim() || undefined,
          })),
      });
      toast.success('Cập nhật phiếu điều chỉnh thành công');
      navigate(`/inventory/adjustments/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/adjustments')}>
              Điều chỉnh kho
            </button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Sửa</span>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate(`/inventory/adjustments/${id}`)}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sửa phiếu điều chỉnh kho</h1>
          <p className="text-muted text-sm mt-1">Cập nhật thông tin phiếu điều chỉnh</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Calendar} title="THÔNG TIN PHIẾU ĐIỀU CHỈNH" className="mb-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Lý do điều chỉnh <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`w-full modal-input ${errors.reason ? 'border-danger' : ''}`}
                value={reason}
                placeholder="Ví dụ: Kiểm kê, điều chỉnh chênh lệch..."
                onChange={(e) => setReason(e.target.value)}
              />
              {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason}</p>}
            </div>
          </FormSection>

          <FormSection icon={Package} title="NGUYÊN LIỆU ĐIỀU CHỈNH" className="mb-5">
            {errors.items && (
              <div className="flex items-start gap-2 p-3 bg-danger-light rounded-lg mb-3">
                <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger">{errors.items}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '800px' }}>
                <thead>
                  <tr className="text-xs font-semibold text-muted">
                    <th className="text-left p-2" style={{ width: '22%' }}>Nguyên liệu</th>
                    <th className="text-left p-2" style={{ width: '10%' }}>ĐVT</th>
                    <th className="text-left p-2" style={{ width: '10%' }}>Tồn kho</th>
                    <th className="text-left p-2" style={{ width: '12%' }}>Hướng</th>
                    <th className="text-left p-2" style={{ width: '12%' }}>Số lượng</th>
                    <th className="text-left p-2" style={{ width: '17%' }}>Ghi chú</th>
                    <th className="text-center p-2" style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const stockErr = getStockError(item);
                    return (
                      <tr key={i}>
                        <td className="p-1">
                          <select
                            className={`w-full modal-input text-sm ${errors[`ing_${i}`] ? 'border-danger' : ''}`}
                            value={item.ingredientId}
                            onChange={(e) => handleItemChange(i, 'ingredientId', e.target.value)}
                          >
                            <option value="">-- Chọn --</option>
                            {getAvailableIngredients(i).map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (tồn: {ing.stock})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1">
                          <select
                            className={`w-full modal-input text-sm ${errors[`unit_${i}`] ? 'border-danger' : ''}`}
                            value={item.unitId}
                            onChange={(e) => handleItemChange(i, 'unitId', e.target.value)}
                          >
                            <option value="">-- ĐVT --</option>
                            {units.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                          {errors[`unit_${i}`] && (
                            <p className="text-xs text-danger whitespace-nowrap">{errors[`unit_${i}`]}</p>
                          )}
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            className="w-full modal-input text-sm bg-gray-50 text-muted text-center"
                            value={item.currentStock > 0 ? `${item.currentStock}` : ''}
                            readOnly
                          />
                        </td>
                        <td className="p-1">
                          <select
                            className="w-full modal-input text-sm"
                            value={item.direction}
                            onChange={(e) => handleItemChange(i, 'direction', e.target.value)}
                          >
                            {ADJUSTMENT_DIRECTIONS.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={`w-full modal-input text-sm text-right ${(errors[`qty_${i}`] || stockErr) ? 'border-danger' : ''}`}
                            value={item.quantity}
                            placeholder="0"
                            onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                          />
                          {(errors[`qty_${i}`] || stockErr) && (
                            <p className="text-xs text-danger whitespace-nowrap">{errors[`qty_${i}`] || stockErr}</p>
                          )}
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            className="w-full modal-input text-sm"
                            value={item.note}
                            placeholder="Ghi chú..."
                            onChange={(e) => handleItemChange(i, 'note', e.target.value)}
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            className={`p-1.5 cursor-pointer ${items.length <= 1 ? 'text-muted' : 'text-danger hover-text-danger/80'}`}
                            onClick={() => removeRow(i)}
                            disabled={items.length <= 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-primary font-semibold mt-3 cursor-pointer hover:underline"
              onClick={addRow}
            >
              <Plus size={16} /> Thêm nguyên liệu
            </button>

            {validItemsCount > 0 && (
              <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-soft">
                <div className="text-sm text-muted">
                  Số mặt hàng: <span className="font-bold text-main">{validItemsCount}</span>
                </div>
                <div className="text-sm text-muted">
                  Tổng số lượng:{' '}
                  <span className="font-bold text-main">{totalQuantity.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            )}
          </FormSection>

          <FormSection icon={FileText} title="GHI CHÚ" className="mb-6">
            <textarea
              placeholder="Ghi chú (không bắt buộc)..."
              className="w-full modal-input"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button
              type="button"
              className="btn btn-outline modal-btn px-6"
              onClick={() => navigate(`/inventory/adjustments/${id}`)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
