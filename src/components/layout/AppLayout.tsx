import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const location = useLocation();
  
  let topbarTitle = undefined;
  if (location.pathname === '/ofertas') topbarTitle = 'Explorar Ofertas';
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[240px] w-[calc(100%-240px)] h-screen overflow-hidden relative">
        <Topbar title={topbarTitle} />
        <main className="flex-1 overflow-auto pt-16 h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
