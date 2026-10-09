import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { contarMisMensajesNoLeidos, EVENTO_MENSAJES_CAMBIARON } from '@/services/mensajes';

// Contador de mensajes sin leer para el menú: se actualiza al navegar, al volver a la pestaña y cuando
// la pantalla de Mensajes marca, lee o borra algo.
export function useMensajesNoLeidos(activo: boolean): number {
  const [cantidad, setCantidad] = useState(0);
  const { pathname } = useLocation();

  const recargar = useCallback(() => {
    if (!activo) return;
    contarMisMensajesNoLeidos()
      .then(setCantidad)
      .catch(() => undefined);
  }, [activo]);

  useEffect(() => {
    recargar();
  }, [recargar, pathname]);

  useEffect(() => {
    window.addEventListener(EVENTO_MENSAJES_CAMBIARON, recargar);
    window.addEventListener('focus', recargar);
    return () => {
      window.removeEventListener(EVENTO_MENSAJES_CAMBIARON, recargar);
      window.removeEventListener('focus', recargar);
    };
  }, [recargar]);

  return activo ? cantidad : 0;
}
