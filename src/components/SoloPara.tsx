import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useRol } from '@/hooks/useRol';
import { rutaInicialPorRol, type Rol } from '@/lib/rol';

// Guarda de rol para un grupo de rutas: quien no corresponde vuelve a su pantalla de inicio. Es una comodidad de
// interfaz; lo que protege los datos son los permisos y las políticas de la base.
export function SoloPara({ rol: permitido }: { rol: Rol }) {
  const { rol } = useRol();

  if (rol === null) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-label="Verificando tu acceso…" />
      </div>
    );
  }
  if (rol !== permitido) return <Navigate to={rutaInicialPorRol(rol)} replace />;

  return <Outlet />;
}
