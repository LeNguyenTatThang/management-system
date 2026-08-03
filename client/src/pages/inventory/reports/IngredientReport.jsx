import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryReport } from '../../../contexts/InventoryReportContext';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';

const TYPE_LABELS = { IMPORT: 'Nhập kho', EXPORT: 'Xuất kho', ADJUSTMENT: 'Điều chỉnh' };
const DIRECTION_LABELS = { IN: 'Tăng', OUT: 'Giảm' };
const DIRECTION_COLOR = { IN: '#10b981', OUT: '#ef4444' };
const REFERENCE_TYPE_LABELS = {
  INVENTORY_IMPORT: 'Phiếu nhập',
  INVENTORY_EXPORT: 'Phiếu xuất',
  INVENTORY_ADJUSTMENT: 'Điều chỉnh',
  INVENTORY_STOCKTAKE: 'Kiểm kê',
};

function fmtNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('vi-VN');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function IngredientReport() {
  const { ingredientId } = useParams();
  const navigate = useNavigate();
  const { fetchIngredientReport, ingredientReport, loading, error } = useInventoryReport();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    fetchIngredientReport(Number(ingredientId), params);
  }, [ingredientId, dateFrom, dateTo, fetchIngredientReport]);

  if (!ingredientReport && !loading) {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    fetchIngredientReport(Number(ingredientId), params);
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => window.history.back()}>Báo cáo kho</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết nguyên liệu</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {loading && !ingredientReport ? (
          <div className="text-center py-12 text-muted">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-12 text-danger">{error}</div>
        ) : !ingredientReport ? null : (
          <>
            <div className="card mb-4 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted">Nguyên liệu</div>
                  <div className="font-semibold">{ingredientReport.ingredient.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Tồn kho hiện tại</div>
                  <div className="text-xl font-bold">{fmtNumber(ingredientReport.ingredient.stock)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Đơn vị</div>
                  <div className="font-semibold">{ingredientReport.ingredient.unit}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Mức tối thiểu</div>
                  <div className="font-semibold">{ingredientReport.ingredient.minStock != null ? fmtNumber(ingredientReport.ingredient.minStock) : '—'}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="card p-4 text-center">
                <div className="text-xs text-muted">Tổng nhập</div>
                <div className="text-lg font-bold text-success">{fmtNumber(ingredientReport.totalImported)}</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-xs text-muted">Tổng xuất</div>
                <div className="text-lg font-bold text-danger">{fmtNumber(ingredientReport.totalExported)}</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-xs text-muted">Tổng điều chỉnh</div>
                <div className="text-lg font-bold">{fmtNumber(ingredientReport.totalAdjusted)}</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-xs text-muted">Tổng kiểm kê</div>
                <div className="text-lg font-bold">{fmtNumber(ingredientReport.totalStocktake)}</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-xs text-muted">Số lần giao dịch</div>
                <div className="text-lg font-bold">{ingredientReport.movementCount}</div>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Từ ngày</label>
                <input type="date" className="modal-input text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Đến ngày</label>
                <input type="date" className="modal-input text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full" style={{ minWidth: '700px' }}>
                <thead>
                  <tr className="text-xs font-semibold text-muted border-b border-soft">
                    <th className="text-left p-3">Ngày</th>
                    <th className="text-left p-3">Loại</th>
                    <th className="text-center p-3">IN/OUT</th>
                    <th className="text-right p-3">SL</th>
                    <th className="text-right p-3">Tồn trước</th>
                    <th className="text-right p-3">Tồn sau</th>
                    <th className="text-left p-3">Chứng từ</th>
                    <th className="text-left p-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientReport.movements.map((m) => (
                    <tr key={m.id} className="border-b border-soft/50">
                      <td className="p-3 text-sm whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                      <td className="p-3 text-sm">{TYPE_LABELS[m.type] || m.type}</td>
                      <td className="p-3 text-center">
                        <span className="font-semibold" style={{ color: DIRECTION_COLOR[m.direction] }}>
                          {DIRECTION_LABELS[m.direction]}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right font-semibold">{fmtNumber(m.quantity)}</td>
                      <td className="p-3 text-sm text-right">{fmtNumber(m.stockBefore)}</td>
                      <td className="p-3 text-sm text-right">{fmtNumber(m.stockAfter)}</td>
                      <td className="p-3 text-sm">{REFERENCE_TYPE_LABELS[m.referenceType] || m.referenceType} — {m.referenceCode || '—'}</td>
                      <td className="p-3 text-sm text-muted">{m.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}