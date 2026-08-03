import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryTransfer } from '../../../contexts/InventoryTransferContext';
import { Plus, Search, Eye, Edit3, CheckCircle, ArrowRight, XCircle, Trash2 } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#10b981', bg: '#ecfdf5' },
  TRANSFERRED: { label: 'Đã chuyển', color: '#06b6d4', bg: '#ecfeff' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

export default function TransferList() {
  const navigate = useNavigate();
  const { transfers, loading, error, fetchTransfers, confirm, executeTransfer, cancel, remove } = useInventoryTransfer();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || t.code?.toLowerCase().includes(q);
      const matchStatus = !filterStatus || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [transfers, searchTerm, filterStatus]);

  const stats = useMemo(() => ({
    total: transfers.length,
    draft: transfers.filter((t) => t.status === 'DRAFT').length,
    confirmed: transfers.filter((t) => t.status === 'CONFIRMED').length,
    transferred: transfers.filter((t) => t.status === 'TRANSFERRED').length,
  }), [transfers]);

  const handleConfirm = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận phiếu chuyển kho?')) return;
    try {
      await confirm(id);
      toast.success('Đã xác nhận phiếu chuyển kho');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTransfer = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Thực hiện chuyển kho? Hành động này không thể hoàn tác.')) return;
    try {
      await executeTransfer(id);
      toast.success('Đã thực hiện chuyển kho');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    const t = transfers.find((x) => x.id === id);
    if (!t) return;
    if (!window.confirm(`Hủy phiếu chuyển kho ${t.code}?`)) return;
    try {
      await cancel(id);
      toast.success('Đã hủy phiếu chuyển kho');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const t = transfers.find((x) => x.id === id);
    if (!t) return;
    if (!window.confirm(`Xóa phiếu chuyển kho ${t.code}?`)) return;
    try {
      await remove(id);
      toast.success('Đã xóa phiếu chuyển kho');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Chuyển kho</h2>
            <p className="text-muted text-sm">Quản lý các phiếu chuyển kho nội bộ</p>
          </div>
          <button
            className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/inventory/transfers/create')}
          >
            <Plus size={18} /> Tạo phiếu chuyển kho
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold text-main">{stats.total}</div>
            <div className="text-xs text-muted">Tổng phiếu</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#6b7280' }}>{stats.draft}</div>
            <div className="text-xs text-muted">Nháp</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.confirmed}</div>
            <div className="text-xs text-muted">Đã xác nhận</div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <div className="text-2xl font-bold" style={{ color: '#06b6d4' }}>{stats.transferred}</div>
            <div className="text-xs text-muted">Đã chuyển</div>
          </div>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0" style={{ minWidth: '200px' }}>
            <Search
              size={18}
              className="text-muted absolute"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Tìm mã phiếu..."
              className="w-full pl-10 h-36px"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="modal-input text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {error && <div className="text-danger text-sm">{error}</div>}

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-muted border-b border-soft">
                  <th className="text-left p-3">Mã phiếu</th>
                  <th className="text-left p-3">Ngày chuyển</th>
                  <th className="text-left p-3">Ghi chú</th>
                  <th className="text-left p-3">Người tạo</th>
                  <th className="text-center p-3">Trạng thái</th>
                  <th className="text-right p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.DRAFT;
                  return (
                    <tr
                      key={t.id}
                      className="cursor-pointer transition hover-bg-primary-light"
                      onClick={() => navigate(`/inventory/transfers/${t.id}`)}
                    >
                      <td className="p-3 text-sm whitespace-nowrap font-semibold">{t.code}</td>
                      <td className="p-3 text-sm whitespace-nowrap">{fmtDate(t.transferDate)}</td>
                      <td className="p-3 text-sm text-muted truncate" style={{ maxWidth: '200px' }}>{t.note || '—'}</td>
                      <td className="p-3 text-sm text-muted">{t.createdByName}</td>
                      <td className="p-3 text-center">
                        <span className="badge text-xs" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 text-muted hover-text-primary cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); navigate(`/inventory/transfers/${t.id}`); }}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          {t.status === 'DRAFT' && (
                            <>
                              <button
                                className="p-1.5 text-muted hover-text-primary cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); navigate(`/inventory/transfers/${t.id}/edit`); }}
                                title="Sửa"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="p-1.5 text-blue-500 hover-text-blue-700 cursor-pointer"
                                onClick={(e) => handleConfirm(e, t.id)}
                                title="Xác nhận"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                className="p-1.5 text-danger hover-text-danger/80 cursor-pointer"
                                onClick={(e) => handleDelete(e, t.id)}
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {t.status === 'CONFIRMED' && (
                            <>
                              <button
                                className="p-1.5 text-success hover-text-success/80 cursor-pointer"
                                onClick={(e) => handleTransfer(e, t.id)}
                                title="Thực hiện chuyển"
                              >
                                <ArrowRight size={16} />
                              </button>
                              <button
                                className="p-1.5 text-danger hover-text-danger/80 cursor-pointer"
                                onClick={(e) => handleCancel(e, t.id)}
                                title="Hủy"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-8">
                      Không tìm thấy phiếu chuyển kho
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}