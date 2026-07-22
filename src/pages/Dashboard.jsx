import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { kpis, revenueData, bestSellers, inventoryWarnings } from '../data/mockData';
import { TrendingUp, ShoppingBag, DollarSign, Coffee, AlertTriangle, Clock } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

const KPICard = ({ title, value, change, label, icon: Icon, isPositive, colorClass = "text-primary" }) => (
  <div className="card flex flex-col justify-between" style={{ minHeight: '130px' }}>
    <div className="flex justify-between items-start gap-4">
      <div className="min-w-0">
        <div className="text-muted text-sm font-semibold mb-1 uppercase tracking-wider truncate" style={{ fontSize: '0.75rem' }}>{title}</div>
        <div className={`text-2xl md:text-3xl font-bold ${colorClass} mt-1 truncate`}>{value}</div>
      </div>
      <div className="flex-shrink-0" style={{ backgroundColor: 'var(--bg-color)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-full)' }}>
        <Icon size={24} className={colorClass} />
      </div>
    </div>
    <div className="flex items-center gap-2 mt-auto text-xs min-w-0">
      {change && (
        <span className={`badge ${isPositive ? 'badge-success' : 'badge-warning'} flex-shrink-0`}>
          {change}
        </span>
      )}
      <span className="text-muted truncate">{label}</span>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        
        {/* Main KPIs horizontally */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 w-full min-w-0">
          <KPICard title="Doanh thu hôm nay" value={kpis.revenue.value} change={kpis.revenue.change} label={kpis.revenue.label} isPositive={kpis.revenue.isPositive} icon={DollarSign} />
          <KPICard title="Đơn hàng" value={kpis.orders.value} change={kpis.orders.change} label={kpis.orders.label} isPositive={kpis.orders.isPositive} icon={ShoppingBag} />
          <KPICard title="Lợi nhuận" value={kpis.profit.value} change={kpis.profit.change} label={kpis.profit.label} isPositive={kpis.profit.isPositive} icon={TrendingUp} />
          <KPICard title="Đang xử lý" value={kpis.processing.value} change="" label={kpis.processing.label} isPositive={true} icon={Clock} colorClass="text-info" />
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3 w-full min-w-0">
          
          {/* Main Chart Area */}
          <div className="flex flex-col gap-6 lg:col-span-2 min-w-0">
            <div className="card h-full flex flex-col min-w-0">
              <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">Biểu đồ doanh thu</h3>
                  <div className="text-sm text-muted mt-1 truncate">Theo dõi tổng doanh thu 7 ngày qua</div>
                </div>
                <select style={{ height: '36px' }} className="flex-shrink-0">
                  <option>7 ngày gần nhất</option>
                  <option>Tháng này</option>
                </select>
              </div>
              <div style={{ height: 380 }} className="w-full min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} tickFormatter={(val) => `${val/1000000}M`} />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} cursor={{stroke: 'var(--border-color)', strokeWidth: 2}} />
                    <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="var(--primary)" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6, stroke: 'var(--primary)', strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar Insights */}
          <div className="flex flex-col gap-4 md:gap-6 lg:col-span-1 min-w-0">
            <div className="card p-0 overflow-hidden min-w-0">
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-soft)', backgroundColor: '#fafafa' }}>
                <h3 className="font-bold text-base flex items-center gap-2 truncate"><Coffee size={18} className="text-primary flex-shrink-0" /> Món bán chạy</h3>
                <button className="text-primary text-sm font-semibold hover:underline flex-shrink-0">Xem tất cả</button>
              </div>
              <div>
                {bestSellers.slice(0, 5).map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-2" style={{ borderBottom: i < 4 ? '1px solid var(--border-soft)' : 'none' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="font-bold text-muted w-4 text-center flex-shrink-0">{i+1}</div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted">{item.quantity} ly</div>
                      </div>
                    </div>
                    <div className="font-bold text-sm text-primary flex-shrink-0">{item.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card p-0 overflow-hidden min-w-0">
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-soft)', backgroundColor: '#fff5f5' }}>
                <h3 className="font-bold text-base flex items-center gap-2 text-danger truncate"><AlertTriangle size={18} className="flex-shrink-0" /> Cảnh báo tồn kho</h3>
                <span className="badge badge-danger flex-shrink-0">3 mục</span>
              </div>
              <div className="p-4 flex flex-col gap-4 min-w-0">
                {inventoryWarnings.map(item => (
                  <div key={item.id} className="flex justify-between items-center gap-2 min-w-0">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{item.name}</div>
                      <div className="text-xs text-muted truncate">Còn {item.stock}</div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded flex-shrink-0" style={{ backgroundColor: '#fef2f2', color: 'var(--danger)' }}>{item.status}</span>
                  </div>
                ))}
                <button className="btn btn-outline w-full mt-2 text-sm">Quản lý kho</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
