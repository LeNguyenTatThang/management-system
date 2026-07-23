import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useImportReceipt } from '../../../contexts/ImportReceiptContext';
import { ArrowLeft, Calendar, MapPin, Store, User, FileText, Package, Edit3, CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import { BRANCHES } from '../../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  draft: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff' },
  received: { label: 'Đã nhập kho', color: '#10b981', bg: '#ecfdf5' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

const STATUS_ORDER = ['draft', 'confirmed', 'received'];

function fmtMoney(amount) {
  return (amount || 0).toLocaleString('vi-VN') + ' ₫';
}

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

export default function ImportReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getImportById, confirmImport, receiveImport, cancelImport } = useImportReceipt();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const r = getImportById(id);
    if (!r) {
      toast.error('Không tìm thấy phiếu nhập');
      navigate('/inventory/imports');
      return;
    }
    setReceipt(r);
  }, [id, getImportById, navigate]);

  if (!receipt) return null;

  const cfg = STATUS_CONFIG[receipt.status] || STATUS_CONFIG.draft;
  const branchName = BRANCHES.find(b => b.id === receipt.branchId)?.name || receipt.branchName;

  const handleConfirm = () => {
    if (!window.confirm('Xác nhận phiếu nhập này?')) return;
    confirmImport(receipt.id);
    toast.success('Đã xác nhận phiếu nhập');
    setReceipt(prev => ({ ...prev, status: 'confirmed', confirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  };

  const handleReceive = () => {
    if (!window.confirm('Xác nhận đã nhập kho? Hàng hóa sẽ được cộng vào tồn kho.')) return;
    receiveImport(receipt.id);
    toast.success('Đã nhập kho thành công');
    setReceipt(prev => ({ ...prev, status: 'received', receivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  };

  const handleCancel = () => {
    if (receipt.status === 'received') {
      toast.error('Không thể hủy phiếu đã nhập kho');
      return;
    }
    if (!window.confirm(`Hủy phiếu nhập ${receipt.code}?`)) return;
    cancelImport(receipt.id);
    toast.success('Đã hủy phiếu nhập');
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
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/imports')}>Nhập kho</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Chi tiết</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate('/inventory/imports')}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Phiếu nhập {receipt.code}</h1>
            <p className="text-muted text-sm mt-1">{receipt.date} &middot; {receipt.supplierName}</p>
          </div>
          <span className="badge font-semibold mt-2" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div className="card mb-5">
          <h3 className="font-bold text-base mb-4">THÔNG TIN CHUNG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={Calendar} label="Mã phiếu" value={receipt.code} />
            <InfoRow icon={Calendar} label="Ngày nhập" value={receipt.date} />
            <InfoRow icon={Store} label="Nhà cung cấp" value={receipt.supplierName} />
            <InfoRow icon={MapPin} label="Kho/Chi nhánh" value={branchName} />
            <InfoRow icon={User} label="Người tạo" value={receipt.createdBy} />
            <InfoRow icon={Calendar} label="Ngày tạo" value={fmtDateTime(receipt.createdAt)} />
          </div>
        </div>

        <div className="card mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base">CHI TIẾT NGUYÊN LIỆU</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-muted border-b border-soft">
                  <th className="text-left p-3">STT</th>
                  <th className="text-left p-3">Nguyên liệu</th>
                  <th className="text-left p-3">ĐVT</th>
                  <th className="text-right p-3">Số lượng</th>
                  <th className="text-right p-3">Đơn giá</th>
                  <th className="text-right p-3">Thành tiền</th>
                  <th className="text-left p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i} className="border-b border-soft/50">
                    <td className="p-3 text-sm">{i + 1}</td>
                    <td className="p-3 text-sm font-semibold">{item.ingredientName}</td>
                    <td className="p-3 text-sm text-muted">{item.unit}</td>
                    <td className="p-3 text-sm text-right">{item.quantity}</td>
                    <td className="p-3 text-sm text-right">{fmtMoney(item.unitPrice)}</td>
                    <td className="p-3 text-sm text-right font-semibold">{fmtMoney(item.amount)}</td>
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
            <div className="text-base font-bold text-primary">
              Tổng tiền: {fmtMoney(receipt.totalAmount)}
            </div>
          </div>
        </div>

        {(receipt.confirmedAt || receipt.receivedAt || receipt.cancelledAt) && (
          <div className="card mb-5">
            <h3 className="font-bold text-base mb-4">TIẾN TRÌNH</h3>
            <div className="flex flex-col gap-1">
              {STATUS_ORDER.map((s, i) => {
                const scfg = STATUS_CONFIG[s];
                const idx = STATUS_ORDER.indexOf(receipt.status);
                const done = i <= idx && receipt.status !== 'cancelled';
                const isCancelled = receipt.status === 'cancelled';
                const time = s === 'draft' ? fmtDateTime(receipt.createdAt) : s === 'confirmed' ? fmtDateTime(receipt.confirmedAt) : fmtDateTime(receipt.receivedAt);
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
                onClick={() => navigate(`/inventory/imports/${receipt.id}/edit`)}>
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
              <button className="btn btn-success modal-btn px-6 flex items-center gap-2" onClick={handleReceive}
                style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}>
                <PackageCheck size={16} /> Nhập kho
              </button>
            </>
          )}
          {receipt.status === 'cancelled' && (
            <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/inventory/imports')}>Quay lại</button>
          )}
          {receipt.status === 'received' && (
            <button className="btn btn-outline modal-btn px-6" onClick={() => navigate('/inventory/imports')}>Quay lại</button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
