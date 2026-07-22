import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const suppliers = [
  { id: 'NCC01', name: 'Công ty Cổ phần Sữa Việt Nam', contact: 'Anh Hùng', phone: '0987654321', email: 'hung@vinamilk.com', items: 12, total: 45000000, status: 'Đang hợp tác' },
  { id: 'NCC02', name: 'Nhà phân phối Cà Phê Trung Nguyên', contact: 'Chị Mai', phone: '0987654322', email: 'mai@trungnguyen.com', items: 5, total: 32000000, status: 'Đang hợp tác' },
  { id: 'NCC03', name: 'Đại lý Nguyên Liệu Pha Chế', contact: 'Anh Tuấn', phone: '0987654323', email: 'tuan@nguyenlieu.vn', items: 25, total: 15000000, status: 'Tạm ngưng' },
];

export default function Suppliers() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="card p-0 min-w-0">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 min-w-0" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div style={{ position: 'relative' }} className="w-full sm:w-auto">
                <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Tìm nhà cung cấp..." className="w-full sm:w-[250px]" style={{ paddingLeft: '40px', height: '36px' }} />
              </div>
            </div>
            <button className="btn btn-primary w-full md:w-auto" style={{ height: '36px' }}><Plus size={18} /> Thêm nhà cung cấp</button>
          </div>
          
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Tên nhà cung cấp</th>
                <th>Người liên hệ</th>
                <th>Số điện thoại</th>
                <th>Số nguyên liệu</th>
                <th>Tổng giá trị nhập</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.name}</td>
                  <td>{item.contact}</td>
                  <td>{item.phone}</td>
                  <td>{item.items}</td>
                  <td className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)}</td>
                  <td>
                    <span className={`badge ${item.status === 'Đang hợp tác' ? 'badge-success' : 'badge-neutral'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-muted hover:text-primary"><Edit size={18} /></button>
                      <button className="p-1 text-muted hover:text-danger"><Trash2 size={18} /></button>
                    </div>
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
