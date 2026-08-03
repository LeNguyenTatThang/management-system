import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryTransfer } from '../../../contexts/InventoryTransferContext';
import { ArrowLeft, Package, User, Calendar, FileText, CheckCircle, ArrowRight, XCircle, Trash2 } from 'lucide-react';
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

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${fmtDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TransferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTransferById, confirm, executeTransfer, cancel, remove } = useInventoryTransfer();
  const [transfer, setTransfer] = useState(null);

  useEffect(() => {
    const load = async () => {
      const r = await getTransferById(id);
      if (!r) {
        toast.error('Không tìm thấy phiếu chuyển kho');
        navigate('/inventory/transfers');
        return;
      }
      setTransfer(r);
    };
    load();
  }, [id, getTransferById, navigate]);

  if (!transfer) return null;

  const cfg = STATUS_CONFIG[transfer.status] || STATUS_CONFIG.DRAFT;

  const totalQuantity = transfer.items?.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0;

  const handleConfirm = async () => {
    if (!window.confirm('Xác nhận phiếu chuyển kho?')) return;
    try {
      await confirm(transfer.id);
      toast.success('Đã xác nhận phiếu chuyển kho');
      const r = await getTransferById(transfer.id);
      if (r) setTransfer(r);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTransfer = async () => {
    if (!window.confirm('Thực hiện chuyển kho? Hành động này không thể hoàn tác.')) return;
    try {
      await executeTransfer(transfer.id);
      toast.success('Đã thực hiện chuyển kho');
      const r = await getTransferById(transfer.id);
      if (r) setTransfer(r);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Hủy phiếu chuyển kho ${transfer.code}?`)) return;
    try {
      await cancel(transfer.id);
      toast.success('Đã hủy phiếu chuyển kho');
      const r = await getTransferById(transfer.id);
      if (r) setTransfer(r);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xóa phiếu chuyển kho ${transfer.code}?`)) return;
    try {
      await remove(transfer.id);
      toast.success('Đã xóa phiếu chuyển kho');
      navigate('/inventory/transfers');
    } catch (err) {
      toast.error(err.message);
    }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/transfers')}>
              Chuyển kho
            </button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết</span>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/inventory/transfers')}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Phiếu chuyển kho {transfer.code}</h1>
            <p className="text-muted text-sm mt-1">
              {fmtDate(transfer.transferDate)}
            </p>
          </div>
          <span className="badge font-semibold mt-2" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div className="card mb-5">
          <h3 className="font-bold text-base mb-4">THÔNG TIN CHUNG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={Package} label="Mã phiếu" value={transfer.code} />
            <InfoRow icon={Calendar} label="Ngày chuyển" value={fmtDate(transfer.transferDate)} />
            <InfoRow icon={User} label="Người tạo" value={transfer.createdByName} />
            <InfoRow icon={Calendar} label="Ngày tạo" value={fmtDateTime(transfer.createdAt)} />
            {transfer.confirmedBy && (
              <InfoRow icon={User} label="Người xác nhận" value={transfer.confirmedBy.name} />
            )}
            {transfer.confirmedAt && (
              <InfoRow icon={Calendar} label="Thời gian xác nhận" value={fmtDateTime(transfer.confirmedAt)} />
            )}
            {transfer.transferredBy && (
              <InfoRow icon={User} label="Người thực hiện" value={transfer.transferredBy.name} />
            )}
            {transfer.transferredAt && (
              <InfoRow icon={Calendar} label="Thời gian chuyển" value={fmtDateTime(transfer.transferredAt)} />
            )}
          </div>
        </div>

        <div className="card mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base">DANH SÁCH NGUYÊN LIỆU</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-muted border-b border-soft">
                  <th className="text-left p-3">Nguyên liệu</th>
                  <th className="text-left p-3">ĐVT</th>
                  <th className="text-right p-3">Số lượng</th>
                  <th className="text-left p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {transfer.items?.map((item, i) => (
                  <tr key={i} className="border-b border-soft/50">
                    <td className="p-3 text-sm font-semibold">{item.ingredient?.name}</td>
                    <td className="p-3 text-sm text-muted">{item.unit?.name}</td>
                    <td className="p-3 text-sm text-right font-semibold">{Number(item.quantity).toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-sm text-muted">{item.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-soft">
            <div className="text-sm text-muted">
              Tổng số lượng: <span className="font-bold text-main">{totalQuantity.toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {transfer.note && (
          <div className="card mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base mb-2">GHI CHÚ</h3>
                <p className="text-sm text-muted whitespace-pre-line">{transfer.note}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          {transfer.status === 'DRAFT' && (
            <>
              <button
                className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger"
                onClick={handleDelete}
              >
                <Trash2 size={16} /> Xóa phiếu
              </button>
              <button
                className="btn btn-outline modal-btn px-6"
                onClick={() => navigate(`/inventory/transfers/${transfer.id}/edit`)}
              >
                Sửa
              </button>
              <button className="btn btn-primary modal-btn px-6 flex items-center gap-2" onClick={handleConfirm}>
                <CheckCircle size={16} /> Xác nhận
              </button>
            </>
          )}
          {transfer.status === 'CONFIRMED' && (
            <>
              <button
                className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger"
                onClick={handleCancel}
              >
                <XCircle size={16} /> Hủy phiếu
              </button>
              <button className="btn btn-primary modal-btn px-6 flex items-center gap-2" onClick={handleTransfer}>
                <ArrowRight size={16} /> Thực hiện chuyển
              </button>
            </>
          )}
          {transfer.status !== 'DRAFT' && (
            <button
              className="btn btn-outline modal-btn px-6"
              onClick={() => navigate('/inventory/transfers')}
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}