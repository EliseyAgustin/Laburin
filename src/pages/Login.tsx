import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { generarDatosEjemplo } from '@/lib/datosEjemplo';
import { calcularFortalezaPassword, type NivelFortalezaPassword } from '@/lib/passwordStrength';
import { cn, scrollFieldIntoView } from '@/lib/utils';
import logoTexto from '@/assets/logo/laburin-logo-texto.svg';

const ESTILO_NIVEL: Record<NivelFortalezaPassword, { label: string; barra: string; texto: string; barras: number }> = {
  baja: { label: 'Débil', barra: 'bg-error', texto: 'text-error', barras: 1 },
  media: { label: 'Media', barra: 'bg-warning', texto: 'text-warning', barras: 2 },
  fuerte: { label: 'Fuerte', barra: 'bg-success', texto: 'text-success', barras: 3 },
};

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  function handleCompletarConEjemplo() {
    const datos = generarDatosEjemplo(new Date());
    setEmail(datos.email);
    setPassword(datos.password);
    setError(null);
    setInfo(`Datos de ejemplo cargados. Contraseña: ${datos.password}`);
  }

  const fortaleza = mode === 'signup' ? calcularFortalezaPassword(password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-margin relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-120 h-120 rounded-full bg-tertiary/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-144 h-144 rounded-full bg-secondary/10 blur-3xl" />
      </div>

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
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={scrollFieldIntoView}
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
          Contraseña
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              maxLength={128}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={scrollFieldIntoView}
              className="w-full bg-surface border border-outline-variant rounded-lg pl-3 pr-11 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </label>

        {fortaleza && (
          <div className="-mt-3 flex flex-col gap-1">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i < ESTILO_NIVEL[fortaleza.nivel].barras
                      ? ESTILO_NIVEL[fortaleza.nivel].barra
                      : 'bg-surface-container-high'
                  )}
                />
              ))}
            </div>
            <span className={cn('text-xs font-medium', ESTILO_NIVEL[fortaleza.nivel].texto)}>
              Contraseña {ESTILO_NIVEL[fortaleza.nivel].label.toLowerCase()}
            </span>
          </div>
        )}

        {import.meta.env.DEV && mode === 'signup' && (
          <button
            type="button"
            onClick={handleCompletarConEjemplo}
            className="text-xs font-medium text-on-surface-variant border border-dashed border-outline-variant rounded-lg px-3 py-2 hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            Completar con datos de ejemplo (solo desarrollo)
          </button>
        )}

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
