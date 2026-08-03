import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryAdjustment } from '../../../contexts/InventoryAdjustmentContext';
import { Plus, Search, Eye, Edit3, CheckCircle, XCircle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import ResponsiveTable from '../../../components/ui/ResponsiveTable';
import FilterPopover from '../../../components/ui/FilterPopover';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#10b981', bg: '#ecfdf5' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

export default function AdjustmentList() {
  const navigate = useNavigate();
  const { adjustments, loading, error, fetchAdjustments, confirm, cancel } = useInventoryAdjustment();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const filtered = useMemo(() => {
    return adjustments.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || r.code?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [adjustments, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: adjustments.length,
      draft: adjustments.filter((r) => r.status === 'DRAFT').length,
      confirmed: adjustments.filter((r) => r.status === 'CONFIRMED').length,
      cancelled: adjustments.filter((r) => r.status === 'CANCELLED').length,
    };
  }, [adjustments]);

  const handleConfirm = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận phiếu điều chỉnh? Sau khi xác nhận, tồn kho sẽ được cập nhật.')) return;
    try {
      await confirm(id);
      toast.success('Đã xác nhận và cập nhật tồn kho');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    const r = adjustments.find((x) => x.id === id);
    if (!r) return;
    if (!window.confirm(`Hủy phiếu điều chỉnh ${r.code}?`)) return;
    try {
      await cancel(id);
      toast.success('Đã hủy phiếu điều chỉnh');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Điều chỉnh kho</h2>
            <p className="text-muted text-sm">Quản lý các phiếu điều chỉnh tồn kho nguyên liệu</p>
          </div>
          <button
            className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/inventory/adjustments/create')}
          >
            <Plus size={18} /> Tạo phiếu điều chỉnh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold text-main">{stats.total}</div>
            <div className="text-xs text-muted">Tổng phiếu</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#6b7280' }}>{stats.draft}</div>
            <div className="text-xs text-muted">Phiếu nháp</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.confirmed}</div>
            <div className="text-xs text-muted">Đã xác nhận</div>
          </div>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <FilterPopover
            filters={[
              {
                key: 'status',
                label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
                ],
              },
            ]}
            activeFilters={{ status: filterStatus }}
            onFilterChange={(key, value) => {
              if (key === 'status') setFilterStatus(value);
            }}
            onClearAll={() => setFilterStatus('')}
          />
          <div className="relative flex-1 min-w-0" style={{ minWidth: '200px' }}>
            <Search
              size={18}
              className="text-muted absolute"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Tìm mã phiếu, lý do..."
              className="w-full pl-10 h-36px"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="text-danger text-sm">{error}</div>}

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Ngày điều chỉnh</th>
                  <th>Lý do</th>
                  <th className="hidden md:table-cell">Số mặt hàng</th>
                  <th className="hidden md:table-cell">Người tạo</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.DRAFT;
                  return (
                    <tr
                      key={r.id}
                      className="cursor-pointer transition hover-bg-primary-light"
                      onClick={() => navigate(`/inventory/adjustments/${r.id}`)}
                    >
                      <td className="whitespace-nowrap font-semibold">{r.code}</td>
                      <td className="whitespace-nowrap">{fmtDate(r.adjustmentDate)}</td>
                      <td className="text-sm max-w-200px truncate">{r.reason}</td>
                      <td className="hidden md:table-cell text-sm">{r.items?.length || 0}</td>
                      <td className="hidden md:table-cell text-sm text-muted">{r.createdByName}</td>
                      <td>
                        <span className="badge text-xs" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 text-muted hover-text-primary cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/inventory/adjustments/${r.id}`);
                            }}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          {r.status === 'DRAFT' && (
                            <>
                              <button
                                className="p-1.5 text-muted hover-text-primary cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/inventory/adjustments/${r.id}/edit`);
                                }}
                                title="Sửa"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="p-1.5 text-blue-500 hover-text-blue-700 cursor-pointer"
                                onClick={(e) => handleConfirm(e, r.id)}
                                title="Xác nhận"
                              >
                                <CheckCircle size={16} />
                              </button>
                            </>
                          )}
                          {r.status !== 'CANCELLED' && r.status !== 'CONFIRMED' && (
                            <button
                              className="p-1.5 text-danger hover-text-danger/80 cursor-pointer"
                              onClick={(e) => handleCancel(e, r.id)}
                              title="Hủy"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-8">
                      Không tìm thấy phiếu điều chỉnh kho
                    </td>
                  </tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
