export default function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  rows = 3,
  minHeight,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition duration-200 resize-y
          ${error ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20' : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-gray-300'}
          ${minHeight ? `min-h-[${minHeight}]` : 'min-h-[100px]'}
          outline-none
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted mt-1">{helperText}</p>}
    </div>
  );
}
