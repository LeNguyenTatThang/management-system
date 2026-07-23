import { useState } from 'react';
import { mockThemes } from '../data/mockData';
import { Palette, CheckCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { toast } from 'react-hot-toast';

export default function Themes() {
  const [themes, setThemes] = useState(mockThemes);

  const activateTheme = (id) => {
    setThemes(prev => prev.map(t => ({ ...t, status: t.id === id ? 'active' : 'inactive' })));
    const theme = themes.find(t => t.id === id);
    toast.success(`Đã chuyển sang theme "${theme?.name}"`);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 w-full min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Quản lý Theme</h2>
            <p className="text-muted text-sm">Quản lý {themes.length} giao diện</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full min-w-0">
          {themes.map(theme => {
            const isActive = theme.status === 'active';
            return (
              <div key={theme.id} className={`card p-0 flex flex-col overflow-hidden rounded-xl transition ${isActive ? 'ring-2 ring-primary' : ''}`}>
                <div className="relative w-full h-40 bg-bg overflow-hidden">
                  <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover" />
                  {isActive && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={14} /> Đang sử dụng
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-bold text-base">{theme.name}</h3>
                  <p className="text-sm text-muted leading-normal">{theme.description}</p>
                  {!isActive && (
                    <button className="btn btn-outline text-sm mt-2 w-full justify-center h-36px"
                      onClick={() => activateTheme(theme.id)}>
                      <Palette size={16} /> Sử dụng
                    </button>
                  )}
                  {isActive && (
                    <div className="text-sm text-primary font-semibold mt-2 text-center py-1.5 px-3 bg-primary-light rounded-lg">
                      Đang hoạt động
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
