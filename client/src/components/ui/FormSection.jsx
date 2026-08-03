export default function FormSection({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-start gap-3 mb-5">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon size={16} className="text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-main">{title}</h3>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </div>
  );
}
