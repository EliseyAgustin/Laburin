import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { filtrarCandidatos, nombreParaMostrar, type Candidato } from '@/lib/candidatos';
import { MODALIDAD_ETIQUETA, NIVEL_EXPERIENCIA_ETIQUETA, formatearFecha } from '@/lib/etiquetas';
import { mensajeDeError } from '@/lib/errores';
import { RUTAS } from '@/lib/rutas';
import { listarCandidatos } from '@/services/candidatos';

const MAX_TECNOLOGIAS_EN_TARJETA = 5;

export function Candidatos() {
  const [candidatos, setCandidatos] = useState<Candidato[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consulta, setConsulta] = useState('');

  useEffect(() => {
    let cancelado = false;
    listarCandidatos()
      .then((data) => !cancelado && setCandidatos(data))
      .catch((err) => {
        if (cancelado) return;
        setError(mensajeDeError(err, 'No se pudieron cargar los candidatos.'));
        setCandidatos([]);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const visibles = useMemo(() => filtrarCandidatos(candidatos ?? [], consulta), [candidatos, consulta]);

  return (
    <div className="flex-1 overflow-y-auto p-margin min-h-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-6">
        <PageHeader
          title="Candidatos"
          help="Personas que se registraron y armaron su perfil de búsqueda. Entrá a una para ver sus datos y escribirle un mensaje."
        />

        <p className="text-sm text-on-surface-variant -mt-2">
          Solo ves el perfil de búsqueda: nombre, rol, tecnologías, modalidad, ubicación y nivel. Las ofertas y postulaciones
          de cada persona son privadas.
        </p>

        {error && <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>}

        {candidatos === null && <div className="text-center text-on-surface-variant text-sm py-16">Cargando candidatos…</div>}

        {candidatos !== null && candidatos.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-2">
            <Users className="w-12 h-12 text-outline-variant" />
            <p className="text-sm font-medium text-on-surface-variant">Todavía no hay candidatos con perfil de búsqueda.</p>
            <p className="text-sm text-on-surface-variant">
              Cuando alguien complete su perfil al registrarse, va a aparecer acá.
            </p>
          </div>
        )}

        {candidatos !== null && candidatos.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-on-surface-variant" aria-hidden="true" />
                <input
                  type="search"
                  value={consulta}
                  onChange={(e) => setConsulta(e.target.value)}
                  aria-label="Buscar candidatos"
                  placeholder="Buscar por nombre, rol, tecnología o ubicación"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg py-2 pl-10 pr-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <p className="text-sm text-on-surface-variant" aria-live="polite">
                {visibles.length === 1 ? '1 candidato' : `${visibles.length} candidatos`}
              </p>
            </div>

            {visibles.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-2">
                <p className="text-sm font-medium text-on-surface-variant">Ningún candidato coincide con «{consulta.trim()}».</p>
                <p className="text-sm text-on-surface-variant">Probá con otra palabra, por ejemplo una tecnología o una ciudad.</p>
                <button
                  type="button"
                  onClick={() => setConsulta('')}
                  className="mt-2 bg-surface-container-high text-on-surface text-sm font-medium px-5 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-variant transition-all cursor-pointer"
                >
                  Borrar la búsqueda
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibles.map((c) => (
                  <li key={c.user_id}>
                    <Link
                      to={`${RUTAS.candidatos}/${c.user_id}`}
                      className="block h-full bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md hover:border-primary transition-all"
                    >
                      <h3 className="text-lg font-heading font-semibold text-on-surface">{nombreParaMostrar(c)}</h3>
                      <p className="text-sm text-on-surface-variant mt-0.5">{c.rol_buscado}</p>

                      <p className="flex items-center gap-1 text-xs text-on-surface-variant mt-3">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {[
                          c.ubicacion,
                          c.modalidad_preferida ? MODALIDAD_ETIQUETA[c.modalidad_preferida] : null,
                          c.seniority ? NIVEL_EXPERIENCIA_ETIQUETA[c.seniority] : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'Sin ubicación indicada'}
                      </p>

                      {c.stack_interes.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 mt-3" aria-label="Tecnologías">
                          {c.stack_interes.slice(0, MAX_TECNOLOGIAS_EN_TARJETA).map((t) => (
                            <li
                              key={t}
                              className="bg-primary-container text-on-primary-container text-[11px] font-medium px-2 py-0.5 rounded-md"
                            >
                              {t}
                            </li>
                          ))}
                          {c.stack_interes.length > MAX_TECNOLOGIAS_EN_TARJETA && (
                            <li className="text-[11px] text-on-surface-variant px-1 py-0.5">
                              +{c.stack_interes.length - MAX_TECNOLOGIAS_EN_TARJETA} más
                            </li>
                          )}
                        </ul>
                      )}

                      <p className="text-xs text-on-surface-variant mt-3">Registrado el {formatearFecha(c.registrado_el)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
