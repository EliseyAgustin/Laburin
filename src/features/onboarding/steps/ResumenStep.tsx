import { scrollFieldIntoView } from '@/lib/utils';
import type { Modalidad } from '@/types/oferta';
import type { Seniority } from '@/types/perfilUsuario';
import type { ErroresOnboarding } from '../validacion';
import { ErrorCampo } from '../componentes/ErrorCampo';
import { OpcionesElegibles } from '../componentes/OpcionesElegibles';
import { TecnologiasEditor } from '../componentes/TecnologiasEditor';
import { MODALIDADES_ONBOARDING } from './ModalidadStep';
import { NIVELES_EXPERIENCIA } from './NivelExperienciaStep';

interface ResumenStepProps {
  rol: string;
  onRolChange: (value: string) => void;
  tecnologias: string[];
  onTecnologiasChange: (value: string[]) => void;
  tecnologiaDraft: string;
  onTecnologiaDraftChange: (value: string) => void;
  modalidad: Modalidad | null;
  onModalidadChange: (value: Modalidad | null) => void;
  ubicacion: string;
  onUbicacionChange: (value: string) => void;
  nivel: Seniority | null;
  onNivelChange: (value: Seniority | null) => void;
  errores: ErroresOnboarding;
}

const CLASE_INPUT =
  'w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all';

export function ResumenStep(props: ResumenStepProps) {
  const { errores } = props;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">Revisá tus datos</h3>
        <p className="text-sm text-on-surface-variant">
          Esto es lo que vamos a guardar. Podés corregir cualquier dato acá mismo antes de terminar.
        </p>
      </div>

      <section className="flex flex-col gap-1.5">
        <label htmlFor="resumen-rol" className="text-sm font-semibold text-on-surface">
          Rol que buscás
        </label>
        <input
          id="resumen-rol"
          type="text"
          maxLength={100}
          value={props.rol}
          aria-invalid={Boolean(errores.rol)}
          aria-describedby={errores.rol ? 'error-rol' : undefined}
          onChange={(e) => props.onRolChange(e.target.value)}
          onFocus={scrollFieldIntoView}
          className={CLASE_INPUT}
        />
        <ErrorCampo id="error-rol" mensaje={errores.rol} />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-on-surface">Tecnologías</h4>
        <TecnologiasEditor
          value={props.tecnologias}
          onChange={props.onTecnologiasChange}
          draft={props.tecnologiaDraft}
          onDraftChange={props.onTecnologiaDraftChange}
          error={errores.tecnologias}
          idError="error-tecnologias"
          mostrarSugeridas={false}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-on-surface">Modalidad</h4>
        <OpcionesElegibles
          opciones={MODALIDADES_ONBOARDING}
          value={props.modalidad}
          onChange={props.onModalidadChange}
          nombre="Modalidad"
          describedBy={errores.modalidad ? 'error-modalidad' : undefined}
          invalido={Boolean(errores.modalidad)}
        />
        <ErrorCampo id="error-modalidad" mensaje={errores.modalidad} />
      </section>

      <section className="flex flex-col gap-1.5">
        <label htmlFor="resumen-ubicacion" className="text-sm font-semibold text-on-surface">
          Ubicación
        </label>
        <input
          id="resumen-ubicacion"
          type="text"
          maxLength={100}
          value={props.ubicacion}
          aria-invalid={Boolean(errores.ubicacion)}
          aria-describedby={errores.ubicacion ? 'error-ubicacion' : undefined}
          onChange={(e) => props.onUbicacionChange(e.target.value)}
          onFocus={scrollFieldIntoView}
          className={CLASE_INPUT}
        />
        <ErrorCampo id="error-ubicacion" mensaje={errores.ubicacion} />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-on-surface">Nivel de experiencia (opcional)</h4>
        <OpcionesElegibles
          opciones={NIVELES_EXPERIENCIA}
          value={props.nivel}
          onChange={props.onNivelChange}
          nombre="Nivel de experiencia"
        />
      </section>

      <p className="text-sm text-on-surface-variant bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3">
        Podés cambiarlos cuando quieras en Mi perfil de búsqueda.
      </p>
    </div>
  );
}
