import { Menu } from 'lucide-react';

interface TopbarProps {
  title?: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="fixed top-0 right-0 z-30 bg-background border-b border-outline-variant flex items-center w-full h-16 px-4 md:px-6 ml-0 max-w-full md:ml-60 md:max-w-[calc(100%-240px)] shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="md:hidden p-2.5 -ml-2 mr-1 shrink-0 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {title && <h2 className="text-xl font-heading font-semibold text-primary hidden md:block">{title}</h2>}
    </header>
  );
}
