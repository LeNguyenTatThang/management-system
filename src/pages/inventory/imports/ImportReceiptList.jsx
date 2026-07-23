import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImportReceipt } from '../../../contexts/ImportReceiptContext';
import { useSupplier } from '../../../contexts/SupplierContext';
import { Plus, Search, Eye, Edit3, CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import ResponsiveTable from '../../../components/ui/ResponsiveTable';
import FilterPopover from '../../../components/ui/FilterPopover';
import { BRANCHES } from '../../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  draft: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  received: { label: 'Đã nhập kho', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

const STATUS_LABELS = {};
Object.entries(STATUS_CONFIG).forEach(([k, v]) => { STATUS_LABELS[k] = v.label; });

function fmtMoney(amount) {
  return (amount || 0).toLocaleString('vi-VN') + ' ₫';
}

export default function ImportReceiptList() {
  const navigate = useNavigate();
  const { imports, confirmImport, receiveImport, cancelImport } = useImportReceipt();
  const { suppliers } = useSupplier();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const filtered = useMemo(() => {
    return imports.filter(r => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || r.code.toLowerCase().includes(q) || r.supplierName.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.status === filterStatus;
      const matchSupplier = !filterSupplier || r.supplierId === filterSupplier;
      const matchBranch = !filterBranch || r.branchId === filterBranch;
      return matchSearch && matchStatus && matchSupplier && matchBranch;
    });
  }, [imports, searchTerm, filterStatus, filterSupplier, filterBranch]);

  const handleConfirm = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận phiếu nhập này?')) return;
    confirmImport(id);
    toast.success('Đã xác nhận phiếu nhập');
  };

  const handleReceive = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận đã nhập kho? Hàng hóa sẽ được cộng vào tồn kho.')) return;
    receiveImport(id);
    toast.success('Đã nhập kho thành công');
  };

  const handleCancel = (e, id) => {
    e.stopPropagation();
    const r = imports.find(x => x.id === id);
    if (!r) return;
    if (r.status === 'received') {
      toast.error('Không thể hủy phiếu đã nhập kho');
      return;
    }
    if (!window.confirm(`Hủy phiếu nhập ${r.code}?`)) return;
    cancelImport(id);
    toast.success('Đã hủy phiếu nhập');
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
                key: 'supplier', label: 'Nhà cung cấp',
                options: [
                  { value: '', label: 'Tất cả NCC' },
                  ...suppliers.map(s => ({ value: s.id, label: s.name })),
                ],
              },
              {
                key: 'branch', label: 'Chi nhánh/Kho',
                options: [
                  { value: '', label: 'Tất cả chi nhánh' },
                  ...BRANCHES.map(b => ({ value: b.id, label: b.name })),
                ],
              },
            ]}
            activeFilters={{ status: filterStatus, supplier: filterSupplier, branch: filterBranch }}
            onFilterChange={(key, value) => {
              if (key === 'status') setFilterStatus(value);
              if (key === 'supplier') setFilterSupplier(value);
              if (key === 'branch') setFilterBranch(value);
            }}
            onClearAll={() => { setFilterStatus(''); setFilterSupplier(''); setFilterBranch(''); }}
          />
          <div className="relative flex-1 min-w-0" style={{ minWidth: '200px' }}>
            <Search size={18} className="text-muted absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Tìm mã phiếu, nhà cung cấp..." className="w-full pl-10 h-36px"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <ResponsiveTable>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Ngày nhập</th>
                  <th>Nhà cung cấp</th>
                  <th className="hidden md:table-cell">Kho/Chi nhánh</th>
                  <th className="hidden md:table-cell">Số mặt hàng</th>
                  <th className="hidden md:table-cell">Tổng tiền</th>
                  <th className="hidden md:table-cell">Người tạo</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={r.id} className="cursor-pointer transition hover-bg-primary-light"
                      onClick={() => navigate(`/inventory/imports/${r.id}`)}>
                      <td className="whitespace-nowrap font-semibold">{r.code}</td>
                      <td className="whitespace-nowrap">{r.date}</td>
                      <td className="text-sm">{r.supplierName}</td>
                      <td className="hidden md:table-cell text-sm text-muted">{r.branchName}</td>
                      <td className="hidden md:table-cell text-sm">{r.totalItems}</td>
                      <td className="hidden md:table-cell text-sm font-semibold">{fmtMoney(r.totalAmount)}</td>
                      <td className="hidden md:table-cell text-sm text-muted">{r.createdBy}</td>
                      <td>
                        <span className="badge font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-muted hover-text-primary cursor-pointer"
                            onClick={e => { e.stopPropagation(); navigate(`/inventory/imports/${r.id}`); }}
                            title="Xem chi tiết">
                            <Eye size={16} />
                          </button>
                          {r.status === 'draft' && (
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
                          {r.status === 'confirmed' && (
                            <button className="p-1.5 text-green-500 hover-text-green-700 cursor-pointer"
                              onClick={e => handleReceive(e, r.id)}
                              title="Nhập kho">
                              <PackageCheck size={16} />
                            </button>
                          )}
                          {r.status !== 'received' && r.status !== 'cancelled' && (
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
                  <tr><td colSpan={9} className="text-center text-muted py-8">Không tìm thấy phiếu nhập kho</td></tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
