import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Printer } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import { mockOrders } from '../../data/mockData';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

function getAllOrders() {
  const stored = localStorage.getItem('savedOrders');
  const saved = stored ? JSON.parse(stored) : [];
  return [...mockOrders, ...saved];
}

function getOrderById(id) {
  return getAllOrders().find(o => o.id === id);
}

const PAYMENT_STATUS_MAP = {
  paid: { label: 'Đã thanh toán', className: 'badge-success' },
  unpaid: { label: 'Chưa thanh toán', className: 'badge-warning' },
  error: { label: 'Lỗi', className: 'badge-danger' },
};

function buildOptions(item) {
  const parts = [];
  if (item.sweetness != null) parts.push(`Đường ${item.sweetness}%`);
  if (item.note) parts.push(item.note);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = getOrderById(id);

  if (!order) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-lg font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-muted text-sm mb-4">Mã đơn &quot;{id}&quot; không tồn tại</p>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>Quay lại danh sách</button>
        </div>
      </PageContainer>
    );
  }

  const ps = PAYMENT_STATUS_MAP[order.paymentStatus] || PAYMENT_STATUS_MAP.unpaid;
  const paymentLabel = order.payment || 'Chưa thanh toán';
  const itemCount = order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 0;

  const hasVouchers = order.appliedVouchers && order.appliedVouchers.length > 0;
  const hasBespoke = order.orderBespoke && order.orderBespoke.length > 0;

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">

        <button
          className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-4 cursor-pointer"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft size={14} /> Quay lại
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
            <p className="text-muted text-sm mt-0.5">
              <span className="font-semibold text-primary">{order.id}</span>
              {order.time && <span> · {order.time}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-shrink-0">
            <span className={`badge ${ps.className}`}>{ps.label}</span>
            <button className="btn btn-primary flex items-center gap-1.5 text-sm">
              <Printer size={16} /> Xuất hóa đơn
            </button>
          </div>
        </div>

        <div className="card p-6">
          {/* ═══ SECTION 1: ORDER OVERVIEW ═══ */}
          <div className="mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-4">Thông tin chung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted whitespace-nowrap" style={{ minWidth: 130 }}>Mã đơn hàng:</span>
                <span className="font-semibold text-sm">{order.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted whitespace-nowrap" style={{ minWidth: 130 }}>Người tạo:</span>
                <span className="font-semibold text-sm">{order.staff}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted whitespace-nowrap" style={{ minWidth: 130 }}>Phương thức:</span>
                <span className="font-semibold text-sm">{paymentLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted whitespace-nowrap" style={{ minWidth: 130 }}>Trạng thái:</span>
                <span className={`badge ${ps.className}`}>{ps.label}</span>
              </div>
            </div>
          </div>
            <hr className="border-0 border-t border-gray-200" />

          {/* ═══ SECTION 2: ORDER ITEMS ═══ */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Danh sách món</h3>
              <span className="text-xs text-muted">{itemCount} món</span>
            </div>
            <ResponsiveTable>
              <thead>
                <tr>
                  <th>Tên món</th>
                  <th>Tùy chọn</th>
                  <th className="text-center whitespace-nowrap">SL</th>
                  <th className="text-right whitespace-nowrap">Đơn giá</th>
                  <th className="text-right whitespace-nowrap">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const opts = buildOptions(item);
                    return (
                      <tr key={item.id || idx}>
                        <td>
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
                                <Coffee size={18} className="text-muted" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-sm">{item.name}</div>
                              {item.sizeLabel && <div className="text-xs text-muted mt-0.5">Size {item.sizeLabel}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="text-xs text-muted">
                          {opts || <span className="text-muted">—</span>}
                        </td>
                        <td className="text-center text-sm whitespace-nowrap">{item.quantity}</td>
                        <td className="text-right text-sm whitespace-nowrap">{fmt(item.originalPrice)}</td>
                        <td className="text-right font-semibold text-sm whitespace-nowrap">{fmt(item.finalPrice * item.quantity)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-8 text-sm">Không có món nào</td>
                  </tr>
                )}
              </tbody>
            </ResponsiveTable>
          </div>

          {hasVouchers || hasBespoke ? (
            <>
              <hr className="border-t border-gray-100 my-5" />

              {/* ═══ SECTION 3: VOUCHER + BESPOKE ═══ */}
              <div className="mt-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-3">Voucher &amp; Order Bespoke</h3>

                {hasVouchers && (
                  <div className={hasBespoke ? 'mb-4' : ''}>
                    <p className="text-xs text-muted mb-2">Voucher được áp dụng</p>
                    <div className="flex flex-col gap-2">
                      {order.appliedVouchers.map((v, idx) => (
                        <div key={v.id || idx} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-primary">{v.code}</span>
                            <span className="font-semibold text-sm text-success">
                              {v.type === 'fixed' ? `-${fmt(v.value)}` : v.type === 'percent' ? `-${v.value}%` : fmt(v.value || 0)}
                            </span>
                          </div>
                          {(v.mood || v.spirit || v.flavour || v.taste) && (
                            <div className="flex flex-wrap gap-1">
                              {v.mood && <span className="badge badge-neutral text-xs">{v.mood}</span>}
                              {v.spirit && <span className="badge badge-neutral text-xs">{v.spirit}</span>}
                              {v.flavour && <span className="badge badge-neutral text-xs">{v.flavour}</span>}
                              {v.taste && <span className="badge badge-neutral text-xs">{v.taste}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasBespoke && (
                  <div>
                    <p className="text-xs text-muted mb-2">Order Bespoke</p>
                    <div className="flex flex-col gap-2">
                      {order.orderBespoke.map((b, idx) => (
                        <div key={b.id || idx} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-sm text-primary whitespace-nowrap">{b.orderId || order.id}</span>
                              {b.customerName && <span className="text-xs text-muted truncate">{b.customerName}</span>}
                            </div>
                            <span className="font-semibold text-sm whitespace-nowrap">{b.price ? fmt(b.price) : '—'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {b.mood && <span className="badge badge-neutral text-xs">{b.mood}</span>}
                            {b.spirit && <span className="badge badge-neutral text-xs">{b.spirit}</span>}
                            {b.flavour && <span className="badge badge-neutral text-xs">{b.flavour}</span>}
                            {b.taste && <span className="badge badge-neutral text-xs">{b.taste}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}

          <hr className="border-t border-gray-100 my-5" />

          {/* ═══ SECTION 4: ORDER SUMMARY ═══ */}
          <div className="mt-3">
            <div className="max-w-xs ml-auto">
              {order.promotionApplied && order.promotionApplied.length > 0 && (
                <div className="text-xs text-muted mb-2">
                  Chương trình KM: <span className="font-semibold text-sm text-main">{order.promotionApplied.map(p => p.name).join(', ')}</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5 mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tạm tính</span>
                  <span className="font-semibold">{fmt(order.subtotal)}</span>
                </div>
                {order.totalPromotionDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Giảm KM</span>
                    <span className="font-semibold text-success">-{fmt(order.totalPromotionDiscount)}</span>
                  </div>
                )}
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Giảm voucher</span>
                    <span className="font-semibold text-success">-{fmt(order.couponDiscount)}</span>
                  </div>
                )}
              </div>
              <hr className="border-t border-gray-200" />
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-sm">Tổng tiền</span>
                <span className="font-bold text-lg text-primary">{fmt(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
