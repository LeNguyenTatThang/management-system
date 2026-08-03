import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventoryStocktake } from '../../../contexts/InventoryStocktakeContext';
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

export default function StocktakeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStocktakeById, confirm, cancel } = useInventoryStocktake();
  const [stocktake, setStocktake] = useState(null);

  useEffect(() => {
    const load = async () => {
      const r = await getStocktakeById(id);
      if (!r) {
        toast.error('Không tìm thấy phiếu kiểm kê');
        navigate('/inventory/stocktakes');
        return;
      }
      setStocktake(r);
    };
    load();
  }, [id, getStocktakeById, navigate]);

  if (!stocktake) return null;

  const cfg = STATUS_CONFIG[stocktake.status] || STATUS_CONFIG.DRAFT;

  const totalDiff = stocktake.items?.reduce((s, i) => s + (parseFloat(i.difference) || 0), 0) || 0;

  const handleConfirm = async () => {
    if (!window.confirm('Xác nhận phiếu kiểm kê?\nTồn kho sẽ được cập nhật theo kết quả kiểm kê.')) return;
    try {
      await confirm(stocktake.id);
      toast.success('Đã xác nhận kiểm kê và cập nhật tồn kho');
      const r = await getStocktakeById(stocktake.id);
      if (r) setStocktake(r);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Hủy phiếu kiểm kê ${stocktake.code}?`)) return;
    try {
      await cancel(stocktake.id);
      toast.success('Đã hủy phiếu kiểm kê');
      const r = await getStocktakeById(stocktake.id);
      if (r) setStocktake(r);
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
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/inventory/stocktakes')}>
              Kiểm kê kho
            </button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Chi tiết</span>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/inventory/stocktakes')}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Phiếu kiểm kê {stocktake.code}</h1>
            <p className="text-muted text-sm mt-1">
              {fmtDate(stocktake.stocktakeDate)}
            </p>
          </div>
          <span className="badge font-semibold mt-2" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        <div className="card mb-5">
          <h3 className="font-bold text-base mb-4">THÔNG TIN CHUNG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow icon={Calendar} label="Mã phiếu" value={stocktake.code} />
            <InfoRow icon={Calendar} label="Ngày kiểm kê" value={fmtDate(stocktake.stocktakeDate)} />
            <InfoRow icon={User} label="Người tạo" value={stocktake.createdByName} />
            <InfoRow icon={Calendar} label="Ngày tạo" value={fmtDateTime(stocktake.createdAt)} />
            {stocktake.confirmedBy && (
              <InfoRow icon={User} label="Người xác nhận" value={stocktake.confirmedBy.name} />
            )}
            {stocktake.confirmedAt && (
              <InfoRow icon={Calendar} label="Thời gian xác nhận" value={fmtDateTime(stocktake.confirmedAt)} />
            )}
          </div>
        </div>

        <div className="card mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base">KẾT QUẢ KIỂM KÊ</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-muted border-b border-soft">
                  <th className="text-left p-3">STT</th>
                  <th className="text-left p-3">Nguyên liệu</th>
                  <th className="text-left p-3">ĐVT</th>
                  <th className="text-right p-3">Tồn hệ thống</th>
                  <th className="text-right p-3">Tồn thực tế</th>
                  <th className="text-right p-3">Chênh lệch</th>
                  <th className="text-left p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {stocktake.items?.map((item, i) => (
                  <tr key={i} className="border-b border-soft/50">
                    <td className="p-3 text-sm">{i + 1}</td>
                    <td className="p-3 text-sm font-semibold">{item.ingredient?.name}</td>
                    <td className="p-3 text-sm text-muted">{item.unit?.name}</td>
                    <td className="p-3 text-sm text-right text-muted">{Number(item.systemQuantity).toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-sm text-right font-semibold">{Number(item.actualQuantity).toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-sm text-right">
                      <span
                        className="font-semibold"
                        style={{
                          color: Number(item.difference) > 0 ? '#10b981' : Number(item.difference) < 0 ? '#ef4444' : '#6b7280',
                        }}
                      >
                        {Number(item.difference) > 0 ? '+' : ''}{Number(item.difference).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted">{item.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-soft">
            <div className="text-sm text-muted">
              Số mặt hàng: <span className="font-bold text-main">{stocktake.items?.length || 0}</span>
            </div>
            <div className="text-sm text-muted">
              Tổng chênh lệch:{' '}
              <span
                className="font-bold"
                style={{ color: totalDiff > 0 ? '#10b981' : totalDiff < 0 ? '#ef4444' : '#6b7280' }}
              >
                {totalDiff > 0 ? '+' : ''}{totalDiff.toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {stocktake.note && (
          <div className="card mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base mb-2">GHI CHÚ</h3>
                <p className="text-sm text-muted whitespace-pre-line">{stocktake.note}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 mb-8">
          {stocktake.status === 'DRAFT' && (
            <>
              <button
                className="btn btn-outline modal-btn px-6 flex items-center gap-2 text-danger"
                onClick={handleCancel}
              >
                <XCircle size={16} /> Hủy phiếu
              </button>
              <button
                className="btn btn-outline modal-btn px-6 flex items-center gap-2"
                onClick={() => navigate(`/inventory/stocktakes/${stocktake.id}/edit`)}
              >
                <Edit3 size={16} /> Sửa
              </button>
              <button className="btn btn-primary modal-btn px-6 flex items-center gap-2" onClick={handleConfirm}>
                <CheckCircle size={16} /> Xác nhận
              </button>
            </>
          )}
          {stocktake.status !== 'DRAFT' && (
            <button
              className="btn btn-outline modal-btn px-6"
              onClick={() => navigate('/inventory/stocktakes')}
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
