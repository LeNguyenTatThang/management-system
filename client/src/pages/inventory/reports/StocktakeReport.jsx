import { useState, useEffect } from 'react';
import { useInventoryReport } from '../../../contexts/InventoryReportContext';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';

const STATUS_LABELS = {
  DRAFT: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#10b981', bg: '#ecfdf5' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

function fmtNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('vi-VN');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function StocktakeReport() {
  const { fetchStocktakeReport, stocktakeReport, loading, error } = useInventoryReport();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    fetchStocktakeReport(params);
  }, [dateFrom, dateTo, fetchStocktakeReport]);

  if (!stocktakeReport && !loading) {
    fetchStocktakeReport();
  }

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => window.history.back()}>Báo cáo kho</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Kiểm kê</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="flex items-end gap-3 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Từ ngày</label>
            <input type="date" className="modal-input text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Đến ngày</label>
            <input type="date" className="modal-input text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        {loading && !stocktakeReport ? (
          <div className="text-center py-12 text-muted">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-12 text-danger">{error}</div>
        ) : !stocktakeReport ? null : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="card p-4">
                <div className="text-xs text-muted">Số phiếu kiểm kê</div>
                <div className="text-xl font-bold">{stocktakeReport.totalPills}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted">Số nguyên liệu kiểm kê</div>
                <div className="text-xl font-bold">{stocktakeReport.totalIngredients}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted">Tổng tăng</div>
                <div className="text-xl font-bold text-success">+{fmtNumber(stocktakeReport.totalIncrease)}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted">Tổng giảm</div>
                <div className="text-xl font-bold text-danger">-{fmtNumber(stocktakeReport.totalDecrease)}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted">Không chênh lệch</div>
                <div className="text-xl font-bold">{stocktakeReport.totalNoDifference}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted">Tổng chênh lệch</div>
                <div className="text-xl font-bold">{fmtNumber(stocktakeReport.totalDifference)}</div>
              </div>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full" style={{ minWidth: '600px' }}>
                <thead>
                  <tr className="text-xs font-semibold text-muted border-b border-soft">
                    <th className="text-left p-3">Mã phiếu</th>
                    <th className="text-left p-3">Ngày</th>
                    <th className="text-center p-3">Trạng thái</th>
                    <th className="text-right p-3">SL mặt hàng</th>
                    <th className="text-right p-3">Tăng</th>
                    <th className="text-right p-3">Giảm</th>
                    <th className="text-right p-3">Chênh lệch</th>
                  </tr>
                </thead>
                <tbody>
                  {stocktakeReport.stocktakes.map((st) => (
                    <tr key={st.id} className="border-b border-soft/50">
                      <td className="p-3 text-sm font-semibold">{st.code}</td>
                      <td className="p-3 text-sm">{fmtDate(st.stocktakeDate)}</td>
                      <td className="p-3 text-center">
                        <span className="badge text-xs" style={{ backgroundColor: (STATUS_LABELS[st.status] || STATUS_LABELS.DRAFT).bg, color: (STATUS_LABELS[st.status] || STATUS_LABELS.DRAFT).color }}>
                          {(STATUS_LABELS[st.status] || STATUS_LABELS.DRAFT).label}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right">{st.itemCount}</td>
                      <td className="p-3 text-sm text-right text-success">+{fmtNumber(st.totalIncrease)}</td>
                      <td className="p-3 text-sm text-right text-danger">-{fmtNumber(st.totalDecrease)}</td>
                      <td className="p-3 text-sm text-right font-semibold">{fmtNumber(st.totalDifference)}</td>
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