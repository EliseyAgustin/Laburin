import { Navigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';

export function Onboarding() {
  const { status } = useOnboarding();

  if (status === 'loading') return null;
  if (status === 'completo') return <Navigate to="/tablero" replace />;

  return <OnboardingWizard />;
}
