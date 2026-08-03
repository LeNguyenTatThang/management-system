import { useState, useEffect } from 'react';
import { useInventoryReport } from '../../../contexts/InventoryReportContext';
import { ArrowLeft, Package, AlertTriangle, XCircle, ArrowDownUp, TrendingUp, TrendingDown, RefreshCw, ClipboardCheck } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

function fmtNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('vi-VN');
}

function StatCard({ icon: Icon, label, value, color = '#10b981', bgColor = '#ecfdf5' }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bgColor }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted">{label}</div>
          <div className="text-xl font-bold">{fmtNumber(value)}</div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryReportDashboard() {
  const { fetchSummary, summary, loading, error } = useInventoryReport();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    fetchSummary(params);
  }, [dateFrom, dateTo, fetchSummary]);

  const handleRefresh = () => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    fetchSummary(params);
    toast.success('Đã làm mới dữ liệu');
  };

  if (error) {
    return (
      <PageContainer>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted mb-6">
            <button className="hover-text-primary cursor-pointer" onClick={() => window.history.back()}>Báo cáo kho</button>
          </div>
          <div className="p-6 text-center text-danger">{error}</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Báo cáo kho</h1>
            <p className="text-muted text-sm mt-1">Tổng quan tình trạng kho hàng</p>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted">Từ ngày:</label>
            <input
              type="date"
              className="modal-input text-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted">Đến ngày:</label>
            <input
              type="date"
              className="modal-input text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {loading && !summary ? (
          <div className="flex items-center justify-center py-12 text-muted">
            <RefreshCw size={24} className="animate-spin mr-2" /> Đang tải...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Package} label="Tổng nguyên liệu" value={summary?.totalIngredients} color="#6366f1" bgColor="#eef2ff" />
              <StatCard icon={Package} label="Tồn kho thấp" value={summary?.lowStockCount} color="#f59e0b" bgColor="#fffbeb" />
              <StatCard icon={XCircle} label="Hết hàng" value={summary?.outOfStockCount} color="#ef4444" bgColor="#fef2f2" />
              <StatCard icon={ArrowDownUp} label="Tổng nhập" value={summary?.totalImportedQuantity} color="#10b981" bgColor="#ecfdf5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={TrendingDown} label="Tổng xuất" value={summary?.totalExportedQuantity} color="#ef4444" bgColor="#fef2f2" />
              <StatCard icon={RefreshCw} label="Tổng điều chỉnh" value={summary?.totalAdjustedQuantity} color="#8b5cf6" bgColor="#f5f3ff" />
              <StatCard icon={Package} label="Phiếu nhập" value={summary?.importCount} color="#10b981" bgColor="#ecfdf5" />
              <StatCard icon={Package} label="Phiếu xuất" value={summary?.exportCount} color="#ef4444" bgColor="#fef2f2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={RefreshCw} label="Phiếu điều chỉnh" value={summary?.adjustmentCount} color="#8b5cf6" bgColor="#f5f3ff" />
              <StatCard icon={ClipboardCheck} label="Phiếu kiểm kê" value={summary?.stocktakeCount} color="#06b6d4" bgColor="#ecfeff" />
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}