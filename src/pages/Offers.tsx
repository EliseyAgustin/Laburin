import { Filter, MapPin, Clock, Building2, ExternalLink, BookmarkPlus } from 'lucide-react';

export function Offers() {
  return (
    <div className="flex-1 overflow-y-auto bg-surface-container-lowest p-margin h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-md mb-xl p-4 bg-surface rounded-xl border border-outline-variant shadow-sm">
          <div className="flex-1 min-w-50">
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Categoría</label>
            <select className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg p-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
              <option>Todas las categorías</option>
              <option>QA</option>
              <option>Data Entry</option>
              <option>Admin</option>
              <option>Data Analyst</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-37.5">
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Fuente</label>
            <select className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg p-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
              <option>Todas las fuentes</option>
              <option>LinkedIn</option>
              <option>Indeed</option>
              <option>Glassdoor</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-37.5">
            <label className="block text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Ubicación</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2 text-on-surface-variant w-4.5 h-4.5" />
              <input type="text" placeholder="Ciudad o País" className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg py-2 pl-8 pr-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
          </div>
          
          <div className="w-50">
            <label className="text-[11px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider flex justify-between">
              <span>Score Mínimo</span>
              <span className="text-primary font-bold">75+</span>
            </label>
            <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-primary" />
          </div>
          
          <div className="mt-5">
            <button className="bg-surface-container-high text-on-surface text-xs font-medium px-4 py-2 rounded-lg border border-outline-variant flex items-center gap-2 hover:bg-surface-variant transition-colors">
              <Filter className="w-4.5 h-4.5" />
              Aplicar
            </button>
          </div>
        </div>

        {/* Bento Grid for Job Offers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: High Score */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md hover:border-primary transition-all group flex flex-col h-full border-t-4 border-t-[#10B981]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold leading-tight text-on-surface mb-1 group-hover:text-primary transition-colors">Senior QA Automation Engineer</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-[13px]">
                  <Building2 className="w-4 h-4" />
                  <span>TechCorp Global</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold bg-[#D1FAE5] text-[#065F46] border border-[#34D399] shrink-0">
                92
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <MapPin className="w-3.5 h-3.5" /> Remoto
              </span>
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <Clock className="w-3.5 h-3.5" /> Full-time
              </span>
              <span className="bg-[#E0F2FE] text-[#0369A1] px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-[#7DD3FC]">
                LinkedIn
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
              <span className="text-on-surface-variant text-[11px] font-semibold">hace 2 horas</span>
              <button className="bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Trackear postulación
              </button>
            </div>
          </div>

          {/* Card 2: Medium Score */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md hover:border-primary transition-all group flex flex-col h-full border-t-4 border-t-[#F59E0B]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold leading-tight text-on-surface mb-1 group-hover:text-primary transition-colors">Data Analyst Mid-Level</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-[13px]">
                  <Building2 className="w-4 h-4" />
                  <span>Fintech Solutions SAS</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] shrink-0">
                68
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <MapPin className="w-3.5 h-3.5" /> Híbrido (Bs As)
              </span>
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <Clock className="w-3.5 h-3.5" /> Full-time
              </span>
              <span className="bg-[#DBEAFE] text-[#1E40AF] px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-[#93C5FD]">
                Indeed
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
              <span className="text-on-surface-variant text-[11px] font-semibold">hace 5 horas</span>
              <button className="bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Trackear postulación
              </button>
            </div>
          </div>

          {/* Card 3: Low Score */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md hover:border-primary transition-all group flex flex-col h-full border-t-4 border-t-[#EF4444]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold leading-tight text-on-surface mb-1 group-hover:text-primary transition-colors">Data Entry Junior</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-[13px]">
                  <Building2 className="w-4 h-4" />
                  <span>Agencia Gamma</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] shrink-0">
                42
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <MapPin className="w-3.5 h-3.5" /> Presencial
              </span>
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <Clock className="w-3.5 h-3.5" /> Part-time
              </span>
              <span className="bg-[#E0F2FE] text-[#0369A1] px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-[#7DD3FC]">
                LinkedIn
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
              <span className="text-on-surface-variant text-[11px] font-semibold">hace 1 día</span>
              <button className="bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Trackear postulación
              </button>
            </div>
          </div>
          
          {/* Card 4: High Score */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md hover:border-primary transition-all group flex flex-col h-full border-t-4 border-t-[#10B981]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold leading-tight text-on-surface mb-1 group-hover:text-primary transition-colors">Administrativo Contable Ssr</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-[13px]">
                  <Building2 className="w-4 h-4" />
                  <span>Grupo Retail SA</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold bg-[#D1FAE5] text-[#065F46] border border-[#34D399] shrink-0">
                88
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <MapPin className="w-3.5 h-3.5" /> Híbrido (Córdoba)
              </span>
              <span className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-outline-variant">
                <Clock className="w-3.5 h-3.5" /> Full-time
              </span>
              <span className="bg-[#F3F4F6] text-[#374151] px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 border border-[#D1D5DB]">
                Manual
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
              <span className="text-on-surface-variant text-[11px] font-semibold">hace 3 horas</span>
              <button className="bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Trackear postulación
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
