import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useStaff } from '../../contexts/StaffContext';
import { ArrowLeft, Calendar, MapPin, Clock, Users, FileText, AlertTriangle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import DatePicker from '../../components/ui/DatePicker';
import { SHIFT_DURATIONS, SHIFT_TYPES, BRANCHES, getAvailableStartTimes, calcEndTime } from '../../utils/shiftConfig';
import { toast } from 'react-hot-toast';

export default function ScheduleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getScheduleById, updateSchedule, checkConflict } = useSchedule();
  const { staffList } = useStaff();

  const [date, setDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [duration, setDuration] = useState(8);
  const [startTime, setStartTime] = useState('');
  const [employeeIds, setEmployeeIds] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = getScheduleById(id);
    if (!s) {
      toast.error('Không tìm thấy lịch làm việc');
      navigate('/schedules');
      return;
    }
    setDate(s.date);
    setBranchId(s.branchId);
    setShiftType(s.shiftType);
    setDuration(s.duration);
    setStartTime(s.startTime);
    setEmployeeIds(s.employeeIds || []);
    setNote(s.note || '');
    setLoaded(true);
  }, [id, getScheduleById, navigate]);

  useEffect(() => {
    if (date) setErrors(prev => ({ ...prev, date: '' }));
  }, [date]);

  const startTimes = getAvailableStartTimes(duration);
  const endTime = startTime ? calcEndTime(startTime, duration) : '';

  const toggleEmployee = (id) => {
    setEmployeeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredStaff = staffList.filter(s => {
    const q = employeeSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.role && s.role.toLowerCase().includes(q));
  });

  const validate = () => {
    const errs = {};
    if (!date.trim()) errs.date = 'Vui lòng chọn ngày làm việc';
    if (!branchId) errs.branchId = 'Vui lòng chọn chi nhánh';
    if (!startTime) errs.startTime = 'Vui lòng chọn giờ bắt đầu';
    if (employeeIds.length === 0) errs.employeeIds = 'Vui lòng chọn ít nhất 1 nhân viên';

    if (date && startTime && endTime && employeeIds.length > 0) {
      const conflicts = [];
      employeeIds.forEach(eid => {
        const emp = staffList.find(s => s.id === eid);
        const clash = checkConflict(eid, date, startTime, endTime, id);
        if (clash.length > 0) {
          conflicts.push(`${emp?.name || eid}: ${clash.map(c => `${c.startTime}-${c.endTime}`).join(', ')}`);
        }
      });
      if (conflicts.length > 0) {
        errs.conflict = conflicts.join('\n');
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const branch = BRANCHES.find(b => b.id === branchId);
      const employeesData = employeeIds.map(eid => {
        const emp = staffList.find(s => s.id === eid);
        return { id: emp?.id || eid, name: emp?.name || eid, role: emp?.role || '' };
      });
      updateSchedule(id, {
        date: date.trim(),
        branchId,
        branchName: branch?.name || branchId,
        shiftType,
        duration,
        startTime,
        endTime,
        employeeIds,
        employees: employeesData,
        note: note.trim(),
      });
      toast.success('Cập nhật lịch làm việc thành công');
      navigate(`/schedules/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/schedules')}>QL Lịch Làm Việc</button>
          <span>&gt;</span>
          <span className="text-main font-semibold">Sửa</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary mb-6 cursor-pointer"
          onClick={() => navigate(`/schedules/${id}`)}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sửa lịch làm việc</h1>
          <p className="text-muted text-sm mt-1">Cập nhật thông tin ca làm việc</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={Calendar} title="THÔNG TIN CA LÀM VIỆC" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày làm việc <span className="text-danger">*</span></label>
                <DatePicker value={date} onChange={setDate} placeholder="Chọn ngày làm việc" error={errors.date} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Chi nhánh <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.branchId ? 'border-danger' : ''}`}
                  value={branchId} onChange={e => setBranchId(e.target.value)}>
                  <option value="">-- Chọn chi nhánh --</option>
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.branchId && <p className="text-xs text-danger mt-1">{errors.branchId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Loại ca</label>
                <select className="w-full modal-input" value={shiftType} onChange={e => setShiftType(e.target.value)}>
                  {SHIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Thời lượng <span className="text-danger">*</span></label>
                <select className="w-full modal-input" value={duration} onChange={e => { setDuration(Number(e.target.value)); setStartTime(''); }}>
                  {SHIFT_DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giờ bắt đầu <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.startTime ? 'border-danger' : ''}`}
                  value={startTime} onChange={e => setStartTime(e.target.value)}>
                  <option value="">-- Chọn giờ --</option>
                  {startTimes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.startTime && <p className="text-xs text-danger mt-1">{errors.startTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giờ kết thúc</label>
                <input type="text" className="w-full modal-input bg-gray-50 text-muted" value={endTime} readOnly />
              </div>
            </div>
          </FormSection>

          <FormSection icon={Users} title="NHÂN VIÊN" className="mb-5">
            {errors.employeeIds && <p className="text-xs text-danger mb-2">{errors.employeeIds}</p>}
            {errors.conflict && (
              <div className="flex items-start gap-2 p-3 bg-danger-light rounded-lg mb-3">
                <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                <div className="text-xs text-danger whitespace-pre-line">{errors.conflict}</div>
              </div>
            )}
            <input type="text" placeholder="Tìm nhân viên..." className="w-full modal-input mb-3"
              value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} />
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {filteredStaff.map(emp => {
                const selected = employeeIds.includes(emp.id);
                return (
                  <label key={emp.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selected ? 'border-primary bg-primary-light' : 'border-soft hover-border-primary'}`}
                    onClick={() => toggleEmployee(emp.id)}>
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
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate(`/schedules/${id}`)}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
