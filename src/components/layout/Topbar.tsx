import { Search, Plus, Bell, HelpCircle, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface TopbarProps {
  title?: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 z-30 bg-background border-b border-outline-variant flex justify-between items-center w-full h-16 px-4 md:px-6 ml-0 max-w-full md:ml-60 md:max-w-[calc(100%-240px)] shrink-0">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="md:hidden p-2.5 -ml-2 mr-1 shrink-0 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title ? (
           <h2 className="text-xl font-heading font-semibold text-primary hidden md:block">{title}</h2>
        ) : (
          <div className="relative w-64 hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm text-on-surface transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="hidden md:flex bg-primary text-on-primary text-sm font-medium px-4 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm items-center gap-2">
          <Plus className="w-4 h-4" />
          Cargar oferta manual
        </button>
        <div className="flex items-center gap-1 md:gap-3 border-l border-outline-variant pl-2 md:pl-4 md:ml-2">
          <ThemeToggle />
          <button className="p-2.5 md:p-2 text-on-secondary-container hover:bg-surface-container-low rounded-full transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2.5 md:p-2 text-on-secondary-container hover:bg-surface-container-low rounded-full transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
