import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import logoTexto from '@/assets/logo/laburin-logo-texto.svg';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: signInError } = await signIn(email, password);
      setLoading(false);

      if (signInError) {
        setError(signInError);
        return;
      }

      navigate('/tablero', { replace: true });
      return;
    }

    const { error: signUpError, hasSession } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    if (hasSession) {
      navigate('/onboarding', { replace: true });
      return;
    }

    setInfo('Cuenta creada. Ya podés iniciar sesión.');
    setMode('login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-margin relative">
      <ThemeToggle className="absolute top-6 right-6" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-96 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col gap-5"
      >
        <div className="flex flex-col items-center text-center">
          <img src={logoTexto} alt="Laburin" className="h-28 w-auto" />
          <p className="text-sm text-on-surface-variant mt-1">
            {mode === 'login' ? 'Iniciá sesión para ver tu tablero.' : 'Creá tu cuenta para empezar.'}
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </label>

        {error && <p className="text-sm text-error">{error}</p>}
        {info && <p className="text-sm text-primary">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError(null);
            setInfo(null);
          }}
          className="text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </form>
    </div>
  );
}
