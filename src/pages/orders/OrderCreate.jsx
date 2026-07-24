import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PosLayout from '../../components/pos/PosLayout';

export default function OrderCreate() {
  const navigate = useNavigate();

  const getNextId = () => {
    const stored = localStorage.getItem('savedOrders');
    const saved = stored ? JSON.parse(stored) : [];
    const mockIds = ['DH001', 'DH002', 'DH003', 'DH004'];
    const allIds = [...mockIds, ...saved.map(o => o.id)];
    const max = allIds.reduce((m, id) => {
      const num = parseInt(id.replace('DH', ''), 10);
      return isNaN(num) ? m : Math.max(m, num);
    }, 0);
    return `DH${String(max + 1).padStart(3, '0')}`;
  };

  const handleCreateOrder = ({ order, appliedCoupons, payment, total, clearOrder }) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const subtotal = order.reduce((s, i) => s + i.finalPrice * i.quantity, 0);
    const totalPromotionDiscount = order.reduce((s, i) => s + (i.promotionDiscount || 0) * i.quantity, 0);
    let couponDiscount = 0;
    appliedCoupons.forEach(c => {
      if (c.type === 'fixed') {
        couponDiscount += c.value;
      } else if (c.type === 'percent') {
        let d = Math.round(subtotal * c.value / 100);
        if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
        couponDiscount += d;
      }
    });
    const grandTotal = Math.max(0, subtotal - couponDiscount);

    const promotionLabels = [...new Set(order.map(i => i.promotionLabel).filter(Boolean))];

    const newOrder = {
      id: getNextId(),
      time,
      items: order,
      subtotal,
      totalPromotionDiscount,
      couponDiscount,
      grandTotal,
      payment: '',
      paymentStatus: 'unpaid',
      staff: 'Nhân viên',
      status: 'Đang xử lý',
      promotionApplied: promotionLabels.map(name => ({ id: name, name })),
      appliedVouchers: appliedCoupons.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        type: c.type,
        value: c.value,
      })),
      orderBespoke: [],
    };

    const stored = localStorage.getItem('savedOrders');
    const saved = stored ? JSON.parse(stored) : [];
    saved.push(newOrder);
    localStorage.setItem('savedOrders', JSON.stringify(saved));

    clearOrder();
    toast.success('Tạo đơn thành công');
    navigate(`/orders/${newOrder.id}`);
  };

  return (
    <PosLayout
      showPaymentMethods={false}
      actionLabel="Tạo đơn"
      backPath="/orders"
      onAction={handleCreateOrder}
    />
  );
}
