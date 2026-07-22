import { Search, Filter, Eye } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const orders = [
  { id: 'DH001', time: '10:24 22/07', items: 3, total: 95000, payment: 'Tiền mặt', staff: 'Nguyễn Văn A', status: 'Hoàn thành' },
  { id: 'DH002', time: '10:30 22/07', items: 1, total: 35000, payment: 'Chuyển khoản', staff: 'Nguyễn Văn A', status: 'Hoàn thành' },
  { id: 'DH003', time: '10:45 22/07', items: 5, total: 155000, payment: 'Thẻ', staff: 'Trần Thị B', status: 'Đang xử lý' },
  { id: 'DH004', time: '11:02 22/07', items: 2, total: 60000, payment: 'Tiền mặt', staff: 'Trần Thị B', status: 'Đã hủy' },
];

export default function Orders() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="card p-0 min-w-0">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 min-w-0" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div style={{ position: 'relative' }} className="w-full sm:w-auto">
                <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Tìm mã đơn hàng..." className="w-full sm:w-[250px]" style={{ paddingLeft: '40px', height: '36px' }} />
              </div>
              <select style={{ height: '36px' }} className="flex-1 sm:flex-none">
                <option>Hôm nay</option>
                <option>Hôm qua</option>
                <option>Tuần này</option>
              </select>
              <select style={{ height: '36px' }} className="flex-1 sm:flex-none">
                <option>Tất cả trạng thái</option>
                <option>Đang xử lý</option>
                <option>Hoàn thành</option>
                <option>Đã hủy</option>
              </select>
            </div>
            <button className="btn btn-outline w-full md:w-auto" style={{ height: '36px' }}><Filter size={18} /> Bộ lọc nâng cao</button>
          </div>
          
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
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold text-primary">{item.id}</td>
                  <td className="text-sm">{item.time}</td>
                  <td>{item.items} món</td>
                  <td className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)}</td>
                  <td>{item.payment}</td>
                  <td>{item.staff}</td>
                  <td>
                    <span className={`badge ${item.status === 'Hoàn thành' ? 'badge-success' : item.status === 'Đang xử lý' ? 'badge-warning' : 'badge-danger'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="p-1 text-muted hover:text-primary"><Eye size={18} /></button>
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
