import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { CampoPassword } from '@/components/auth/CampoPassword';
import { MedidorPassword } from '@/components/auth/MedidorPassword';
import { generarDatosEjemplo } from '@/lib/datosEjemplo';
import { RUTAS } from '@/lib/rutas';
import type { ErrorAuthTraducido } from '@/lib/authErrores';
import { validarEmail, validarPasswordIngreso, validarPasswordNueva } from '@/lib/validacionAuth';
import { scrollFieldIntoView } from '@/lib/utils';

interface ErroresCampos {
  email?: string;
  password?: string;
}

const CLASE_LINK = 'font-medium underline underline-offset-2 hover:opacity-80 cursor-pointer';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<ErroresCampos>({});
  const [errorServicio, setErrorServicio] = useState<ErrorAuthTraducido | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorServicio(null);
    setInfo(null);

    // La validación nativa del navegador está apagada (noValidate): se valida acá, con mensajes propios.
    const erroresNuevos: ErroresCampos = {
      email: validarEmail(email) ?? undefined,
      password: (mode === 'login' ? validarPasswordIngreso(password) : validarPasswordNueva(password)) ?? undefined,
    };
    setErrores(erroresNuevos);
    if (erroresNuevos.email) {
      emailRef.current?.focus();
      return;
    }
    if (erroresNuevos.password) return;

    setLoading(true);

    if (mode === 'login') {
      const { error: signInError } = await signIn(email, password);
      setLoading(false);

      if (signInError) {
        setErrorServicio(signInError);
        return;
      }

      navigate(RUTAS.postulaciones, { replace: true });
      return;
    }

    const { error: signUpError, hasSession } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      setErrorServicio(signUpError);
      return;
    }

    if (hasSession) {
      navigate('/onboarding', { replace: true });
      return;
    }

    setInfo('Cuenta creada. Ya podés iniciar sesión.');
    setMode('login');
  }

  function cambiarModo(nuevo: 'login' | 'signup') {
    setMode(nuevo);
    setErrores({});
    setErrorServicio(null);
    setInfo(null);
  }

  function handleCompletarConEjemplo() {
    const datos = generarDatosEjemplo(new Date());
    setEmail(datos.email);
    setPassword(datos.password);
    setErrores({});
    setErrorServicio(null);
    setInfo(`Datos de ejemplo cargados. Contraseña: ${datos.password}`);
  }

  // "Ese email ya tiene una cuenta. Podés iniciar sesión o recuperar tu contraseña." con las dos acciones como enlaces.
  function mensajeServicio(error: ErrorAuthTraducido): ReactNode {
    if (error.codigo !== 'email_registrado') return error.mensaje;
    return (
      <>
        Ese email ya tiene una cuenta. Podés{' '}
        <button type="button" onClick={() => cambiarModo('login')} className={CLASE_LINK}>
          iniciar sesión
        </button>{' '}
        o{' '}
        <Link to="/recuperar" state={{ email }} className={CLASE_LINK}>
          recuperar tu contraseña
        </Link>
        .
      </>
    );
  }

  return (
    <AuthLayout subtitulo={mode === 'login' ? 'Iniciá sesión para ver tus postulaciones.' : 'Creá tu cuenta para empezar.'}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
            Email
            <input
              ref={emailRef}
              type="email"
              maxLength={254}
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(errores.email)}
              aria-describedby={errores.email ? 'error-email' : undefined}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={scrollFieldIntoView}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all aria-invalid:border-error"
            />
          </label>
          {errores.email && (
            <p id="error-email" role="alert" className="text-sm text-error">
              {errores.email}
            </p>
          )}
        </div>

        <CampoPassword
          etiqueta="Contraseña"
          value={password}
          onChange={setPassword}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          error={errores.password}
          idError="error-password"
        />

        {mode === 'login' && (
          <Link
            to="/recuperar"
            state={{ email }}
            className="self-start -mt-3 text-sm text-primary hover:underline underline-offset-2"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        )}

        {mode === 'signup' && (
          <div className="-mt-3">
            <MedidorPassword password={password} />
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

        {errorServicio && (
          <p role="alert" className="text-sm text-error">
            {mensajeServicio(errorServicio)}
          </p>
        )}
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
          onClick={() => cambiarModo(mode === 'login' ? 'signup' : 'login')}
          className="text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </form>
    </AuthLayout>
  );
}
