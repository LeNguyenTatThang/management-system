import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryAdjustment, ADJUSTMENT_DIRECTION_LABELS } from '../../../contexts/InventoryAdjustmentContext';
import { ArrowLeft, Calendar, User, FileText, Package, Edit3, CheckCircle, XCircle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#10b981', bg: '#ecfdf5' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
};

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

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

export default function AdjustmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAdjustmentById, confirm, cancel } = useInventoryAdjustment();
  const [adjustment, setAdjustment] = useState(null);

  useEffect(() => {
    const load = async () => {
      const r = await getAdjustmentById(id);
      if (!r) {
        toast.error('Không tìm thấy phiếu điều chỉnh');
        navigate('/inventory/adjustments');
        return;
      }
      setAdjustment(r);
    };
    load();
  }, [id, getAdjustmentById, navigate]);

  if (!adjustment) return null;

  const cfg = STATUS_CONFIG[adjustment.status] || STATUS_CONFIG.DRAFT;

  const totalIncrease = adjustment.items
    ?.filter((i) => i.direction === 'INCREASE')
    .reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0) || 0;
  const totalDecrease = adjustment.items
    ?.filter((i) => i.direction === 'DECREASE')
    .reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0) || 0;

  const handleConfirm = async () => {
    if (!window.confirm('Xác nhận phiếu điều chỉnh?\nSau khi xác nhận, tồn kho sẽ được cập nhật và không thể chỉnh sửa.')) return;
    try {
      await confirm(adjustment.id);
      toast.success('Đã xác nhận và cập nhật tồn kho');
      const r = await getAdjustmentById(adjustment.id);
      if (r) setAdjustment(r);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Hủy phiếu điều chỉnh ${adjustment.code}?`)) return;
    try {
      await cancel(adjustment.id);
      toast.success('Đã hủy phiếu điều chỉnh');
      const r = await getAdjustmentById(adjustment.id);
      if (r) setAdjustment(r);
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
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/adjustments')}>
              Điều chỉnh kho
            </button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết</span>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/inventory/adjustments')}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Phiếu điều chỉnh {adjustment.code}</h1>
            <p className="text-muted text-sm mt-1">
              {fmtDate(adjustment.adjustmentDate)} &middot; {adjustment.reason}
            </p>
          </div>
          <span className="badge font-semibold mt-2" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div className="card mb-5">
          <h3 className="font-bold text-base mb-4">THÔNG TIN CHUNG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={Calendar} label="Mã phiếu" value={adjustment.code} />
            <InfoRow icon={Calendar} label="Ngày điều chỉnh" value={fmtDate(adjustment.adjustmentDate)} />
            <InfoRow icon={FileText} label="Lý do" value={adjustment.reason || '—'} />
            <InfoRow icon={User} label="Người tạo" value={adjustment.createdByName} />
            <InfoRow icon={Calendar} label="Ngày tạo" value={fmtDateTime(adjustment.createdAt)} />
            {adjustment.confirmedBy && (
              <InfoRow icon={User} label="Người xác nhận" value={adjustment.confirmedBy.name} />
            )}
            {adjustment.confirmedAt && (
              <InfoRow icon={Calendar} label="Thời gian xác nhận" value={fmtDateTime(adjustment.confirmedAt)} />
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
                  <th className="text-left p-3">STT</th>
                  <th className="text-left p-3">Nguyên liệu</th>
                  <th className="text-left p-3">ĐVT</th>
                  <th className="text-right p-3">Tồn kho hiện tại</th>
                  <th className="text-center p-3">Hướng</th>
                  <th className="text-right p-3">Số lượng</th>
                  <th className="text-left p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {adjustment.items?.map((item, i) => (
                  <tr key={i} className="border-b border-soft/50">
                    <td className="p-3 text-sm">{i + 1}</td>
                    <td className="p-3 text-sm font-semibold">{item.ingredient?.name}</td>
                    <td className="p-3 text-sm text-muted">{item.unit?.name}</td>
                    <td className="p-3 text-sm text-right text-muted">{item.ingredient?.stock}</td>
                    <td className="p-3 text-center">
                      <span
                        className="badge text-xs"
                        style={{
                          backgroundColor: item.direction === 'INCREASE' ? '#ecfdf5' : '#fef2f2',
                          color: item.direction === 'INCREASE' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {ADJUSTMENT_DIRECTION_LABELS[item.direction] || item.direction}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-right font-semibold">{item.quantity}</td>
                    <td className="p-3 text-sm text-muted">{item.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-soft">
            <div className="text-sm text-muted">
              Số mặt hàng: <span className="font-bold text-main">{adjustment.items?.length || 0}</span>
            </div>
            {totalIncrease > 0 && (
              <div className="text-sm text-muted">
                Tổng tăng:{' '}
                <span className="font-bold text-green-600">+{totalIncrease.toLocaleString('vi-VN')}</span>
              </div>
            )}
            {totalDecrease > 0 && (
              <div className="text-sm text-muted">
                Tổng giảm:{' '}
                <span className="font-bold text-red-600">-{totalDecrease.toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>

        {adjustment.note && (
          <div className="card mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base mb-2">GHI CHÚ</h3>
                <p className="text-sm text-muted whitespace-pre-line">{adjustment.note}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          {adjustment.status === 'DRAFT' && (
            <>
              <button
                className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger"
                onClick={handleCancel}
              >
                <XCircle size={16} /> Hủy phiếu
              </button>
              <button
                className="btn btn-outline modal-btn px-6 flex items-center gap-2"
                onClick={() => navigate(`/inventory/adjustments/${adjustment.id}/edit`)}
              >
                <Edit3 size={16} /> Sửa
              </button>
              <button className="btn btn-primary modal-btn px-6 flex items-center gap-2" onClick={handleConfirm}>
                <CheckCircle size={16} /> Xác nhận
              </button>
            </>
          )}
          {adjustment.status !== 'DRAFT' && (
            <button
              className="btn btn-outline modal-btn px-6"
              onClick={() => navigate('/inventory/adjustments')}
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
