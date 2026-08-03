import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../contexts/StaffContext';
import { getRoles } from '../../services/employeeService';
import { ArrowLeft, User, Briefcase, DollarSign } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import FormSection from '../../components/ui/FormSection';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['Đang làm', 'Đã nghỉ việc', 'Tạm nghỉ'];
const SALARY_TYPE_OPTIONS = ['Theo tháng', 'Theo ca'];

export default function EmployeeCreate() {
  const { addStaff } = useStaff();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Nam');
  const [citizenId, setCitizenId] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState('Đang làm');
  const [salaryType, setSalaryType] = useState('Theo tháng');
  const [salary, setSalary] = useState('');
  const [monthlyLeaveDays, setMonthlyLeaveDays] = useState('');
  const [remainingLeaveDays, setRemainingLeaveDays] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRoles()
      .then((data) => {
        setRoles(data);
        if (data.length > 0) setRoleId(String(data[0].id));
      })
      .catch(() => {
        toast.error('Không thể tải danh sách chức vụ');
      });
  }, []);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    if (!roleId) errs.roleId = 'Vui lòng chọn chức vụ';
    if (salary && Number(salary) < 0) errs.salary = 'Lương không được nhỏ hơn 0';
    if (monthlyLeaveDays && Number(monthlyLeaveDays) < 0) errs.monthlyLeaveDays = 'Không được nhỏ hơn 0';
    if (remainingLeaveDays && Number(remainingLeaveDays) < 0) errs.remainingLeaveDays = 'Không được nhỏ hơn 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await addStaff({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        roleId: Number(roleId),
        dateOfBirth: dateOfBirth || undefined,
        gender,
        citizenId,
        address,
        avatar: image ? image.name : null,
        startDate: startDate || undefined,
        status,
        salaryType,
        salary: salary ? Number(salary) : undefined,
        monthlyLeaveDays: monthlyLeaveDays ? Number(monthlyLeaveDays) : undefined,
        remainingLeaveDays: remainingLeaveDays ? Number(remainingLeaveDays) : undefined,
        note,
      });
      toast.success('Thêm nhân viên thành công');
      navigate('/staff');
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi thêm nhân viên');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <button className="hover-text-primary cursor-pointer" onClick={() => navigate('/staff')}>QL Nhân viên</button>
            <span>&gt;</span>
            <span className="text-main font-semibold">Thêm</span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted hover-text-primary cursor-pointer"
            onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Thêm nhân viên</h1>
          <p className="text-muted text-sm mt-1">Nhập thông tin để tạo nhân viên mới</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection icon={User} title="THÔNG TIN CÁ NHÂN" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Họ và tên <span className="text-danger">*</span></label>
                <input type="text" placeholder="Nhập họ tên..."
                  className={`w-full modal-input ${errors.name ? 'border-danger' : ''}`}
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Số điện thoại</label>
                <input type="tel" placeholder="Số điện thoại..."
                  className="w-full modal-input"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày sinh</label>
                <input type="date"
                  className="w-full modal-input"
                  value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Giới tính</label>
                <select className="w-full modal-input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">CCCD</label>
                <input type="text" placeholder="Số CCCD..."
                  className="w-full modal-input"
                  value={citizenId} onChange={e => setCitizenId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email <span className="text-danger">*</span></label>
                <input type="email" placeholder="Nhập email..."
                  className={`w-full modal-input ${errors.email ? 'border-danger' : ''}`}
                  value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold mb-1.5">Địa chỉ</label>
              <input type="text" placeholder="Nhập địa chỉ..."
                className="w-full modal-input"
                value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold mb-1.5">Hình ảnh</label>
              <input type="file" accept="image/*"
                className="w-full modal-input file-input"
                onChange={e => setImage(e.target.files[0] || null)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mật khẩu <span className="text-danger">*</span></label>
                <input type="password" placeholder="Nhập mật khẩu..."
                  className={`w-full modal-input ${errors.password ? 'border-danger' : ''}`}
                  value={password} onChange={e => setPassword(e.target.value)} />
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection icon={Briefcase} title="THÔNG TIN CÔNG VIỆC" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Chức vụ <span className="text-danger">*</span></label>
                <select className={`w-full modal-input ${errors.roleId ? 'border-danger' : ''}`} value={roleId} onChange={e => setRoleId(e.target.value)}>
                  {roles.length === 0 && <option value="">Đang tải chức vụ...</option>}
                  {roles.map(r => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
                </select>
                {errors.roleId && <p className="text-xs text-danger mt-1">{errors.roleId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Ngày bắt đầu nhận việc</label>
                <input type="date"
                  className="w-full modal-input"
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Trạng thái</label>
                <select className="w-full modal-input" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection icon={DollarSign} title="THÔNG TIN LƯƠNG VÀ CHẤM CÔNG" className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Hình thức tính lương</label>
                <select className="w-full modal-input" value={salaryType} onChange={e => setSalaryType(e.target.value)}>
                  {SALARY_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Lương</label>
                <input type="number" min="0" placeholder="0"
                  className={`w-full modal-input ${errors.salary ? 'border-danger' : ''}`}
                  value={salary} onChange={e => setSalary(e.target.value)} />
                {errors.salary && <p className="text-xs text-danger mt-1">{errors.salary}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Số ngày phép tháng</label>
                <input type="number" min="0" placeholder="0"
                  className={`w-full modal-input ${errors.monthlyLeaveDays ? 'border-danger' : ''}`}
                  value={monthlyLeaveDays} onChange={e => setMonthlyLeaveDays(e.target.value)} />
                {errors.monthlyLeaveDays && <p className="text-xs text-danger mt-1">{errors.monthlyLeaveDays}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Số ngày phép còn lại</label>
                <input type="number" min="0" placeholder="0"
                  className={`w-full modal-input ${errors.remainingLeaveDays ? 'border-danger' : ''}`}
                  value={remainingLeaveDays} onChange={e => setRemainingLeaveDays(e.target.value)} />
                {errors.remainingLeaveDays && <p className="text-xs text-danger mt-1">{errors.remainingLeaveDays}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold mb-1.5">Ghi chú</label>
              <textarea rows={3} placeholder="Nhập ghi chú..."
                className="w-full modal-input resize-none"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </FormSection>

          <div className="flex items-center justify-end gap-3 mt-6 mb-8">
            <button type="button" className="btn btn-outline modal-btn px-6" onClick={() => navigate('/staff')}>Hủy</button>
            <button type="submit" className={`btn btn-primary modal-btn px-6 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
