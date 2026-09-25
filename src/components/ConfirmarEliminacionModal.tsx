import { AlertTriangle } from 'lucide-react';

interface ConfirmarEliminacionModalProps {
  cantidad: number;
  conSeguimiento: number;
  eliminando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmarEliminacionModal({
  cantidad,
  conSeguimiento,
  eliminando,
  onConfirmar,
  onCancelar,
}: ConfirmarEliminacionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.4)]">
      <div
        role="alertdialog"
        aria-labelledby="titulo-eliminar"
        className="w-full max-w-112 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg"
      >
        <div className="px-6 py-4 border-b border-outline-variant">
          <h2 id="titulo-eliminar" className="text-lg font-heading font-semibold text-on-surface">
            {cantidad === 1 ? 'Eliminar 1 oferta' : `Eliminar ${cantidad} ofertas`}
          </h2>
        </div>

        <div className="p-6 flex flex-col gap-4 text-sm text-on-surface-variant">
          <p>
            Vas a eliminar {cantidad === 1 ? 'la oferta seleccionada' : `las ${cantidad} ofertas seleccionadas`}. Esta
            acción no se puede deshacer.
          </p>

          {conSeguimiento > 0 && (
            <div className="flex items-start gap-2 p-3 bg-tertiary-container text-on-tertiary-container rounded-lg">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <p>
                {conSeguimiento === 1 ? '1 de ellas ya tiene' : `${conSeguimiento} de ellas ya tienen`} una postulación:
                también se va a borrar su seguimiento (postulación, interacciones y recordatorios).
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={onCancelar}
            disabled={eliminando}
            className="px-4 py-2 rounded-lg text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={eliminando}
            className="bg-error text-on-error text-sm font-medium px-5 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
