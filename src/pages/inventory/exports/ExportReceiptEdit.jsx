import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryExport, EXPORT_TYPES } from '../../../contexts/InventoryExportContext';
import { useIngredient } from '../../../contexts/IngredientContext';
import { ArrowLeft, Calendar, MapPin, FileText, Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import FormSection from '../../../components/ui/FormSection';
import DatePicker from '../../../components/ui/DatePicker';
import { BRANCHES } from '../../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

export default function ExportReceiptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getExportById, updateExport } = useInventoryExport();
  const { ingredients } = useIngredient();

  const [date, setDate] = useState('');
  const [exportType, setExportType] = useState('USE');
  const [branchId, setBranchId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activeIngredients = ingredients.filter(i => i.active !== false);

  useEffect(() => {
    const r = getExportById(id);
    if (!r) {
      toast.error('Không tìm thấy phiếu xuất');
      navigate('/inventory/exports');
      return;
    }
    if (r.status !== 'draft') {
      toast.error('Không thể chỉnh sửa phiếu đã xác nhận hoặc đã xuất kho');
      navigate(`/inventory/exports/${id}`);
      return;
    }
    setDate(r.date);
    setExportType(r.exportType);
    setBranchId(r.branchId);
    setToBranchId(r.toBranchId || '');
    setReason(r.reason || '');
    setNote(r.note || '');
    setItems(r.items.map(item => ({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      unit: item.unit,
      requestedQuantity: String(item.requestedQuantity),
      currentStock: item.currentStock,
      note: item.note || '',
    })));
    setLoaded(true);
  }, [id, getExportById, navigate]);

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
          requestedQuantity: '',
          currentStock: ing?.stock ?? 0,
          note: '',
        };
      } else if (field === 'requestedQuantity') {
        updated[index] = { ...updated[index], requestedQuantity: value };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addRow = () => {
    setItems(prev => [...prev, { ingredientId: '', ingredientName: '', unit: '', requestedQuantity: '', currentStock: 0, note: '' }]);
  };

  const removeRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const getAvailableIngredients = (currentIndex) => {
    const selectedIds = items.map((item, i) => i !== currentIndex ? item.ingredientId : null).filter(Boolean);
    return activeIngredients.filter(i => !selectedIds.includes(i.id));
  };

  const validItemsCount = items.filter(i => i.ingredientId).length;
  const totalQuantity = items.reduce((s, item) => s + (parseFloat(item.requestedQuantity) || 0), 0);

  const getStockError = (item) => {
    if (!item.ingredientId || !item.requestedQuantity) return '';
    const qty = parseFloat(item.requestedQuantity);
    if (qty <= 0) return 'SL phải > 0';
    if (qty > item.currentStock) {
      return `Không đủ tồn kho (còn ${item.currentStock}${item.unit})`;
    }
    return '';
  };

  const validate = () => {
    const errs = {};
    if (!date.trim()) errs.date = 'Vui lòng chọn ngày xuất';
    if (!exportType) errs.exportType = 'Vui lòng chọn loại xuất';
    if (!branchId) errs.branchId = 'Vui lòng chọn kho xuất';
    if (exportType === 'TRANSFER') {
      if (!toBranchId) errs.toBranchId = 'Vui lòng chọn kho nhận';
      if (toBranchId && toBranchId === branchId) errs.toBranchId = 'Kho nhận không được trùng kho xuất';
    }
    if ((exportType === 'DISPOSAL' || exportType === 'OTHER') && !reason.trim()) {
      errs.reason = 'Vui lòng nhập lý do';
    }
    if (validItemsCount === 0) errs.items = 'Vui lòng thêm ít nhất 1 nguyên liệu';

    items.forEach((item, i) => {
      if (item.ingredientId) {
        const qty = parseFloat(item.requestedQuantity);
        if (!item.requestedQuantity || qty <= 0) {
          errs[`qty_${i}`] = 'SL phải > 0';
        } else if (qty > item.currentStock) {
          errs[`qty_${i}`] = `Tồn không đủ (còn ${item.currentStock}${item.unit})`;
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
      const branch = BRANCHES.find(b => b.id === branchId);
      const toBranch = BRANCHES.find(b => b.id === toBranchId);
      await updateExport(id, {
        date: date.trim(),
        exportType,
        branchId,
        branchName: branch?.name || '',
        toBranchId: exportType === 'TRANSFER' ? toBranchId : '',
        toBranchName: exportType === 'TRANSFER' ? (toBranch?.name || '') : '',
        reason: reason.trim(),
        note: note.trim(),
        items: items.filter(i => i.ingredientId).map(i => ({
          ingredientId: i.ingredientId,
          ingredientName: i.ingredientName,
          unit: i.unit,
          requestedQuantity: parseFloat(i.requestedQuantity),
          actualQuantity: 0,
          currentStock: i.currentStock,
          note: i.note.trim(),
        })),
      });
      toast.success('Cập nhật phiếu xuất thành công');
      navigate(`/inventory/exports/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/exports')}>Xuất kho</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Sửa</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate(`/inventory/exports/${id}`)}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sửa phiếu xuất kho</h1>
          <p className="text-muted text-sm mt-1">Cập nhật thông tin phiếu xuất</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Calendar} title="THÔNG TIN PHIẾU XUẤT" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày xuất <span className="text-danger">*</span></label>
                <DatePicker value={date} onChange={setDate} placeholder="Chọn ngày xuất" error={errors.date} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Loại xuất <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.exportType ? 'border-danger' : ''}`}
                  value={exportType} onChange={e => { setExportType(e.target.value); setToBranchId(''); setReason(''); }}>
                  {EXPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.exportType && <p className="text-xs text-danger mt-1">{errors.exportType}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Kho xuất <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.branchId ? 'border-danger' : ''}`}
                  value={branchId} onChange={e => setBranchId(e.target.value)}>
                  <option value="">-- Chọn kho xuất --</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.branchId && <p className="text-xs text-danger mt-1">{errors.branchId}</p>}
              </div>
              {exportType === 'TRANSFER' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Kho nhận <span className="text-danger">*</span></label>
                  <select className={`w-full modal-input ${errors.toBranchId ? 'border-danger' : ''}`}
                    value={toBranchId} onChange={e => setToBranchId(e.target.value)}>
                    <option value="">-- Chọn kho nhận --</option>
                    {BRANCHES.filter(b => b.id !== branchId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  {errors.toBranchId && <p className="text-xs text-danger mt-1">{errors.toBranchId}</p>}
                </div>
              )}
              {(exportType === 'DISPOSAL' || exportType === 'OTHER') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Lý do <span className="text-danger">*</span></label>
                  <textarea className={`w-full modal-input ${errors.reason ? 'border-danger' : ''}`} rows={2}
                    value={reason} onChange={e => setReason(e.target.value)} placeholder="Nhập lý do xuất..." />
                  {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason}</p>}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection icon={Package} title="NGUYÊN LIỆU XUẤT" className="mb-5">
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
                    <th className="text-left p-2" style={{ width: '25%' }}>Nguyên liệu</th>
                    <th className="text-left p-2" style={{ width: '7%' }}>ĐVT</th>
                    <th className="text-left p-2" style={{ width: '12%' }}>Tồn kho</th>
                    <th className="text-left p-2" style={{ width: '14%' }}>SL xuất</th>
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
                          <select className={`w-full modal-input text-sm ${errors[`ing_${i}`] ? 'border-danger' : ''}`}
                            value={item.ingredientId} onChange={e => handleItemChange(i, 'ingredientId', e.target.value)}>
                            <option value="">-- Chọn --</option>
                            {getAvailableIngredients(i).map(ing => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (tồn: {ing.stock}{ing.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1">
                          <input type="text" className="w-full modal-input text-sm bg-gray-50 text-muted text-center" value={item.unit} readOnly />
                        </td>
                        <td className="p-1">
                          <input type="text" className="w-full modal-input text-sm bg-gray-50 text-muted text-center"
                            value={item.currentStock > 0 ? `${item.currentStock}` : ''} readOnly />
                        </td>
                        <td className="p-1">
                          <input type="number" step="0.01" min="0"
                            className={`w-full modal-input text-sm text-right ${(errors[`qty_${i}`] || stockErr) ? 'border-danger' : ''}`}
                            value={item.requestedQuantity} placeholder="0"
                            onChange={e => handleItemChange(i, 'requestedQuantity', e.target.value)} />
                          {(errors[`qty_${i}`] || stockErr) && (
                            <p className="text-xs text-danger whitespace-nowrap">{errors[`qty_${i}`] || stockErr}</p>
                          )}
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
                    );
                  })}
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
              </div>
            )}
          </FormSection>

          {exportType !== 'DISPOSAL' && exportType !== 'OTHER' && (
            <FormSection icon={FileText} title="GHI CHÚ" className="mb-6">
              <textarea placeholder="Ghi chú (không bắt buộc)..." className="w-full modal-input" rows={3}
                value={note} onChange={e => setNote(e.target.value)} />
            </FormSection>
          )}

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate(`/inventory/exports/${id}`)}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
