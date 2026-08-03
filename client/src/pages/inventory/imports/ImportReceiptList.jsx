import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImportReceipt } from '../../../contexts/ImportReceiptContext';
import { Plus, Search, Edit3, CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import ResponsiveTable from '../../../components/ui/ResponsiveTable';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  RECEIVED: { label: 'Đã nhập kho', color: '#10b981', bg: '#ecfdf5' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

function fmtMoney(amount) {
  return (amount || 0).toLocaleString('vi-VN') + ' ₫';
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

export default function ImportReceiptList() {
  const navigate = useNavigate();
  const { imports, loading, error, fetchImports, confirm, receive, cancel } = useImportReceipt();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  const filtered = imports.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || r.code.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleConfirm = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận phiếu nhập này?')) return;
    try {
      await confirm(id);
      toast.success('Đã xác nhận phiếu nhập');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReceive = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận đã nhập kho? Hàng hóa sẽ được cộng vào tồn kho.')) return;
    try {
      await receive(id);
      toast.success('Đã nhập kho thành công');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Hủy phiếu nhập này?')) return;
    try {
      await cancel(id);
      toast.success('Đã hủy phiếu nhập');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Nhập kho</h2>
            <p className="text-muted text-sm">Quản lý các phiếu nhập hàng và nguyên liệu</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/inventory/imports/create')}>
            <Plus size={18} /> Tạo phiếu nhập
          </button>
        </div>

        <div className="card p-3 min-w-0 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
                className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition"
                style={{
                  backgroundColor: filterStatus === key ? cfg.color : cfg.bg,
                  color: filterStatus === key ? '#fff' : cfg.color,
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0" style={{ minWidth: '200px' }}>
            <Search size={18} className="text-muted absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Tìm mã phiếu..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {error && <div className="text-danger text-sm">{error}</div>}

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Ngày nhập</th>
                  <th className="hidden md:table-cell">Tổng tiền</th>
                  <th className="hidden md:table-cell">Người tạo</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="cursor-pointer transition hover-bg-primary-light"
                    onClick={() => navigate(`/inventory/imports/${r.id}`)}>
                    <td className="whitespace-nowrap font-semibold">{r.code}</td>
                    <td className="whitespace-nowrap">{fmtDate(r.importDate)}</td>
                    <td className="hidden md:table-cell text-sm font-semibold">
                      {fmtMoney(r.items?.reduce((s, i) => s + (i.amount || 0), 0))}
                    </td>
                    <td className="hidden md:table-cell text-sm text-muted">{r.createdByName}</td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'DRAFT' && (
                          <>
                            <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                              onClick={e => { e.stopPropagation(); navigate(`/inventory/imports/${r.id}/edit`); }}
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
                        {r.status === 'CONFIRMED' && (
                          <button className="p-1.5 text-green-500 hover-text-green-700 cursor-pointer"
                            onClick={e => handleReceive(e, r.id)}
                            title="Nhập kho">
                            <PackageCheck size={16} />
                          </button>
                        )}
                        {r.status !== 'RECEIVED' && r.status !== 'CANCELLED' && (
                          <button className="p-1.5 text-danger hover-text-danger/80 cursor-pointer"
                            onClick={e => handleCancel(e, r.id)}
                            title="Hủy">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={5} className="text-center text-muted py-8">Không tìm thấy phiếu nhập kho</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
