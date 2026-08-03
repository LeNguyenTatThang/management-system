import { useTheme } from '../../contexts/ThemeContext';
import { Palette, CheckCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

function ThemePreview({ theme }) {
  const p = theme.preview;
  const isDark = theme.id === 'dark';

  return (
    <div className="w-full h-40 rounded-t-xl overflow-hidden" style={{ background: p.bg }}>
      <div className="flex h-full">
        <div className="w-1/4 h-full flex flex-col" style={{ background: p.sidebar, borderRight: `1px solid ${p.border}` }}>
          <div className="h-6 flex items-center px-1.5" style={{ borderBottom: `1px solid ${p.border}` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: p.primary }} />
            <div className="w-8 h-1.5 ml-1 rounded-sm" style={{ background: p.text, opacity: 0.3 }} />
          </div>
          <div className="flex-1 p-1.5 space-y-1">
            <div className="w-full h-2 rounded-sm" style={{ background: p.primary, opacity: 0.7 }} />
            <div className="w-full h-2 rounded-sm" style={{ background: p.text, opacity: 0.12 }} />
            <div className="w-full h-2 rounded-sm" style={{ background: p.text, opacity: 0.12 }} />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-6 flex items-center px-2" style={{ background: p.header, borderBottom: `1px solid ${p.border}` }}>
            <div className="flex-1" />
            <div className="w-4 h-2 rounded-sm" style={{ background: p.primary, opacity: 0.6 }} />
          </div>
          <div className="flex-1 p-2 space-y-1.5">
            <div className="w-3/5 h-2.5 rounded" style={{ background: p.card, border: `1px solid ${p.border}` }} />
            <div className="w-full h-8 rounded" style={{ background: p.card, border: `1px solid ${p.border}` }}>
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-2 rounded-sm" style={{ background: isDark ? p.primary : p.primary, opacity: 0.9 }} />
              </div>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 h-2 rounded-sm" style={{ background: p.text, opacity: 0.08 }} />
              <div className="flex-1 h-2 rounded-sm" style={{ background: p.text, opacity: 0.08 }} />
              <div className="flex-1 h-2 rounded-sm" style={{ background: p.primary, opacity: 0.12 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Themes() {
  const { themes, activeThemeId, setTheme } = useTheme();

  const activateTheme = (id) => {
    setTheme(id);
    const theme = themes.find(t => t.id === id);
    toast.success(`Đã chuyển sang giao diện "${theme?.name}"`);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Theme</h2>
            <p className="text-muted text-sm">Quản lý giao diện hệ thống</p>
          </div>
          <div className="text-sm text-muted bg-card px-3 py-1.5 rounded-lg border">
            {themes.length} giao diện
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full min-w-0">
          {themes.map(theme => {
            const isActive = theme.id === activeThemeId;
            return (
              <div
                key={theme.id}
                className={`card p-0 flex flex-col overflow-hidden rounded-xl transition ${
                  isActive ? 'ring-2' : ''
                }`}
                style={isActive ? { borderColor: 'var(--primary)', boxShadow: 'var(--shadow-primary)' } : {}}
              >
                <ThemePreview theme={theme} />

                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-bold text-base">{theme.name}</h3>
                  <p className="text-sm text-muted leading-normal">{theme.description}</p>

                  {isActive && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <CheckCircle size={16} />
                      <span>Đang sử dụng</span>
                    </div>
                  )}

                  {!isActive && (
                    <button
                      className="btn btn-primary text-sm mt-2 w-full justify-center"
                      onClick={() => activateTheme(theme.id)}
                    >
                      <Palette size={16} /> Sử dụng theme
                    </button>
                  )}
                  {isActive && (
                    <div
                      className="mt-2 text-sm font-semibold text-center py-2 px-3 rounded-lg"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                    >
                      ✓ Đang sử dụng
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
