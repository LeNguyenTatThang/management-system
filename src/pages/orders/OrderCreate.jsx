import { toast } from 'react-hot-toast';
import PosLayout from '../../components/pos/PosLayout';

export default function OrderCreate() {
  const handleCreateOrder = ({ order, appliedCoupons, total, clearOrder }) => {
    toast.success('Tạo đơn thành công');
    clearOrder();
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
