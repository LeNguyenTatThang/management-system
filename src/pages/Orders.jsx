import { Search, Filter, Eye, Plus } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const orders = [
  { id: 'DH001', time: '10:24 22/07', items: 3, total: 95000, payment: 'Tiền mặt', staff: 'Nguyễn Văn A', status: 'Hoàn thành' },
  { id: 'DH002', time: '10:30 22/07', items: 1, total: 35000, payment: 'Chuyển khoản', staff: 'Nguyễn Văn A', status: 'Hoàn thành' },
  { id: 'DH003', time: '10:45 22/07', items: 5, total: 155000, payment: 'Thẻ', staff: 'Trần Thị B', status: 'Đang xử lý' },
  { id: 'DH004', time: '11:02 22/07', items: 2, total: 60000, payment: 'Tiền mặt', staff: 'Trần Thị B', status: 'Đã hủy' },
];

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function Orders() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Đơn hàng</h2>
            <p className="text-muted text-sm">Quản lý {orders.length} đơn hàng</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px">
            <Plus size={18} /> Thêm đơn hàng
          </button>
        </div>

        <div className="card p-3 min-w-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
              <input type="text" placeholder="Tìm mã đơn hàng..." className="w-full pl-10 h-36px" />
            </div>
            <select className="h-36px text-sm w-32 flex-shrink-0">
              <option>Hôm nay</option>
              <option>Hôm qua</option>
              <option>Tuần này</option>
            </select>
            <select className="h-36px text-sm w-40 flex-shrink-0">
              <option>Tất cả trạng thái</option>
              <option>Đang xử lý</option>
              <option>Hoàn thành</option>
              <option>Đã hủy</option>
            </select>
            <button className="btn btn-outline flex items-center gap-1.5 h-36px text-sm whitespace-nowrap flex-shrink-0"><Filter size={16} /> Bộ lọc</button>
          </div>
        </div>

        <div className="card p-0 overflow-hidden min-w-0">
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Thời gian</th>
                <th>Số món</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Nhân viên</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold text-primary">{item.id}</td>
                  <td className="text-sm">{item.time}</td>
                  <td>{item.items} món</td>
                  <td className="font-bold">{fmt(item.total)}</td>
                  <td>{item.payment}</td>
                  <td>{item.staff}</td>
                  <td>
                    <span className={`badge ${item.status === 'Hoàn thành' ? 'badge-success' : item.status === 'Đang xử lý' ? 'badge-warning' : 'badge-danger'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="p-1 text-muted hover-text-primary"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>
    </PageContainer>
  );
}
