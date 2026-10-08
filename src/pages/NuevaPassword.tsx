import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { CampoPassword } from '@/components/auth/CampoPassword';
import { MedidorPassword } from '@/components/auth/MedidorPassword';
import { traducirErrorAuth, type ErrorAuthTraducido } from '@/lib/authErrores';
import { RUTAS } from '@/lib/rutas';
import { validarConfirmacion, validarPasswordNueva } from '@/lib/validacionAuth';

// Si el enlace del mail venció o ya se usó, Supabase vuelve a esta ruta con el motivo en la URL (query o hash).
function enlaceConError(): boolean {
  const params = new URLSearchParams(window.location.search + '&' + window.location.hash.replace(/^#/, ''));
  return params.has('error') || params.has('error_code') || params.has('error_description');
}

export function NuevaPassword() {
  const navigate = useNavigate();
  const { session, loading, cambiarPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null);
  const [errorServicio, setErrorServicio] = useState<ErrorAuthTraducido | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorServicio(null);

    const ePassword = validarPasswordNueva(password);
    const eConfirmacion = ePassword ? null : validarConfirmacion(password, confirmacion);
    setErrorPassword(ePassword);
    setErrorConfirmacion(eConfirmacion);
    if (ePassword || eConfirmacion) return;

    setGuardando(true);
    const { error } = await cambiarPassword(password);
    setGuardando(false);

    if (error) {
      setErrorServicio(error);
      return;
    }
    setListo(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-label="Verificando el enlace…" />
      </div>
    );
  }

  // Sin sesión de recuperación no hay a quién cambiarle la contraseña: el enlace venció, ya se usó o se abrió a mano.
  if (!session || enlaceConError()) {
    return (
      <AuthLayout subtitulo="No pudimos validar el enlace.">
        <p role="alert" className="text-sm text-error">
          {traducirErrorAuth({ code: 'otp_expired' }, 'nueva-password').mensaje}
        </p>
        <Link
          to="/recuperar"
          className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all text-center"
        >
          Pedir un enlace nuevo
        </Link>
        <Link to="/" className="text-center text-sm text-on-surface-variant hover:text-primary transition-colors">
          Volver a iniciar sesión
        </Link>
      </AuthLayout>
    );
  }

  if (listo) {
    return (
      <AuthLayout subtitulo="Tu contraseña quedó actualizada.">
        <p role="status" className="text-sm text-primary">
          Listo, ya podés usar tu nueva contraseña la próxima vez que inicies sesión.
        </p>
        <button
          type="button"
          onClick={() => navigate(RUTAS.postulaciones, { replace: true })}
          className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer"
        >
          Continuar
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout subtitulo="Elegí una contraseña nueva para tu cuenta.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <CampoPassword
          etiqueta="Contraseña nueva"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrorPassword(null);
          }}
          autoComplete="new-password"
          error={errorPassword}
          idError="error-password-nueva"
        />
        <div className="-mt-3">
          <MedidorPassword password={password} />
        </div>
        <CampoPassword
          etiqueta="Repetí la contraseña"
          value={confirmacion}
          onChange={(v) => {
            setConfirmacion(v);
            setErrorConfirmacion(null);
          }}
          autoComplete="new-password"
          error={errorConfirmacion}
          idError="error-password-confirmacion"
        />

        {errorServicio && (
          <p role="alert" className="text-sm text-error">
            {errorServicio.mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar contraseña nueva'}
        </button>
      </form>
    </AuthLayout>
  );
}
