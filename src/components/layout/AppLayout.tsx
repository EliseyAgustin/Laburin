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
      {/*
        Misma identidad visual que el fondo de Login/Registro, mucho más atenuada (~40% de esa opacidad):
        acá hay contenido denso (tarjetas, Kanban, gráficos) que no puede competir con el fondo.
        `fixed` (no `absolute`): no se mueve con el scroll vertical de `main` ni con el horizontal del Tablero.
        Sin z-index propio: al ser el primer hijo pinta detrás del contenido (`relative`) y del Sidebar (z-50).
        Las formas van hacia los bordes/esquinas, lejos del centro donde vive el contenido.
      */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-10 w-120 h-120 rounded-full bg-tertiary/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-secondary/4 blur-3xl" />
      </div>

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
