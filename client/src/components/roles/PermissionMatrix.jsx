import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { PERMISSION_GROUPS } from '../../types/role';

function Checkbox({ checked, indeterminate, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 cursor-pointer accent-[var(--primary)] flex-shrink-0"
    />
  );
}

export default function PermissionMatrix({ permissions, onChange }) {
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    PERMISSION_GROUPS.forEach(g => { init[g.key] = true; });
    return init;
  });

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePerm = (modKey, permKey) => {
    onChange({
      ...permissions,
      [modKey]: {
        ...permissions[modKey],
        [permKey]: !permissions[modKey]?.[permKey],
      },
    });
  };

  const handleToggleModule = (mod) => {
    const allChecked = mod.permissions.every(p => permissions[mod.key]?.[p.key]);
    const newState = {};
    mod.permissions.forEach(p => { newState[p.key] = !allChecked; });
    onChange({ ...permissions, [mod.key]: newState });
  };

  const getModuleState = (mod) => {
    const checked = mod.permissions.filter(p => permissions[mod.key]?.[p.key]);
    if (checked.length === 0) return { checked: false, indeterminate: false };
    if (checked.length === mod.permissions.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const getGroupState = (group) => {
    let total = 0;
    let checked = 0;
    group.modules.forEach(mod => {
      mod.permissions.forEach(p => {
        total++;
        if (permissions[mod.key]?.[p.key]) checked++;
      });
    });
    if (checked === 0) return { checked: false, indeterminate: false };
    if (checked === total) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const handleToggleGroup = (group) => {
    const allChecked = group.modules.every(mod =>
      mod.permissions.every(p => permissions[mod.key]?.[p.key])
    );
    const newPerms = { ...permissions };
    group.modules.forEach(mod => {
      newPerms[mod.key] = { ...permissions[mod.key] };
      mod.permissions.forEach(p => {
        newPerms[mod.key][p.key] = !allChecked;
      });
    });
    onChange(newPerms);
  };

  const handleSelectAll = () => {
    const newPerms = {};
    PERMISSION_GROUPS.forEach(group => {
      group.modules.forEach(mod => {
        newPerms[mod.key] = {};
        mod.permissions.forEach(p => { newPerms[mod.key][p.key] = true; });
      });
    });
    onChange(newPerms);
  };

  const handleDeselectAll = () => {
    const newPerms = {};
    PERMISSION_GROUPS.forEach(group => {
      group.modules.forEach(mod => {
        newPerms[mod.key] = {};
        mod.permissions.forEach(p => { newPerms[mod.key][p.key] = false; });
      });
    });
    onChange(newPerms);
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <span className="text-sm font-bold">PHÂN QUYỀN CHI TIẾT</span>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline text-xs px-3 py-1 h-auto" onClick={handleSelectAll}>Chọn tất cả</button>
          <button className="btn btn-outline text-xs px-3 py-1 h-auto" onClick={handleDeselectAll}>Bỏ chọn tất cả</button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {PERMISSION_GROUPS.map((group, gi) => {
          const gs = getGroupState(group);
          const isExpanded = expanded[group.key];

          return (
            <div key={group.key} className={gi > 0 ? 'border-t' : ''}>
              <div
                className="flex items-center gap-2.5 px-4 py-3 bg-gray-100 cursor-pointer select-none"
                onClick={() => toggleExpand(group.key)}
              >
                <span className="text-muted flex-shrink-0">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </span>
                <Checkbox
                  checked={gs.checked}
                  indeterminate={gs.indeterminate}
                  onChange={() => handleToggleGroup(group)}
                />
                <span className="text-sm font-bold flex-1 min-w-0 truncate tracking-wide">
                  {group.name}
                </span>
                <span className="text-xs text-muted font-semibold whitespace-nowrap bg-white px-2.5 py-0.5 rounded-full">
                  {group.modules.length} chức năng
                </span>
              </div>

              {isExpanded && (
                <div style={{ marginLeft: '52px' }} className="pl-4 border-l-2 border-gray-100 py-1">
                  {group.modules.map((mod, mi) => {
                    const ms = getModuleState(mod);

                    return (
                      <div key={mod.key} className={mi < group.modules.length - 1 ? 'mb-1' : ''}>
                        <div
                          className="flex items-center gap-2.5 py-2 pr-4 cursor-pointer select-none rounded hover-bg-gray-50"
                          onClick={() => handleToggleModule(mod)}
                        >
                          <Checkbox
                            checked={ms.checked}
                            indeterminate={ms.indeterminate}
                            onChange={() => handleToggleModule(mod)}
                          />
                          <span className="text-sm font-semibold flex-1 min-w-0 truncate">
                            {mod.name}
                          </span>
                          <span className="text-xs text-muted whitespace-nowrap">
                            {mod.permissions.length} quyền
                          </span>
                        </div>

                        <div style={{ marginLeft: '26px' }} className="pl-1 pb-1.5">
                          {mod.permissions.map(p => (
                            <label
                              key={p.key}
                              className="flex items-center gap-2.5 py-1 pr-4 cursor-pointer select-none rounded hover-bg-gray-50"
                              onClick={() => handleTogglePerm(mod.key, p.key)}
                            >
                              <input
                                type="checkbox"
                                checked={permissions[mod.key]?.[p.key] || false}
                                onChange={() => handleTogglePerm(mod.key, p.key)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 cursor-pointer accent-[var(--primary)] flex-shrink-0"
                              />
                              <span className="text-sm text-secondary">{p.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
