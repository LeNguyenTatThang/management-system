import { useState, useEffect } from 'react';
import { useInventoryReport } from '../../../contexts/InventoryReportContext';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';

function fmtNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('vi-VN');
}

export default function TopIngredients() {
  const { fetchTopIngredients, topIngredients, loading, error } = useInventoryReport();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    fetchTopIngredients(params);
  }, [dateFrom, dateTo, fetchTopIngredients]);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => window.history.back()}>Báo cáo kho</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Top nguyên liệu</span>
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

        {loading && !topIngredients.length ? (
          <div className="text-center py-12 text-muted">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-12 text-danger">{error}</div>
        ) : topIngredients.length === 0 ? (
          <div className="text-center py-12 text-muted">Không có dữ liệu</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full" style={{ minWidth: '500px' }}>
              <thead>
                <tr className="text-xs font-semibold text-muted border-b border-soft">
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Nguyên liệu</th>
                  <th className="text-right p-3">Nhập</th>
                  <th className="text-right p-3">Xuất</th>
                  <th className="text-right p-3">Net</th>
                </tr>
              </thead>
              <tbody>
                {topIngredients.map((item, i) => (
                  <tr key={item.ingredientId} className="border-b border-soft/50">
                    <td className="p-3 text-sm text-muted">{i + 1}</td>
                    <td className="p-3 text-sm font-semibold">{item.name}</td>
                    <td className="p-3 text-sm text-right text-success">+{fmtNumber(item.imported)}</td>
                    <td className="p-3 text-sm text-right text-danger">-{fmtNumber(item.exported)}</td>
                    <td className="p-3 text-sm text-right font-semibold">
                      <span style={{ color: item.net > 0 ? '#10b981' : item.net < 0 ? '#ef4444' : '#6b7280' }}>
                        {item.net > 0 ? '+' : ''}{fmtNumber(item.net)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}