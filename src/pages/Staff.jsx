import { useState } from 'react';
import { Search, Plus, Edit, X, Users, UserCheck, Coffee, Wifi, Phone, Calendar, Shield, Clock } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ResponsiveTable from '../components/ui/ResponsiveTable';

const ROLE_COLORS = {
  'Quản lý':          { bg: '#6c111e', text: '#fff' },
  'Thu ngân':         { bg: '#2563eb', text: '#fff' },
  'Nhân viên pha chế':{ bg: '#7c3aed', text: '#fff' },
  'Phục vụ':          { bg: '#059669', text: '#fff' },
};

const SHIFTS = ['Ca sáng', 'Ca chiều', 'Ca tối'];
const ROLES  = ['Quản lý', 'Thu ngân', 'Nhân viên pha chế', 'Phục vụ'];

const initialStaff = [
  { id: 'NV01', name: 'Nguyễn Văn A', phone: '0901234567', role: 'Quản lý',           shift: 'Ca sáng',  status: 'Đang làm việc', active: '10 phút trước' },
  { id: 'NV02', name: 'Trần Thị B',   phone: '0901234568', role: 'Thu ngân',           shift: 'Ca sáng',  status: 'Đang làm việc', active: 'Vừa xong' },
  { id: 'NV03', name: 'Lê Văn C',     phone: '0901234569', role: 'Nhân viên pha chế',  shift: 'Ca chiều', status: 'Đang nghỉ',     active: '2 giờ trước' },
  { id: 'NV04', name: 'Phạm Thị D',   phone: '0901234570', role: 'Phục vụ',            shift: 'Ca chiều', status: 'Đang nghỉ',     active: '1 ngày trước' },
];

const emptyForm = { id: '', name: '', phone: '', role: 'Phục vụ', shift: 'Ca sáng', status: 'Đang làm việc', active: '' };

function Avatar({ name, role }) {
  const color = ROLE_COLORS[role] || { bg: '#6b7280', text: '#fff' };
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      backgroundColor: color.bg, color: color.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 700, flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {name.split(' ').pop()[0]}
    </div>
  );
}

