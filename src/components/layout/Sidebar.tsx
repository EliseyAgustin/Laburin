import { NavLink } from 'react-router-dom';
import { Briefcase, LayoutDashboard, BarChart2, Settings, LogOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { icon: Briefcase, label: 'Ofertas', path: '/ofertas' },
  { icon: LayoutDashboard, label: 'Tablero', path: '/tablero' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Configuración', path: '/configuracion' },
];

export function Sidebar() {
  return (
    <aside className="fixed h-screen w-[240px] left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-md px-sm z-40">
      {/* Header */}
      <div className="px-sm mb-xl flex flex-col gap-sm mt-sm">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg shrink-0">
            L
          </div>
          <div className="font-bold text-xl leading-tight text-primary">Laburin</div>
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
      <div className="mt-auto pt-4 border-t border-outline-variant">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </NavLink>
      </div>
    </aside>
  );
}
