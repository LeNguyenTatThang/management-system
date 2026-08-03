import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStockLedger, MOVEMENT_TYPES, MOVEMENT_TYPE_LABELS, MOVEMENT_DIRECTIONS, MOVEMENT_DIRECTION_LABELS, REFERENCE_TYPES, REFERENCE_TYPE_LABELS } from '../../../contexts/StockLedgerContext';
import { Search, Eye, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import ResponsiveTable from '../../../components/ui/ResponsiveTable';
import FilterPopover from '../../../components/ui/FilterPopover';

function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function StockLedgerList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { movements, loading, error, pagination, summary, fetchMovements, fetchSummary } = useStockLedger();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterReferenceType, setFilterReferenceType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [page, setPage] = useState(1);

  const ingredientIdFilter = searchParams.get('ingredientId');

  useEffect(() => {
    fetchMovements({
      ingredientId: ingredientIdFilter || undefined,
      type: filterType || undefined,
      direction: filterDirection || undefined,
      referenceType: filterReferenceType || undefined,
      keyword: searchTerm || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
      page,
      limit: 50,
    });
  }, [fetchMovements, ingredientIdFilter, filterType, filterDirection, filterReferenceType, searchTerm, filterDateFrom, filterDateTo, page]);

  useEffect(() => {
    fetchSummary({
      ingredientId: ingredientIdFilter || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    });
  }, [fetchSummary, ingredientIdFilter, filterDateFrom, filterDateTo]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterDirection('');
    setFilterReferenceType('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setPage(1);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Biến động kho</h2>
            <p className="text-muted text-sm">
              {ingredientIdFilter ? 'Lịch sử biến động của nguyên liệu' : 'Lịch sử biến động tồn kho tất cả nguyên liệu'}
            </p>
          </div>
          {ingredientIdFilter && (
            <button
              className="btn btn-outline flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
              onClick={() => navigate('/inventory/stock-ledger')}
            >
              <ArrowUpDown size={16} /> Xem tất cả
            </button>
          )}
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="card p-3 flex items-center gap-3">
              <TrendingUp size={20} className="text-green-500" />
              <div>
                <div className="text-lg font-bold text-green-600">{summary.totalImported.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-muted">Tổng nhập</div>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <TrendingDown size={20} className="text-red-500" />
              <div>
                <div className="text-lg font-bold text-red-600">{summary.totalExported.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-muted">Tổng xuất</div>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <TrendingUp size={20} className="text-blue-500" />
              <div>
                <div className="text-lg font-bold text-blue-600">{summary.totalAdjustedIn.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-muted">Điều chỉnh tăng</div>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <TrendingDown size={20} className="text-orange-500" />
              <div>
                <div className="text-lg font-bold text-orange-600">{summary.totalAdjustedOut.toLocaleString('vi-VN')}</div>
                <div className="text-xs text-muted">Điều chỉnh giảm</div>
              </div>
            </div>
            <div className="card p-3 flex items-center gap-3">
              <ArrowUpDown size={20} className="text-main" />
              <div>
                <div className="text-lg font-bold text-main">{summary.movementCount}</div>
                <div className="text-xs text-muted">Tổng giao dịch</div>
              </div>
            </div>
          </div>
        )}

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <FilterPopover
            filters={[
              {
                key: 'type',
                label: 'Loại',
                options: [
                  { value: '', label: 'Tất cả loại' },
                  ...MOVEMENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
                ],
              },
              {
                key: 'direction',
                label: 'Hướng',
                options: [
                  { value: '', label: 'Tất cả hướng' },
                  ...MOVEMENT_DIRECTIONS.map((d) => ({ value: d.value, label: d.label })),
                ],
              },
              {
                key: 'referenceType',
                label: 'Nguồn',
                options: [
                  { value: '', label: 'Tất cả nguồn' },
                  ...REFERENCE_TYPES.map((r) => ({ value: r.value, label: r.label })),
                ],
              },
            ]}
            activeFilters={{ type: filterType, direction: filterDirection, referenceType: filterReferenceType }}
            onFilterChange={(key, value) => {
              if (key === 'type') setFilterType(value);
              if (key === 'direction') setFilterDirection(value);
              if (key === 'referenceType') setFilterReferenceType(value);
            }}
            onClearAll={handleClearFilters}
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="modal-input text-sm h-36px"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              placeholder="Từ ngày"
            />
            <span className="text-muted text-sm">—</span>
            <input
              type="date"
              className="modal-input text-sm h-36px"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              placeholder="Đến ngày"
            />
          </div>
          <div className="relative flex-1 min-w-0" style={{ minWidth: '200px' }}>
            <Search
              size={18}
              className="text-muted absolute"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Tìm mã phiếu, nguyên liệu..."
              className="w-full pl-10 h-36px"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {error && <div className="text-danger text-sm">{error}</div>}

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Nguyên liệu</th>
                  <th>Loại</th>
                  <th>Hướng</th>
                  <th className="text-right">Số lượng</th>
                  <th className="text-right">Tồn trước</th>
                  <th className="text-right">Tồn sau</th>
                  <th className="hidden md:table-cell">Phiếu</th>
                  <th className="hidden md:table-cell">Người thực hiện</th>
                  <th className="text-center" style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr
                    key={m.id}
                    className="cursor-pointer transition hover-bg-primary-light"
                    onClick={() => navigate(`/inventory/stock-ledger/${m.id}`)}
                  >
                    <td className="whitespace-nowrap text-sm">{fmtDateTime(m.createdAt)}</td>
                    <td className="font-semibold text-sm">{m.ingredient?.name}</td>
                    <td>
                      <span className="badge badge-neutral text-xs">{MOVEMENT_TYPE_LABELS[m.type] || m.type}</span>
                    </td>
                    <td>
                      <span
                        className="badge text-xs"
                        style={{
                          backgroundColor: m.direction === 'IN' ? '#ecfdf5' : '#fef2f2',
                          color: m.direction === 'IN' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {m.direction === 'IN' ? '+' : '-'}{MOVEMENT_DIRECTION_LABELS[m.direction]}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-sm">{Number(m.quantity).toLocaleString('vi-VN')}</td>
                    <td className="text-right text-sm text-muted">{Number(m.stockBefore).toLocaleString('vi-VN')}</td>
                    <td className="text-right text-sm font-semibold">{Number(m.stockAfter).toLocaleString('vi-VN')}</td>
                    <td className="hidden md:table-cell text-sm">{m.referenceCode || '—'}</td>
                    <td className="hidden md:table-cell text-sm text-muted">{m.performedBy?.name || '—'}</td>
                    <td className="text-center">
                      <Eye size={14} className="text-muted" />
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} className="text-center text-muted py-8">
                      Không tìm thấy biến động kho
                    </td>
                  </tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-soft">
              <div className="text-sm text-muted">
                Trang {pagination.page}/{pagination.totalPages} — {pagination.total} bản ghi
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-outline text-xs px-3 py-1.5"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </button>
                <button
                  className="btn btn-outline text-xs px-3 py-1.5"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
