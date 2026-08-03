export default function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <label className={`switch${disabled ? ' opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="switch-slider" />
    </label>
  );
}
