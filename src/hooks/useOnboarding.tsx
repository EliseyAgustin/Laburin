import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { obtenerPerfil } from '@/services/onboarding';
import { useAuth } from './useAuth';

type OnboardingStatus = 'loading' | 'pendiente' | 'completo';

interface OnboardingContextValue {
  status: OnboardingStatus;
  refresh: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>('loading');

  async function refresh() {
    if (!session) {
      setStatus('loading');
      return;
    }
    setStatus('loading');
    try {
      const perfil = await obtenerPerfil();
      setStatus(perfil?.onboarding_completado ? 'completo' : 'pendiente');
    } catch {
      setStatus('pendiente');
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  return <OnboardingContext.Provider value={{ status, refresh }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding debe usarse dentro de <OnboardingProvider>');
  return ctx;
}
