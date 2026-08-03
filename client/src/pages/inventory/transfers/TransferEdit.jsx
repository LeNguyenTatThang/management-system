import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryTransfer } from '../../../contexts/InventoryTransferContext';
import { useIngredient } from '../../../contexts/IngredientContext';
import { ArrowLeft, Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import FormSection from '../../../components/ui/FormSection';
import { toast } from 'react-hot-toast';

export default function TransferEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTransferById, editTransfer } = useInventoryTransfer();
  const { ingredients, units } = useIngredient();

  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activeIngredients = ingredients.filter((i) => i.status === 'active' || i.status === 'ACTIVE');

  useEffect(() => {
    const load = async () => {
      const r = await getTransferById(id);
      if (!r) {
        toast.error('Không tìm thấy phiếu chuyển kho');
        navigate('/inventory/transfers');
        return;
      }
      if (r.status !== 'DRAFT') {
        toast.error('Chỉ có thể chỉnh sửa phiếu nháp');
        navigate(`/inventory/transfers/${id}`);
        return;
      }
      setNote(r.note || '');
      setItems(
        r.items.map((item) => ({
          ingredientId: item.ingredientId ? String(item.ingredientId) : '',
          unitId: item.unitId ? String(item.unitId) : '',
          quantity: item.quantity != null ? String(item.quantity) : '',
          note: item.note || '',
        })),
      );
      setLoaded(true);
    };
    load();
  }, [id, getTransferById, navigate]);

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
          note: '',
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addRow = () => {
    setItems((prev) => [...prev, { ingredientId: '', unitId: '', quantity: '', note: '' }]);
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

  const validate = () => {
    const errs = {};
    if (validItemsCount === 0) errs.items = 'Vui lòng thêm ít nhất 1 nguyên liệu';

    items.forEach((item, i) => {
      if (item.ingredientId) {
        if (item.quantity === '' || item.quantity === null) {
          errs[`qty_${i}`] = 'Vui lòng nhập số lượng';
        } else {
          const qty = parseFloat(item.quantity);
          if (qty <= 0) errs[`qty_${i}`] = 'Số lượng phải lớn hơn 0';
        }
        if (!item.unitId) errs[`unit_${i}`] = 'Chọn đơn vị';
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
      await editTransfer(id, {
        note: note.trim() || undefined,
        items: items
          .filter((i) => i.ingredientId)
          .map((i) => ({
            ingredientId: Number(i.ingredientId),
            unitId: Number(i.unitId),
            quantity: parseFloat(i.quantity),
            note: i.note.trim() || undefined,
          })),
      });
      toast.success('Cập nhật phiếu chuyển kho thành công');
      navigate(`/inventory/transfers/${id}`);
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
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/transfers')}>
              Chuyển kho
            </button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Sửa</span>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate(`/inventory/transfers/${id}`)}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sửa phiếu chuyển kho</h1>
          <p className="text-muted text-sm mt-1">Cập nhật thông tin phiếu chuyển kho</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Package} title="NGUYÊN LIỆU CHUYỂN KHO" className="mb-5">
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
                    <th className="text-left p-2" style={{ width: '22%' }}>Nguyên liệu</th>
                    <th className="text-left p-2" style={{ width: '10%' }}>ĐVT</th>
                    <th className="text-left p-2" style={{ width: '12%' }}>Số lượng</th>
                    <th className="text-left p-2" style={{ width: '17%' }}>Ghi chú</th>
                    <th className="text-center p-2" style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
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
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                        {errors[`unit_${i}`] && (
                          <p className="text-xs text-danger whitespace-nowrap">{errors[`unit_${i}`]}</p>
                        )}
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`w-full modal-input text-sm text-right ${errors[`qty_${i}`] ? 'border-danger' : ''}`}
                          value={item.quantity}
                          placeholder="0"
                          onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                        />
                        {errors[`qty_${i}`] && (
                          <p className="text-xs text-danger whitespace-nowrap">{errors[`qty_${i}`]}</p>
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
                  ))}
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
              </div>
            )}
          </FormSection>

          <FormSection icon={Package} title="GHI CHÚ" className="mb-5">
            <textarea
              className="w-full modal-input text-sm"
              rows={3}
              placeholder="Ghi chú phiếu chuyển kho..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button
              type="button"
              className="btn btn-outline modal-btn px-6"
              onClick={() => navigate(`/inventory/transfers/${id}`)}
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