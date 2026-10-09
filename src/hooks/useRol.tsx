import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Rol } from '@/lib/rol';
import { obtenerMiRol } from '@/services/roles';
import { useAuth } from './useAuth';

interface RolContextValue {
  // null mientras se consulta (o sin sesión): las guardas de ruta esperan en lugar de decidir a ciegas.
  rol: Rol | null;
}

const RolContext = createContext<RolContextValue | undefined>(undefined);

export function RolProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [rol, setRol] = useState<Rol | null>(null);
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setRol(null);
      return;
    }
    let cancelado = false;
    setRol(null);
    obtenerMiRol()
      // Ante un error se asume candidato: es el rol con menos alcance, y la base aplica las mismas reglas igual.
      .then((r) => !cancelado && setRol(r))
      .catch(() => !cancelado && setRol('candidato'));
    return () => {
      cancelado = true;
    };
  }, [userId]);

  return <RolContext.Provider value={{ rol }}>{children}</RolContext.Provider>;
}

export function useRol() {
  const ctx = useContext(RolContext);
  if (!ctx) throw new Error('useRol debe usarse dentro de <RolProvider>');
  return ctx;
}
