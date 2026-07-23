import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryExport, EXPORT_TYPES, EXPORT_TYPE_LABELS } from '../../../contexts/InventoryExportContext';
import { Plus, Search, Eye, Edit3, CheckCircle, XCircle, LogOut, ArrowRightLeft } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import ResponsiveTable from '../../../components/ui/ResponsiveTable';
import FilterPopover from '../../../components/ui/FilterPopover';
import { BRANCHES } from '../../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  draft: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  exported: { label: 'Đã xuất kho', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

const EXPORT_ICONS = {
  USE: '📦',
  DISPOSAL: '🗑️',
  TRANSFER: '🔄',
  OTHER: '📋',
};

export default function ExportReceiptList() {
  const navigate = useNavigate();
  const { exports, confirmExport, executeExport, cancelExport } = useInventoryExport();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterExportType, setFilterExportType] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const filtered = useMemo(() => {
    return exports.filter(r => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || r.code.toLowerCase().includes(q) || r.branchName.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchType = !filterExportType || r.exportType === filterExportType;
      const matchBranch = !filterBranch || r.branchId === filterBranch;
      return matchSearch && matchStatus && matchType && matchBranch;
    });
  }, [exports, searchTerm, filterStatus, filterExportType, filterBranch]);

  const stats = useMemo(() => {
    return {
      total: exports.length,
      draft: exports.filter(r => r.status === 'draft').length,
      confirmed: exports.filter(r => r.status === 'confirmed').length,
      exported: exports.filter(r => r.status === 'exported').length,
    };
  }, [exports]);

  const handleConfirm = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận phiếu xuất này?')) return;
    confirmExport(id);
    toast.success('Đã xác nhận phiếu xuất');
  };

  const handleExport = async (e, id) => {
    e.stopPropagation();
    const r = exports.find(x => x.id === id);
    if (!r) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xuất kho?\nSau khi thực hiện, tồn kho sẽ được cập nhật và phiếu không thể chỉnh sửa.`)) return;
    try {
      await executeExport(id);
      toast.success('Đã xuất kho thành công');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = (e, id) => {
    e.stopPropagation();
    const r = exports.find(x => x.id === id);
    if (!r) return;
    if (r.status === 'exported') {
      toast.error('Không thể hủy phiếu đã xuất kho');
      return;
    }
    if (!window.confirm(`Hủy phiếu xuất ${r.code}?`)) return;
    cancelExport(id);
    toast.success('Đã hủy phiếu xuất');
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Xuất kho</h2>
            <p className="text-muted text-sm">Quản lý các phiếu xuất nguyên liệu và hàng hóa</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/inventory/exports/create')}>
            <Plus size={18} /> Tạo phiếu xuất
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold text-main">{stats.total}</div>
            <div className="text-xs text-muted">Tổng phiếu</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#6b7280' }}>{stats.draft}</div>
            <div className="text-xs text-muted">Phiếu nháp</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{stats.confirmed}</div>
            <div className="text-xs text-muted">Chờ xuất</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.exported}</div>
            <div className="text-xs text-muted">Đã xuất</div>
          </div>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <FilterPopover
            filters={[
              {
                key: 'status', label: 'Trạng thái',
                options: [
                  { value: '', label: 'Tất cả trạng thái' },
                  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
                ],
              },
              {
                key: 'exportType', label: 'Loại xuất',
                options: [
                  { value: '', label: 'Tất cả loại' },
                  ...EXPORT_TYPES.map(t => ({ value: t.value, label: t.label })),
                ],
              },
              {
                key: 'branch', label: 'Kho/Chi nhánh',
                options: [
                  { value: '', label: 'Tất cả chi nhánh' },
                  ...BRANCHES.map(b => ({ value: b.id, label: b.name })),
                ],
              },
            ]}
            activeFilters={{ status: filterStatus, exportType: filterExportType, branch: filterBranch }}
            onFilterChange={(key, value) => {
              if (key === 'status') setFilterStatus(value);
              if (key === 'exportType') setFilterExportType(value);
              if (key === 'branch') setFilterBranch(value);
            }}
            onClearAll={() => { setFilterStatus(''); setFilterExportType(''); setFilterBranch(''); }}
          />
          <div className="relative flex-1 min-w-0" style={{ minWidth: '200px' }}>
            <Search size={18} className="text-muted absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Tìm mã phiếu, kho/chi nhánh..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Ngày xuất</th>
                  <th>Loại xuất</th>
                  <th className="hidden md:table-cell">Kho xuất</th>
                  <th className="hidden md:table-cell">Kho nhận</th>
                  <th className="hidden md:table-cell">Số mặt hàng</th>
                  <th className="hidden md:table-cell">Tổng SL</th>
                  <th className="hidden md:table-cell">Người tạo</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
                  const typeLabel = EXPORT_TYPE_LABELS[r.exportType] || r.exportType;
                  return (
                    <tr key={r.id} className="cursor-pointer transition hover-bg-primary-light"
                      onClick={() => navigate(`/inventory/exports/${r.id}`)}>
                      <td className="whitespace-nowrap font-semibold">{r.code}</td>
                      <td className="whitespace-nowrap">{r.date}</td>
                      <td>
                        <span className="badge badge-neutral text-xs">{typeLabel}</span>
                      </td>
                      <td className="hidden md:table-cell text-sm text-muted">{r.branchName}</td>
                      <td className="hidden md:table-cell text-sm text-muted">
                        {r.exportType === 'TRANSFER' && r.toBranchName ? (
                          <span className="flex items-center gap-1">
                            <ArrowRightLeft size={12} className="text-primary" />
                            {r.toBranchName}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="hidden md:table-cell text-sm">{r.totalItems}</td>
                      <td className="hidden md:table-cell text-sm">{r.totalQuantity}</td>
                      <td className="hidden md:table-cell text-sm text-muted">{r.createdBy}</td>
                      <td>
                        <span className="badge font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                            onClick={e => { e.stopPropagation(); navigate(`/inventory/exports/${r.id}`); }}
                            title="Xem chi tiết">
                            <Eye size={16} />
                          </button>
                          {r.status === 'draft' && (
                            <>
                              <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                                onClick={e => { e.stopPropagation(); navigate(`/inventory/exports/${r.id}/edit`); }}
                                title="Sửa">
                                <Edit3 size={16} />
                              </button>
                              <button className="p-1.5 text-blue-500 hover-text-blue-700 cursor-pointer"
                                onClick={e => handleConfirm(e, r.id)}
                                title="Xác nhận">
                                <CheckCircle size={16} />
                              </button>
                            </>
                          )}
                          {r.status === 'confirmed' && (
                            <button className="p-1.5 text-orange-500 hover-text-orange-700 cursor-pointer"
                              onClick={e => handleExport(e, r.id)}
                              title="Xuất kho">
                              <LogOut size={16} />
                            </button>
                          )}
                          {r.status !== 'exported' && r.status !== 'cancelled' && (
                            <button className="p-1.5 text-danger hover-text-danger/80 cursor-pointer"
                              onClick={e => handleCancel(e, r.id)}
                              title="Hủy">
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted py-8">Không tìm thấy phiếu xuất kho</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
