import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function FilterPopover({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  getFilterLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const activeFilterCount = filters.reduce((count, filter) => {
    const value = activeFilters[filter.key];
    return value !== undefined && value !== '' ? count + 1 : count;
  }, 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getFilterGroupLabel = () => {
    if (typeof getFilterLabel === 'function') {
      return getFilterLabel(filters);
    }

    if (filters.length === 1) {
      return filters[0].label;
    }

    if (filters.length === 2) {
      return `Lọc theo ${filters.map((f) => f.label).join(' & ')}`;
    }

    return 'Bộ lọc';
  };

  return (
    <div className="relative flex-shrink-0">
      {/* Filter Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`
          filter-btn
          flex items-center gap-1.5
          h-36px px-3
          cursor-pointer
          whitespace-nowrap
          transition-all duration-200
          ${
            activeFilterCount > 0
              ? 'bg-primary-light border-primary text-primary shadow-sm'
              : 'bg-white border-gray-200 text-muted hover:bg-gray-50 hover:border-gray-300'
          }
        `}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Bộ lọc"
      >
        <SlidersHorizontal size={16} />

        <span className="text-sm font-medium">
          Bộ lọc
        </span>

        {activeFilterCount > 0 && (
          <span className="
            inline-flex
            items-center
            justify-center
            min-w-5
            h-5
            px-1
            rounded-full
            bg-primary
            text-white
            text-xs
            font-bold
          ">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="
            absolute
            right-0
            top-full
            mt-2
            z-50
            bg-white
            rounded-xl
            border
            border-soft
            shadow-lg
            p-4
            animate-fade-slide-in
          "
          style={{ width: 'min(320px, calc(100vw - 32px))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="
            flex
            items-center
            justify-between
            gap-3
            mb-5
          ">
            <h3 className="
              min-w-0
              flex-1
              text-sm
              font-semibold
              text-main
              truncate
            ">
              {getFilterGroupLabel()}
            </h3>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                className="
                  flex-shrink-0
                  text-xs
                  text-danger
                  hover:underline
                  cursor-pointer
                "
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 min-w-0">
            {filters.map((filter) => (
              <div
                key={filter.key}
                className="w-full min-w-0"
              >
                <label className="
                  block
                  text-xs
                  font-semibold
                  text-muted
                  mb-1.5
                ">
                  {filter.label}
                </label>

                <div className="relative w-full min-w-0">
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) =>
                      onFilterChange(
                        filter.key,
                        e.target.value
                      )
                    }
                    className="
                      block
                      w-full
                      max-w-full
                      min-w-0
                      h-38px
                      px-3
                      pr-8
                      rounded-md
                      border
                      border-soft
                      bg-white
                      text-sm
                      text-main
                      cursor-pointer
                      appearance-none
                      box-border
                      focus:outline-none
                      focus:border-primary
                      transition-colors
                    "
                  >
                    {filter.options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="
            flex
            justify-end
            mt-5
            pt-3
            border-t
            border-soft
          ">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                h-34px
                px-4
                rounded-md
                text-sm
                font-medium
                text-primary
                hover:bg-primary-light
                cursor-pointer
                transition-colors
              "
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}