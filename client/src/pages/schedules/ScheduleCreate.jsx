import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useStaff } from '../../contexts/StaffContext';
import { ArrowLeft, Calendar, Users, FileText, Clock } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import { getShifts } from '../../services/scheduleService';
import { toast } from 'react-hot-toast';

export default function ScheduleCreate() {
  const navigate = useNavigate();
  const { addSchedule } = useSchedule();
  const { staffList } = useStaff();

  const [date, setDate] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    getShifts().then(setShifts).catch(() => {});
  }, []);

  useEffect(() => {
    if (date) setErrors(prev => ({ ...prev, date: '' }));
  }, [date]);

  const filteredStaff = staffList.filter(s => {
    const q = employeeSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.role && s.role.toLowerCase().includes(q));
  });

  const validate = () => {
    const errs = {};
    if (!date) errs.date = 'Vui lòng chọn ngày làm việc';
    if (!shiftId) errs.shiftId = 'Vui lòng chọn ca làm việc';
    if (!employeeId) errs.employeeId = 'Vui lòng chọn nhân viên';
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      errs.checkOut = 'Check-out phải sau check-in';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await addSchedule({
        employeeId: Number(employeeId),
        date: new Date(date).toISOString(),
        shiftId: Number(shiftId),
        checkIn: checkIn ? new Date(checkIn).toISOString() : undefined,
        checkOut: checkOut ? new Date(checkOut).toISOString() : undefined,
        note: note.trim() || undefined,
      });
      toast.success('Tạo lịch làm việc thành công');
      navigate('/schedules');
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/schedules')}>QL Lịch Làm Việc</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Thêm</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/schedules')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tạo lịch làm việc</h1>
          <p className="text-muted text-sm mt-1">Thiết lập ca làm việc mới cho nhân viên</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Calendar} title="THÔNG TIN CA LÀM VIỆC" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày làm việc <span className="text-danger">*</span></label>
                <input type="date" className={`w-full modal-input ${errors.date ? 'border-danger' : ''}`}
                  value={date} onChange={e => setDate(e.target.value)} />
                {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ca làm việc <span className="text-danger">*</span></label>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted flex-shrink-0" />
                  <select className={`w-full modal-input ${errors.shiftId ? 'border-danger' : ''}`}
                    value={shiftId} onChange={e => setShiftId(e.target.value)}>
                    <option value="">-- Chọn ca --</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
                  </select>
                </div>
                {errors.shiftId && <p className="text-xs text-danger mt-1">{errors.shiftId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Check-in</label>
                <input type="datetime-local" className="w-full modal-input"
                  value={checkIn} onChange={e => setCheckIn(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Check-out</label>
                <input type="datetime-local" className={`w-full modal-input ${errors.checkOut ? 'border-danger' : ''}`}
                  value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                {errors.checkOut && <p className="text-xs text-danger mt-1">{errors.checkOut}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection icon={Users} title="NHÂN VIÊN" className="mb-5">
            {errors.employeeId && <p className="text-xs text-danger mb-2">{errors.employeeId}</p>}
            <input type="text" placeholder="Tìm nhân viên..." className="w-full modal-input mb-3"
              value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} />
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {filteredStaff.map(emp => {
                const selected = String(employeeId) === String(emp.id);
                return (
                  <label key={emp.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selected ? 'border-primary bg-primary-light' : 'border-soft hover-border-primary'}`}
                    onClick={() => setEmployeeId(emp.id)}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{emp.name}</div>
                      <div className="text-xs text-muted">{emp.role || 'Nhân viên'}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </label>
                );
              })}
              {filteredStaff.length === 0 && (
                <p className="text-sm text-muted text-center py-4">Không tìm thấy nhân viên</p>
              )}
            </div>
          </FormSection>

          <FormSection icon={FileText} title="GHI CHÚ" className="mb-6">
            <textarea placeholder="Ghi chú (không bắt buộc)..." className="w-full modal-input" rows={3}
              value={note} onChange={e => setNote(e.target.value)} />
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/schedules')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Tạo lịch'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
