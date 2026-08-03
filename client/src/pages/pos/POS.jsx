import PosLayout from '../../components/pos/PosLayout';

export default function POS() {
  return (
    <PosLayout
      showPaymentMethods={true}
      actionLabel="Thanh toán"
      backPath="/dashboard"
    />
  );
}
