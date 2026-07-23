import { PERMISSION_MODULES } from '../../types/role';

export default function PermissionMatrix({ permissions, onChange }) {
  const allChecked = PERMISSION_MODULES.every(mod =>
    mod.permissions.every(p => permissions[mod.key]?.[p.key])
  );

  const moduleAllChecked = (modKey) => {
    const mod = PERMISSION_MODULES.find(m => m.key === modKey);
    return mod.permissions.every(p => permissions[modKey]?.[p.key]);
  };

  const toggleSingle = (modKey, permKey) => {
    onChange({
      ...permissions,
      [modKey]: {
        ...permissions[modKey],
        [permKey]: !permissions[modKey]?.[permKey],
      },
    });
  };

  const toggleModule = (modKey) => {
    const mod = PERMISSION_MODULES.find(m => m.key === modKey);
    const currentAllChecked = mod.permissions.every(p => permissions[modKey]?.[p.key]);
    const newState = {};
    mod.permissions.forEach(p => {
      newState[p.key] = !currentAllChecked;
    });
    onChange({
      ...permissions,
      [modKey]: newState,
    });
  };

  const selectAll = () => {
    const newPerms = {};
    PERMISSION_MODULES.forEach(mod => {
      newPerms[mod.key] = {};
      mod.permissions.forEach(p => {
        newPerms[mod.key][p.key] = true;
      });
    });
    onChange(newPerms);
  };

  const deselectAll = () => {
    const newPerms = {};
    PERMISSION_MODULES.forEach(mod => {
      newPerms[mod.key] = {};
      mod.permissions.forEach(p => {
        newPerms[mod.key][p.key] = false;
      });
    });
    onChange(newPerms);
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <span className="text-sm font-bold">PHÂN QUYỀN CHI TIẾT</span>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline text-xs px-3 py-1 h-auto" onClick={selectAll}>Chọn tất cả</button>
          <button className="btn btn-outline text-xs px-3 py-1 h-auto" onClick={deselectAll}>Bỏ chọn tất cả</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="w-44 min-w-140px">Module</th>
              {PERMISSION_MODULES[0]?.permissions.map(p => (
                <th key={p.key} className="text-center min-w-16">{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map(mod => (
              <tr key={mod.key}>
                <td className="font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={moduleAllChecked(mod.key)}
                      onChange={() => toggleModule(mod.key)}
                      className="w-4 h-4 cursor-pointer accent-[var(--primary)]"
                    />
                    <span>{mod.name}</span>
                  </div>
                </td>
                {mod.permissions.map(p => (
                  <td key={p.key} className="text-center">
                    <input
                      type="checkbox"
                      checked={permissions[mod.key]?.[p.key] || false}
                      onChange={() => toggleSingle(mod.key, p.key)}
                      className="w-4 h-4 cursor-pointer accent-[var(--primary)]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
