import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Plus } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import FilterPopover from '../../components/ui/FilterPopover';
import { mockOrders } from '../../data/mockData';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

function getAllOrders() {
  const stored = localStorage.getItem('savedOrders');
  const saved = stored ? JSON.parse(stored) : [];
  return [...mockOrders, ...saved].map(o => ({
    id: o.id,
    time: o.time,
    items: o.items ? o.items.reduce((s, i) => s + i.quantity, 0) : 0,
    total: o.grandTotal || 0,
    payment: o.payment || 'Chưa thanh toán',
    staff: o.staff,
    status: o.status,
  }));
}

export default function Orders() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const orders = useMemo(() => getAllOrders(), []);

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Đơn hàng</h2>
            <p className="text-muted text-sm">Quản lý {orders.length} đơn hàng</p>
          </div>
          <button
            className="btn btn-primary flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-40px"
            onClick={() => navigate('/orders/create')}
          >
            <Plus size={18} /> Tạo đơn
          </button>
        </div>

        <div className="card p-3 min-w-0">
          <div className="flex items-center gap-3">
            <FilterPopover
              filters={[
                {
                  key: 'date',
                  label: 'Thời gian',
                  options: [
                    { value: '', label: 'Hôm nay' },
                    { value: 'yesterday', label: 'Hôm qua' },
                    { value: 'week', label: 'Tuần này' },
                  ],
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  options: [
                    { value: '', label: 'Tất cả trạng thái' },
                    { value: 'Đang xử lý', label: 'Đang xử lý' },
                    { value: 'Hoàn thành', label: 'Hoàn thành' },
                    { value: 'Đã hủy', label: 'Đã hủy' },
                  ],
                },
              ]}
              activeFilters={{ date: filterDate, status: filterStatus }}
              onFilterChange={(key, value) => {
                if (key === 'date') setFilterDate(value);
                if (key === 'status') setFilterStatus(value);
              }}
              onClearAll={() => { setFilterDate(''); setFilterStatus(''); }}
            />
            <div className="relative flex-1 min-w-0">
              <Search size={18} className="text-muted absolute left-12px absolute-center-y" />
              <input type="text" placeholder="Tìm mã đơn hàng..." className="w-full pl-10 h-36px" />
            </div>
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
                    <button className="p-1 text-muted hover-text-primary" onClick={() => navigate(`/orders/${item.id}`)}><Eye size={18} /></button>
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
