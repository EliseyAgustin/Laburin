import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, LayoutDashboard, BarChart2, Settings, LogOut, X, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { CuentaModal } from '@/components/CuentaModal';
import logoIcono from '@/assets/logo/laburin-logo-icono.svg';

const navItems = [
  { icon: Briefcase, label: 'Ofertas', path: '/ofertas' },
  { icon: LayoutDashboard, label: 'Tablero', path: '/tablero' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [cuentaAbierta, setCuentaAbierta] = useState(false);

  // Evita que el fondo scrollee detrás del drawer mientras está abierto en mobile.
  useEffect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [open]);

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <>
      {open && (
        <div onClick={onClose} aria-hidden="true" className="fixed inset-0 z-40 bg-black/40 md:hidden" />
      )}

      <aside
        className={cn(
          'fixed h-screen w-60 left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-md px-sm z-50 transition-transform duration-200 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="px-sm mb-xl flex flex-col gap-sm mt-sm">
          <div className="flex items-center justify-between gap-sm">
            <div className="flex items-center gap-sm">
              <img src={logoIcono} alt="" className="w-8 h-8 rounded-full shrink-0" />
              <div className="font-heading font-bold text-xl leading-tight text-primary">Laburin</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="md:hidden p-2.5 -mr-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs font-medium text-on-surface-variant">Gestión de Empleos</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-surface-container-low text-primary font-bold border-r-4 border-primary scale-[0.98]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                )
              }
            >
              <item.icon className={cn("w-5 h-5")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-outline-variant space-y-1">
          <button
            type="button"
            onClick={() => setCuentaAbierta(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <UserCircle className="w-5 h-5" />
            <span>Mi cuenta</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {cuentaAbierta && <CuentaModal onClose={() => setCuentaAbierta(false)} />}
    </>
  );
}
