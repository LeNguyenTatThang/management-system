import { useState, useEffect } from 'react';
import { useInventoryReport } from '../../../contexts/InventoryReportContext';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';

const STATUS_LABELS = {
  OUT_OF_STOCK: { label: 'Hết hàng', color: '#ef4444', bg: '#fef2f2' },
  LOW_STOCK: { label: 'Tồn kho thấp', color: '#f59e0b', bg: '#fffbeb' },
  OK: { label: 'OK', color: '#10b981', bg: '#ecfdf5' },
};

function fmtNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('vi-VN');
}

export default function LowStockReport() {
  const { fetchLowStockReport, lowStock, loading, error } = useInventoryReport();

  useEffect(() => {
    fetchLowStockReport();
  }, [fetchLowStockReport]);

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => window.history.back()}>Báo cáo kho</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Tồn kho thấp</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        {loading && !lowStock.length ? (
          <div className="text-center py-12 text-muted">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-12 text-danger">{error}</div>
        ) : lowStock.length === 0 ? (
          <div className="text-center py-12 text-muted">Tất cả nguyên liệu đều đủ hàng</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="text-xs font-semibold text-muted border-b border-soft">
                  <th className="text-left p-3">Nguyên liệu</th>
                  <th className="text-right p-3">Tồn hiện tại</th>
                  <th className="text-right p-3">Mức tối thiểu</th>
                  <th className="text-right p-3">Thiếu</th>
                  <th className="text-left p-3">ĐVT</th>
                  <th className="text-center p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => {
                  const status = STATUS_LABELS[item.status] || STATUS_LABELS.OK;
                  return (
                    <tr key={item.ingredientId} className="border-b border-soft/50">
                      <td className="p-3 text-sm font-semibold">{item.name}</td>
                      <td className="p-3 text-sm text-right font-semibold">{fmtNumber(item.currentStock)}</td>
                      <td className="p-3 text-sm text-right">{fmtNumber(item.minimumStock)}</td>
                      <td className="p-3 text-sm text-right font-semibold" style={{ color: item.shortage > 0 ? '#ef4444' : '#6b7280' }}>
                        {fmtNumber(item.shortage)}
                      </td>
                      <td className="p-3 text-sm">{item.unit}</td>
                      <td className="p-3 text-center">
                        <span className="badge text-xs" style={{ backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}