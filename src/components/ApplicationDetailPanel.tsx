import { X, Building2, Globe, Code, Video, Send, PlusCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | null;
}

export function ApplicationDetailPanel({ isOpen, onClose, applicationId }: PanelProps) {
  const [showAddInteraction, setShowAddInteraction] = useState(false);

  if (!isOpen) return null;

  return (
    <aside className={cn(
      "absolute right-0 top-0 h-full w-[520px] bg-surface-container-lowest border-l border-outline-variant shadow-[0_0_40px_rgba(0,0,0,0.1)] z-50 flex flex-col transform transition-transform duration-300",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Panel Header */}
      <div className="px-6 py-6 border-b border-outline-variant flex items-start justify-between bg-surface-bright sticky top-0 z-10">
        <div>
          {/* Alert Badge */}
          <div className="inline-flex items-center gap-1 bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-full mb-4">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide">Inactiva &gt; 14 días</span>
          </div>
          <h2 className="text-2xl font-semibold text-on-surface mb-1">Senior Frontend Engineer</h2>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Building2 className="w-[18px] h-[18px]" />
            <span>Stripe</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant mx-1"></span>
            <a href="#" className="text-primary hover:underline flex items-center gap-1 group">
              Ver oferta original
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
        
        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-surface border border-outline-variant rounded-lg">
          <div>
            <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Match Score</div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full border-4 border-primary flex items-center justify-center text-xl font-semibold text-primary">
                92
              </div>
              <span className="text-xs font-medium text-on-surface-variant">Alta afinidad</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Fuente</div>
            <div className="flex items-center gap-2 text-sm text-on-surface h-12">
              <Globe className="w-5 h-5 text-outline" />
              LinkedIn Jobs
            </div>
          </div>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-2">Estado actual en el pipeline</label>
          <div className="relative">
            <select className="w-full appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary hover:border-outline transition-colors cursor-pointer shadow-sm">
              <option value="screening">Screening RRHH</option>
              <option selected value="technical">Entrevista Técnica</option>
              <option value="challenge">Challenge / Prueba</option>
              <option value="offer">Oferta</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>

        {/* Timeline Section */}
        <div>
          <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-2">
            <h3 className="text-xl font-semibold text-on-surface">Timeline de Interacciones</h3>
          </div>
          
          <div className="ml-[19px] border-l border-outline-variant space-y-6 pb-4">
            
            {/* Node 1 */}
            <div className="relative pl-6 group">
              <div className="absolute left-[-17px] top-0 bg-surface-container-lowest border border-primary rounded-full p-1 text-primary shadow-sm">
                <Code className="w-[18px] h-[18px]" />
              </div>
              <div className="text-[11px] font-semibold text-on-surface-variant mb-0.5">Hoy, 14:30 hs</div>
              <div className="bg-surface border border-outline-variant rounded-lg p-4 group-hover:border-primary-fixed-dim transition-colors shadow-sm">
                <div className="text-sm font-semibold text-on-surface mb-1">Live Coding Assessment</div>
                <p className="text-sm text-on-surface-variant">Prueba en vivo con el equipo de Core Platform. Se resolvieron algoritmos de optimización de renderizado. Feedback positivo inicial.</p>
              </div>
            </div>
            
            {/* Node 2 */}
            <div className="relative pl-6 group">
              <div className="absolute left-[-17px] top-0 bg-surface-container-lowest border border-outline-variant rounded-full p-1 text-on-surface-variant shadow-sm">
                <Video className="w-[18px] h-[18px]" />
              </div>
              <div className="text-[11px] font-semibold text-on-surface-variant mb-0.5">Hace 14 días</div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 group-hover:border-outline transition-colors">
                <div className="text-sm font-semibold text-on-surface mb-1">Entrevista HR (Filtro inicial)</div>
                <p className="text-sm text-on-surface-variant">Charla sobre cultura y expectativas salariales alineadas. Pasan mi perfil a los managers técnicos.</p>
              </div>
            </div>

            {/* Node 3 */}
            <div className="relative pl-6 group">
              <div className="absolute left-[-17px] top-0 bg-surface-container-lowest border border-outline-variant rounded-full p-1 text-on-surface-variant shadow-sm">
                <Send className="w-[18px] h-[18px]" />
              </div>
              <div className="text-[11px] font-semibold text-on-surface-variant mb-0.5">Hace 20 días</div>
              <div className="text-sm font-semibold text-on-surface">Postulación enviada</div>
            </div>

          </div>

          {/* Add Interaction Form Trigger */}
          {!showAddInteraction ? (
            <div 
              className="mt-6 border border-outline-variant border-dashed rounded-lg bg-surface-container-lowest p-4 hover:bg-surface-container-low transition-colors cursor-pointer group"
              onClick={() => setShowAddInteraction(true)}
            >
              <div className="flex items-center justify-center gap-2 text-primary text-sm font-semibold">
                <PlusCircle className="group-hover:scale-110 transition-transform w-5 h-5" />
                Agregar interacción
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-surface border border-outline-variant rounded-lg p-4 shadow-sm">
              <h4 className="text-xs font-medium text-on-surface mb-4">Nueva interacción</h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Tipo</label>
                  <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-1.5 px-2 text-sm focus:border-primary outline-none">
                    <option>Llamada</option>
                    <option>Email recibido</option>
                    <option>Entrevista</option>
                    <option>Prueba Técnica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Fecha</label>
                  <input type="date" className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-1.5 px-2 text-sm focus:border-primary outline-none" />
                </div>
              </div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Notas / Descripción corta</label>
              <textarea 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md py-2 px-3 text-sm focus:border-primary outline-none mb-4 resize-none" 
                placeholder="Detalles de la interacción..." 
                rows={2}
              ></textarea>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddInteraction(false)}
                  className="px-4 py-1.5 rounded-md text-on-surface-variant text-xs font-medium hover:bg-surface-container-highest transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="px-4 py-1.5 rounded-md bg-primary text-on-primary text-xs font-medium hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}
