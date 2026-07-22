import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  const location = useLocation();
  const isPOS = location.pathname.includes('/pos');

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {!isPOS && <Sidebar />}
      <div className="flex-1 min-w-0 w-full flex flex-col h-full overflow-hidden">
        {!isPOS && <Topbar />}
        <main className={`w-full min-w-0 flex-1 overflow-y-auto ${isPOS ? 'p-0' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
