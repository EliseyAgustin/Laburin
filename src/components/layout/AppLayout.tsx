import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Cualquier navegación cierra el drawer mobile, así no queda abierto tapando la vista de destino.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  let topbarTitle = undefined;
  if (location.pathname === '/ofertas') topbarTitle = 'Explorar Ofertas';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col w-full md:ml-60 md:w-[calc(100%-240px)] h-screen overflow-hidden relative">
        <Topbar title={topbarTitle} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-auto pt-16 h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
