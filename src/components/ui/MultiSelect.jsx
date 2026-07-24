import { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

export default function MultiSelect({ options = [], value = [], onChange, placeholder = 'Chọn...', searchPlaceholder = 'Tìm kiếm...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const sel = v => value.includes(v);

  const toggle = (v) => {
    onChange(sel(v) ? value.filter(x => x !== v) : [...value, v]);
  };

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div
        className={`w-full flex items-center gap-1 cursor-pointer transition px-3 py-2 rounded-md bg-white ${isOpen ? 'border-primary' : 'border border-gray-200 hover:border-gray-300'}`}
        style={{ minHeight: '44px', borderWidth: '1.5px', borderStyle: 'solid', boxShadow: isOpen ? '0 0 0 3px var(--primary-light)' : undefined }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex items-center flex-wrap gap-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-muted text-sm truncate">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1 w-full overflow-y-auto" style={{ maxHeight: '104px' }}>
              {value.map(v => {
                const opt = options.find(o => o.value === v);
                const label = opt?.label || v;
                return (
                  <span key={v} className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {label}
                    <button type="button" className="hover-text-danger cursor-pointer flex-shrink-0 leading-none" onClick={e => { e.stopPropagation(); onChange(value.filter(x => x !== v)); }}>
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <ChevronDown size={16} className="text-muted flex-shrink-0 -mr-0.5" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-soft animate-fade-slide-in overflow-hidden w-full">
          <div className="p-3 pb-2 border-b border-soft">
            <div className="relative">
              <Search size={15} className="absolute left-12px absolute-center-y text-muted pointer-events-none" />
              <input type="text" placeholder={searchPlaceholder}
                className="w-full pl-10 pr-3 h-36px text-sm border border-gray-200 rounded-md"
                value={search} onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()} autoFocus
              />
            </div>
          </div>
          <div className="max-h-300px overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="text-center text-muted text-sm py-6">Không tìm thấy</div>
            ) : (
              filtered.map(opt => (
                <button key={opt.value} type="button"
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition ${sel(opt.value) ? 'bg-primary-light text-primary font-semibold' : 'text-main hover-bg-primary-light'}`}
                  onClick={() => toggle(opt.value)}
                >
                  <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition ${sel(opt.value) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {sel(opt.value) && <Check size={11} className="text-white" style={{ strokeWidth: 3 }} />}
                  </div>
                  <span className="flex-1 truncate">{opt.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
