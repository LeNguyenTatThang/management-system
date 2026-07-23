import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryExport, EXPORT_TYPE_LABELS } from '../../../contexts/InventoryExportContext';
import { ArrowLeft, Calendar, MapPin, User, FileText, Package, Edit3, CheckCircle, XCircle, LogOut, ArrowRightLeft } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import { BRANCHES } from '../../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  draft: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  exported: { label: 'Đã xuất kho', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

const STATUS_ORDER = ['draft', 'confirmed', 'exported'];

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function ExportReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getExportById, confirmExport, executeExport, cancelExport } = useInventoryExport();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const r = getExportById(id);
    if (!r) {
      toast.error('Không tìm thấy phiếu xuất');
      navigate('/inventory/exports');
      return;
    }
    setReceipt(r);
  }, [id, getExportById, navigate]);

  if (!receipt) return null;

  const cfg = STATUS_CONFIG[receipt.status] || STATUS_CONFIG.draft;
  const branchName = BRANCHES.find(b => b.id === receipt.branchId)?.name || receipt.branchName;
  const toBranchName = BRANCHES.find(b => b.id === receipt.toBranchId)?.name || receipt.toBranchName;
  const typeLabel = EXPORT_TYPE_LABELS[receipt.exportType] || receipt.exportType;

  const handleConfirm = () => {
    if (!window.confirm('Xác nhận phiếu xuất này?')) return;
    confirmExport(receipt.id);
    toast.success('Đã xác nhận phiếu xuất');
    setReceipt(prev => ({ ...prev, status: 'confirmed', confirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  };

  const handleExport = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xuất kho?\nSau khi thực hiện, tồn kho sẽ được cập nhật và phiếu không thể chỉnh sửa.')) return;
    try {
      await executeExport(receipt.id);
      toast.success('Đã xuất kho thành công');
      const r = getExportById(receipt.id);
      if (r) setReceipt(r);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = () => {
    if (receipt.status === 'exported') {
      toast.error('Không thể hủy phiếu đã xuất kho');
      return;
    }
    if (!window.confirm(`Hủy phiếu xuất ${receipt.code}?`)) return;
    cancelExport(receipt.id);
    toast.success('Đã hủy phiếu xuất');
    setReceipt(prev => ({ ...prev, status: 'cancelled', cancelledAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/exports')}>Xuất kho</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Chi tiết</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/inventory/exports')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Phiếu xuất {receipt.code}</h1>
            <p className="text-muted text-sm mt-1">{receipt.date} &middot; {typeLabel}</p>
          </div>
          <span className="badge font-semibold mt-2" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div className="card mb-5">
          <h3 className="font-bold text-base mb-4">THÔNG TIN CHUNG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={Calendar} label="Mã phiếu" value={receipt.code} />
            <InfoRow icon={Calendar} label="Ngày xuất" value={receipt.date} />
            <InfoRow icon={MapPin} label="Loại xuất" value={typeLabel} />
            <InfoRow icon={MapPin} label="Kho xuất" value={branchName} />
            {receipt.exportType === 'TRANSFER' && (
              <InfoRow icon={ArrowRightLeft} label="Kho nhận" value={toBranchName} />
            )}
            <InfoRow icon={User} label="Người tạo" value={receipt.createdBy} />
            <InfoRow icon={Calendar} label="Ngày tạo" value={fmtDateTime(receipt.createdAt)} />
            {receipt.confirmedBy && (
              <InfoRow icon={User} label="Người xác nhận" value={receipt.confirmedBy} />
            )}
            {receipt.exportedBy && (
              <InfoRow icon={LogOut} label="Người xuất" value={receipt.exportedBy} />
            )}
            {receipt.exportedAt && (
              <InfoRow icon={Calendar} label="Thời gian xuất" value={fmtDateTime(receipt.exportedAt)} />
            )}
          </div>
        </div>

        {(receipt.reason || (receipt.exportType === 'DISPOSAL' || receipt.exportType === 'OTHER')) && (
          <div className="card mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base mb-2">LÝ DO</h3>
                <p className="text-sm text-muted whitespace-pre-line">{receipt.reason || '—'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base">DANH SÁCH NGUYÊN LIỆU</h3>
            </div>
          </div>

          {receipt.exportType === 'TRANSFER' && receipt.toBranchName && (
            <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-primary-light">
              <ArrowRightLeft size={20} className="text-primary" />
              <div className="text-sm">
                <span className="font-semibold">{branchName}</span>
                <span className="text-muted mx-2">→</span>
                <span className="font-semibold">{toBranchName}</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-muted border-b border-soft">
                  <th className="text-left p-3">STT</th>
                  <th className="text-left p-3">Nguyên liệu</th>
                  <th className="text-left p-3">ĐVT</th>
                  <th className="text-center p-3">Tồn kho</th>
                  <th className="text-right p-3">SL yêu cầu</th>
                  <th className="text-right p-3">SL thực xuất</th>
                  <th className="text-left p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i} className="border-b border-soft/50">
                    <td className="p-3 text-sm">{i + 1}</td>
                    <td className="p-3 text-sm font-semibold">{item.ingredientName}</td>
                    <td className="p-3 text-sm text-muted">{item.unit}</td>
                    <td className="p-3 text-sm text-center">{item.currentStock ?? '—'}</td>
                    <td className="p-3 text-sm text-right">{item.requestedQuantity}</td>
                    <td className="p-3 text-sm text-right font-semibold">
                      {receipt.status === 'exported' ? item.actualQuantity || item.requestedQuantity : '—'}
                    </td>
                    <td className="p-3 text-sm text-muted">{item.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-soft">
            <div className="text-sm text-muted">
              Số mặt hàng: <span className="font-bold text-main">{receipt.totalItems}</span>
            </div>
            <div className="text-sm text-muted">
              Tổng số lượng: <span className="font-bold text-main">{(receipt.totalQuantity || 0).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {(receipt.confirmedAt || receipt.exportedAt || receipt.cancelledAt) && (
          <div className="card mb-5">
            <h3 className="font-bold text-base mb-4">TIẾN TRÌNH</h3>
            <div className="flex flex-col gap-1">
              {STATUS_ORDER.map((s, i) => {
                const scfg = STATUS_CONFIG[s];
                const idx = STATUS_ORDER.indexOf(receipt.status);
                const done = i <= idx && receipt.status !== 'cancelled';
                const isCancelled = receipt.status === 'cancelled';
                const time = s === 'draft' ? fmtDateTime(receipt.createdAt) : s === 'confirmed' ? fmtDateTime(receipt.confirmedAt) : fmtDateTime(receipt.exportedAt);
                return (
                  <div key={s} className="flex items-center gap-3 py-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCancelled && !done ? 'bg-gray-200' : done ? 'bg-primary' : 'bg-gray-200'}`}>
                      {done ? <CheckCircle size={14} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold ${done ? 'text-primary' : 'text-muted'}`}>{scfg.label}</span>
                      {done && time !== '—' && <span className="text-xs text-muted ml-2">{time}</span>}
                    </div>
                    {i < STATUS_ORDER.length - 1 && !isCancelled && (
                      <div className="w-0.5 h-4 bg-gray-200 ml-3" />
                    )}
                  </div>
                );
              })}
              {receipt.status === 'cancelled' && (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-danger">
                    <XCircle size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-danger">Đã hủy</span>
                    <span className="text-xs text-muted ml-2">{fmtDateTime(receipt.cancelledAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {receipt.note && (
          <div className="card mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base mb-2">GHI CHÚ</h3>
                <p className="text-sm text-muted whitespace-pre-line">{receipt.note}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          {receipt.status === 'draft' && (
            <>
              <button className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger" onClick={handleCancel}>
                <XCircle size={16} /> Hủy phiếu
              </button>
              <button className="btn btn-outline modal-btn px-6 flex items-center gap-2"
                onClick={() => navigate(`/inventory/exports/${receipt.id}/edit`)}>
                <Edit3 size={16} /> Sửa
              </button>
              <button className="btn btn-primary modal-btn px-6 flex items-center gap-2" onClick={handleConfirm}>
                <CheckCircle size={16} /> Xác nhận
              </button>
            </>
          )}
          {receipt.status === 'confirmed' && (
            <>
              <button className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger" onClick={handleCancel}>
                <XCircle size={16} /> Hủy phiếu
              </button>
              <button className="btn btn-primary modal-btn px-6 flex items-center gap-2" onClick={handleExport}
                style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}>
                <LogOut size={16} /> Xuất kho
              </button>
            </>
          )}
          {(receipt.status === 'cancelled' || receipt.status === 'exported') && (
            <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/inventory/exports')}>Quay lại</button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
