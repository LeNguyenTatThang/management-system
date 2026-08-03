import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStockLedger, MOVEMENT_TYPE_LABELS, MOVEMENT_DIRECTION_LABELS, REFERENCE_TYPE_LABELS } from '../../../contexts/StockLedgerContext';
import { ArrowLeft, Calendar, User, Package, ArrowUpDown, FileText } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

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

export default function StockLedgerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchMovementById } = useStockLedger();
  const [movement, setMovement] = useState(null);

  useEffect(() => {
    const load = async () => {
      const m = await fetchMovementById(id);
      if (!m) {
        toast.error('Không tìm thấy biến động kho');
        navigate('/inventory/stock-ledger');
        return;
      }
      setMovement(m);
    };
    load();
  }, [id, fetchMovementById, navigate]);

  if (!movement) return null;

  const isIn = movement.direction === 'IN';
  const typeLabel = MOVEMENT_TYPE_LABELS[movement.type] || movement.type;
  const directionLabel = MOVEMENT_DIRECTION_LABELS[movement.direction] || movement.direction;
  const refLabel = REFERENCE_TYPE_LABELS[movement.referenceType] || movement.referenceType;

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
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/stock-ledger')}>
              Biến động kho
            </button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết</span>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/inventory/stock-ledger')}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Biến động kho</h1>
            <p className="text-muted text-sm mt-1">
              {movement.ingredient?.name} &middot; {fmtDateTime(movement.createdAt)}
            </p>
          </div>
          <span
            className="badge font-semibold mt-2 text-sm"
            style={{
              backgroundColor: isIn ? '#ecfdf5' : '#fef2f2',
              color: isIn ? '#10b981' : '#ef4444',
            }}
          >
            {isIn ? '+' : '-'}{Number(movement.quantity).toLocaleString('vi-VN')}
          </span>
        </div>

        <div className="card mb-5">
          <h3 className="font-bold text-base mb-4">CHI TIẾT BIẾN ĐỘNG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={Package} label="Nguyên liệu" value={movement.ingredient?.name || '—'} />
            <InfoRow icon={ArrowUpDown} label="Loại biến động" value={typeLabel} />
            <InfoRow
              icon={isIn ? Package : Package}
              label="Hướng"
              value={
                <span style={{ color: isIn ? '#10b981' : '#ef4444' }}>
                  {isIn ? 'Tăng' : 'Giảm'} {directionLabel}
                </span>
              }
            />
            <InfoRow icon={Package} label="Số lượng" value={`${Number(movement.quantity).toLocaleString('vi-VN')} ${movement.unit?.name || ''}`} />
            <InfoRow icon={Package} label="Tồn kho trước" value={`${Number(movement.stockBefore).toLocaleString('vi-VN')} ${movement.unit?.name || ''}`} />
            <InfoRow icon={Package} label="Tồn kho sau" value={`${Number(movement.stockAfter).toLocaleString('vi-VN')} ${movement.unit?.name || ''}`} />
          </div>
        </div>

        <div className="card mb-5">
          <h3 className="font-bold text-base mb-4">PHIẾU LIÊN QUAN</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={FileText} label="Loại phiếu" value={refLabel} />
            <InfoRow icon={FileText} label="Mã phiếu" value={movement.referenceCode || '—'} />
            <InfoRow icon={User} label="Người thực hiện" value={movement.performedBy?.name || '—'} />
            <InfoRow icon={Calendar} label="Thời gian" value={fmtDateTime(movement.createdAt)} />
          </div>
        </div>

        {movement.note && (
          <div className="card mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base mb-2">GHI CHÚ</h3>
                <p className="text-sm text-muted whitespace-pre-line">{movement.note}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          <button
            className="btn btn-outline modal-btn px-6"
            onClick={() => navigate('/inventory/stock-ledger')}
          >
            Quay lại
          </button>
          {movement.ingredientId && (
            <button
              className="btn btn-primary modal-btn px-6"
              onClick={() => navigate(`/inventory/stock-ledger?ingredientId=${movement.ingredientId}`)}
            >
              Xem lịch sử nguyên liệu này
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
