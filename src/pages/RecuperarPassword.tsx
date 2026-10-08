import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import type { ErrorAuthTraducido } from '@/lib/authErrores';
import { validarEmail } from '@/lib/validacionAuth';
import { scrollFieldIntoView } from '@/lib/utils';

// El servicio de correo permite un envío por minuto para el mismo email: se espera lo mismo antes de reenviar.
const SEGUNDOS_ENTRE_ENVIOS = 60;

export function RecuperarPassword() {
  const { enviarEnlaceRecuperacion } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '');
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorServicio, setErrorServicio] = useState<ErrorAuthTraducido | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return;
    const id = window.setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [espera]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorServicio(null);

    const error = validarEmail(email);
    setErrorEmail(error);
    if (error) return;

    setEnviando(true);
    const { error: errorEnvio } = await enviarEnlaceRecuperacion(email);
    setEnviando(false);

    if (errorEnvio) {
      setErrorServicio(errorEnvio);
      return;
    }
    // Mensaje neutro: es el mismo exista o no una cuenta con ese email.
    setEnviado(true);
    setEspera(SEGUNDOS_ENTRE_ENVIOS);
  }

  return (
    <AuthLayout subtitulo="Te enviamos un enlace para que elijas una contraseña nueva.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
            Email
            <input
              type="email"
              maxLength={254}
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(errorEmail)}
              aria-describedby={errorEmail ? 'error-email' : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorEmail(null);
              }}
              onFocus={scrollFieldIntoView}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all aria-invalid:border-error"
            />
          </label>
          {errorEmail && (
            <p id="error-email" role="alert" className="text-sm text-error">
              {errorEmail}
            </p>
          )}
        </div>

        {errorServicio && (
          <p role="alert" className="text-sm text-error">
            {errorServicio.mensaje}
          </p>
        )}
        {enviado && (
          <p role="status" className="text-sm text-primary">
            Si el email existe, te enviamos un enlace para cambiar tu contraseña. Revisá tu bandeja de entrada y la carpeta
            de spam.
          </p>
        )}

        <button
          type="submit"
          disabled={enviando || espera > 0}
          className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {enviando
            ? 'Enviando…'
            : espera > 0
              ? `Podés pedir otro enlace en ${espera} s`
              : enviado
                ? 'Enviar otro enlace'
                : 'Enviar enlace'}
        </button>

        <Link to="/" className="text-center text-sm text-on-surface-variant hover:text-primary transition-colors">
          Volver a iniciar sesión
        </Link>
      </form>
    </AuthLayout>
  );
}
