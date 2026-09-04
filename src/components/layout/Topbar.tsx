import { Search, Plus, Bell, HelpCircle } from 'lucide-react';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 z-30 bg-background border-b border-outline-variant flex justify-between items-center w-full h-16 px-6 ml-60 max-w-[calc(100%-240px)] shrink-0">
      <div className="flex items-center flex-1">
        {title ? (
           <h2 className="text-xl font-semibold text-primary hidden md:block">{title}</h2>
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

      <div className="flex items-center gap-4">
        <button className="bg-primary text-on-primary text-sm font-medium px-4 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Cargar oferta manual
        </button>
        <div className="flex items-center gap-1 border-l border-outline-variant pl-4 ml-2">
          <button className="p-2 text-on-secondary-container hover:bg-surface-container-low rounded-full transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-secondary-container hover:bg-surface-container-low rounded-full transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
