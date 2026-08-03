import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryReport } from '../../../contexts/InventoryReportContext';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function StockMovementReport() {
  const navigate = useNavigate();
  const { fetchMovements, movements, movementPagination, loading, error } = useInventoryReport();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [type, setType] = useState('');
  const [direction, setDirection] = useState('');
  const [referenceType, setReferenceType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const params = { page, limit };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (type) params.type = type;
    if (direction) params.direction = direction;
    if (referenceType) params.referenceType = referenceType;
    if (keyword) params.keyword = keyword;
    fetchMovements(params);
  }, [dateFrom, dateTo, type, direction, referenceType, keyword, page, limit, fetchMovements]);

  const handleFilter = () => {
    setPage(1);
  };

  const handleClear = () => {
    setDateFrom('');
    setDateTo('');
    setType('');
    setDirection('');
    setReferenceType('');
    setKeyword('');
    setPage(1);
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/reports')}>Báo cáo kho</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Biến động kho</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/reports')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="card mb-4 p-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Từ ngày</label>
              <input type="date" className="modal-input text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Đến ngày</label>
              <input type="date" className="modal-input text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Loại</label>
              <select className="modal-input text-sm" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="IMPORT">Nhập kho</option>
                <option value="EXPORT">Xuất kho</option>
                <option value="ADJUSTMENT">Điều chỉnh</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Hướng</label>
              <select className="modal-input text-sm" value={direction} onChange={(e) => setDirection(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="IN">Tăng (IN)</option>
                <option value="OUT">Giảm (OUT)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Chứng từ</label>
              <select className="modal-input text-sm" value={referenceType} onChange={(e) => setReferenceType(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="INVENTORY_IMPORT">Phiếu nhập</option>
                <option value="INVENTORY_EXPORT">Phiếu xuất</option>
                <option value="INVENTORY_ADJUSTMENT">Điều chỉnh</option>
                <option value="INVENTORY_STOCKTAKE">Kiểm kê</option>
              </select>
            </div>
            <div className="flex flex-col gap-1" style={{ minWidth: '180px' }}>
              <label className="text-xs text-muted">Tìm kiếm</label>
              <div className="flex gap-1">
                <input type="text" className="modal-input text-sm flex-1" placeholder="Tên NL, mã chứng từ..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <button className="btn btn-primary modal-btn px-3" onClick={handleFilter}>
                  <Search size={16} />
                </button>
              </div>
            </div>
            <button className="btn btn-outline modal-btn px-3 text-sm" onClick={handleClear}>Xóa bộ lọc</button>
          </div>
        </div>

        {loading && !movements.length ? (
          <div className="text-center py-12 text-muted">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-12 text-danger">{error}</div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12 text-muted">Không có dữ liệu</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold text-muted border-b border-soft">
                    <th className="text-left p-3">Ngày</th>
                    <th className="text-left p-3">Nguyên liệu</th>
                    <th className="text-left p-3">Loại</th>
                    <th className="text-center p-3">IN/OUT</th>
                    <th className="text-right p-3">SL</th>
                    <th className="text-right p-3">Tồn trước</th>
                    <th className="text-right p-3">Tồn sau</th>
                    <th className="text-left p-3">Chứng từ</th>
                    <th className="text-left p-3">Người thực hiện</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-soft/50">
                      <td className="p-3 text-sm whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                      <td className="p-3 text-sm font-semibold">{m.ingredient?.name}</td>
                      <td className="p-3 text-sm">{TYPE_LABELS[m.type] || m.type}</td>
                      <td className="p-3 text-center">
                        <span className="font-semibold" style={{ color: DIRECTION_COLOR[m.direction] }}>
                          {DIRECTION_LABELS[m.direction]}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right font-semibold">{Number(m.quantity).toLocaleString('vi-VN')}</td>
                      <td className="p-3 text-sm text-right">{Number(m.stockBefore).toLocaleString('vi-VN')}</td>
                      <td className="p-3 text-sm text-right">{Number(m.stockAfter).toLocaleString('vi-VN')}</td>
                      <td className="p-3 text-sm">{REFERENCE_TYPE_LABELS[m.referenceType] || m.referenceType} — {m.referenceCode || '—'}</td>
                      <td className="p-3 text-sm">{m.performedBy?.name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted">
                Tổng: {movementPagination.total} | Trang {movementPagination.page}/{movementPagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-outline modal-btn px-3"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="btn btn-outline modal-btn px-3"
                  disabled={page >= movementPagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}