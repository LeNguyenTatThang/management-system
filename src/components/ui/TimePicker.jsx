const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function TimePicker({ value = '', onChange, placeholder: _placeholder = 'Chọn giờ' }) {
  const [hour, min] = value ? value.split(':') : ['', ''];

  const handleHour = (h) => {
    const m = min || '00';
    onChange(h ? `${h}:${m}` : '');
  };

  const handleMin = (m) => {
    const h = hour || '00';
    onChange(m ? `${h}:${m}` : '');
  };

  return (
    <div className="flex items-center gap-1">
      <select className="w-full modal-input" value={hour} onChange={e => handleHour(e.target.value)}>
        <option value="">Giờ</option>
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-muted font-bold text-lg flex-shrink-0">:</span>
      <select className="w-full modal-input" value={min} onChange={e => handleMin(e.target.value)}>
        <option value="">Phút</option>
        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}