function Modal({ editItem, isNew, handleChange, handleSave, handleCancel }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        style={{ animation: 'fadeSlideIn 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#fff" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              {isNew ? 'Thêm nhân viên' : 'Chỉnh sửa nhân viên'}
            </h2>
          </div>
          <button onClick={handleCancel} style={{ padding: 6, borderRadius: 8, color: 'var(--text-muted)' }} className="hover:text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
              Tên nhân viên
            </label>
            <input
              name="name" value={editItem.name} onChange={handleChange}
              placeholder="Họ và tên..."
              style={{ width: '100%', height: 40, borderRadius: 10, border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              <Phone size={13} style={{ display: 'inline', marginRight: 4 }} />
              Số điện thoại
            </label>
            <input
              name="phone" value={editItem.phone} onChange={handleChange}
              placeholder="09xxxxxxxx"
              style={{ width: '100%', height: 40, borderRadius: 10, border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Role + Shift */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                <Shield size={13} style={{ display: 'inline', marginRight: 4 }} />
                Vai trò
              </label>
              <select name="role" value={editItem.role} onChange={handleChange}
                style={{ width: '100%', height: 40, borderRadius: 10, border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                Ca làm
              </label>
              <select name="shift" value={editItem.shift} onChange={handleChange}
                style={{ width: '100%', height: 40, borderRadius: 10, border: '1.5px solid var(--border-color)', padding: '0 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                {SHIFTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
              Trạng thái
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Đang làm việc', 'Đang nghỉ'].map(s => (
                <button
                  key={s}
                  onClick={() => handleChange({ target: { name: 'status', value: s } })}
                  style={{
                    flex: 1, height: 38, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: editItem.status === s ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                    backgroundColor: editItem.status === s ? 'rgba(108,17,30,0.07)' : '#fff',
                    color: editItem.status === s ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {s === 'Đang làm việc' ? '✅ ' : '⏸ '}{s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <button
            onClick={handleCancel}
            style={{ height: 38, padding: '0 20px', borderRadius: 10, border: '1.5px solid var(--border-color)', backgroundColor: '#fff', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ height: 38, padding: '0 24px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}
          >
            {isNew ? 'Thêm mới' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  const [staff, setStaff]           = useState(initialStaff);
  const [editItem, setEditItem]      = useState(null);
  const [isNew, setIsNew]            = useState(false);
  const [search, setSearch]          = useState('');
  const [filterRole, setFilterRole]  = useState('');

  const handleEditClick = (item) => { setIsNew(false); setEditItem({ ...item }); };
  const handleAddNew    = ()     => { setIsNew(true);  setEditItem({ ...emptyForm, id: `NV0${staff.length + 1}`, active: 'Vừa thêm' }); };
  const handleCancel    = ()     => setEditItem(null);
  const handleChange    = (e)    => setEditItem(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!editItem.name.trim()) return;
    if (isNew) {
      setStaff(prev => [...prev, editItem]);
    } else {
      setStaff(prev => prev.map(s => s.id === editItem.id ? editItem : s));
    }
    setEditItem(null);
  };

  const filtered = staff.filter(s =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)) &&
    (!filterRole || s.role === filterRole)
  );

  const stats = [
    { label: 'Tổng nhân viên', value: staff.length,                                          icon: <Users size={22} />,      color: 'var(--primary)' },
    { label: 'Đang làm việc',  value: staff.filter(s => s.status === 'Đang làm việc').length, icon: <UserCheck size={22} />,  color: '#16a34a' },
    { label: 'Đang nghỉ',      value: staff.filter(s => s.status === 'Đang nghỉ').length,     icon: <Coffee size={22} />,     color: '#d97706' },
    { label: 'Số ca hôm nay',  value: 3,                                                      icon: <Wifi size={22} />,       color: '#2563eb' },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">

        {/* Page Title */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Nhân viên</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Quản lý danh sách nhân viên, vai trò và ca làm việc</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
          {stats.map(s => (
            <div key={s.label} className="card flex items-center gap-4">
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="card p-0 min-w-0">
          {/* Toolbar */}
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div style={{ position: 'relative' }} className="w-full sm:w-auto">
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text" placeholder="Tìm nhân viên, SĐT..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-[240px]"
                  style={{ paddingLeft: 38, height: 38, borderRadius: 10 }}
                />
              </div>
              {/* Role filter */}
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ height: 38, borderRadius: 10 }} className="flex-1 sm:flex-none">
                <option value="">Tất cả vai trò</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <button className="btn btn-primary w-full md:w-auto" style={{ height: 38, borderRadius: 10 }} onClick={handleAddNew}>
              <Plus size={16} /> Thêm nhân viên
            </button>
          </div>

          {/* Table */}
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Ca làm</th>
                <th>Trạng thái</th>
                <th>Hoạt động</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0', fontSize: 14 }}>
                    Không tìm thấy nhân viên nào
                  </td>
                </tr>
              ) : filtered.map(item => {
                const roleColor = ROLE_COLORS[item.role] || { bg: '#6b7280' };
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={item.name} role={item.role} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 14 }}>{item.phone}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: `${roleColor.bg}18`, color: roleColor.bg }}>
                        <Shield size={11} />
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Clock size={13} />
                        {item.shift}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Đang làm việc' ? 'badge-success' : 'badge-neutral'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.active}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleEditClick(item)}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--border-color)', backgroundColor: '#fff', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        className="hover:text-primary"
                      >
                        <Edit size={15} /> Sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </ResponsiveTable>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editItem && (
        <Modal
          editItem={editItem}
          isNew={isNew}
          handleChange={handleChange}
          handleSave={handleSave}
          handleCancel={handleCancel}
        />
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </PageContainer>
  );
}
