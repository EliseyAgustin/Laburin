import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { status } = useOnboarding();

  if (status === 'loading') return null;
  if (status === 'pendiente') return <Navigate to="/onboarding" replace />;

  return children;
}
