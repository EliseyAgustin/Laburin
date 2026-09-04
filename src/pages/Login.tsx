import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate('/tablero', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-margin">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-96 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col gap-5"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Laburin</h1>
          <p className="text-sm text-on-surface-variant mt-1">Iniciá sesión para ver tu tablero.</p>
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
