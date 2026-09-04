import { Save, Timer, Terminal, Briefcase, MapPin, Plus, Trash2 } from 'lucide-react';

export function Settings() {
  return (
    <div className="flex-1 overflow-y-auto p-margin min-h-full">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6 pb-6">
        
        {/* Page Header & Global Action */}
        <div className="flex justify-between items-end pb-2 border-b border-outline-variant">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-on-surface">Motor de Scoring</h1>
            <p className="text-base text-on-surface-variant mt-1">Ajusta los pesos y criterios para la evaluación automática de candidatos.</p>
          </div>
          <button className="bg-primary text-on-primary text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2">
            <Save className="w-[18px] h-[18px]" />
            Guardar configuración
          </button>
        </div>

        {/* Global Settings Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Umbral de Inactividad</h3>
              <p className="text-sm text-on-surface-variant">Días antes de considerar una oferta o candidato inactivo.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              defaultValue="30" 
              className="w-20 text-center text-xl font-semibold text-on-surface bg-surface border border-outline-variant rounded-lg px-2 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium text-on-surface-variant">días</span>
          </div>
        </div>

        {/* Bento Grid Layout for Scoring Criteria */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* STACK: Keywords & Weights */}
          <section className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col h-[500px]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface rounded-t-xl">
              <div className="flex items-center gap-2">
                <Terminal className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-on-surface">Stack Tecnológico</h2>
              </div>
              <span className="bg-primary-container text-on-primary-container text-[11px] font-semibold px-2 py-1 rounded-full">Alto Impacto</span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-2">
              {/* List Header */}
              <div className="grid grid-cols-12 gap-2 px-4 pb-2 border-b border-outline-variant text-xs font-medium text-on-surface-variant">
                <div className="col-span-8">Keyword / Tecnología</div>
                <div className="col-span-3 text-center">Peso (Pts)</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Items */}
              {[
                { name: 'SQL', score: 15 },
                { name: 'Selenium', score: 10 },
                { name: 'React', score: 5 },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center p-4 rounded-lg hover:bg-surface-container-low transition-colors group">
                  <div className="col-span-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container border border-outline-variant rounded-md text-xs font-medium text-on-surface">
                      {item.name}
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <input 
                      type="number" 
                      defaultValue={item.score} 
                      className="w-16 text-center text-sm text-on-surface bg-transparent border-b border-outline-variant focus:border-primary focus:outline-none pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                  </div>
                  <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-error hover:bg-error-container p-1 rounded-md transition-colors">
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add New */}
            <div className="p-4 border-t border-outline-variant bg-surface-bright rounded-b-xl">
              <div className="flex items-center gap-4">
                <input type="text" placeholder="Nueva tecnología..." className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                <input type="number" placeholder="Peso" className="w-24 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button className="bg-surface-container-low text-primary border border-outline-variant hover:border-primary hover:bg-surface-container transition-colors rounded-lg p-2 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Column for Modalidad & Ubicación */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* MODALIDAD */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
              <div className="p-4 border-b border-outline-variant bg-surface rounded-t-xl flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-tertiary" />
                <h2 className="text-xl font-semibold text-on-surface">Modalidad</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    Remoto
                  </div>
                  <div className="flex items-center gap-2 bg-surface border border-outline-variant rounded-md px-2 py-1 focus-within:border-primary">
                    <span className="text-outline text-xs">+</span>
                    <input type="number" defaultValue="20" className="w-10 text-center text-xs font-medium text-primary bg-transparent border-none p-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <span className="text-outline text-xs">pts</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    Híbrido
                  </div>
                  <div className="flex items-center gap-2 bg-surface border border-outline-variant rounded-md px-2 py-1 focus-within:border-primary">
                    <span className="text-outline text-xs">+</span>
                    <input type="number" defaultValue="10" className="w-10 text-center text-xs font-medium text-primary bg-transparent border-none p-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <span className="text-outline text-xs">pts</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    Presencial
                  </div>
                  <div className="flex items-center gap-2 bg-surface border border-outline-variant rounded-md px-2 py-1 focus-within:border-primary">
                    <span className="text-outline text-xs">-</span>
                    <input type="number" defaultValue="5" className="w-10 text-center text-xs font-medium text-error bg-transparent border-none p-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <span className="text-outline text-xs">pts</span>
                  </div>
                </div>
              </div>
            </section>

            {/* UBICACIÓN */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex-1 flex flex-col">
              <div className="p-4 border-b border-outline-variant bg-surface rounded-t-xl flex items-center gap-2">
                <MapPin className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-semibold text-on-surface">Ubicación</h2>
              </div>
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                <div className="flex items-center justify-between p-2 rounded-lg border border-outline-variant bg-surface-bright">
                  <span className="text-sm text-on-surface">Zona Oeste</span>
                  <span className="text-xs font-medium bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full">+15 pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg border border-outline-variant bg-surface-bright">
                  <span className="text-sm text-on-surface">CABA</span>
                  <span className="text-xs font-medium bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full">+10 pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg border border-outline-variant bg-surface-bright">
                  <span className="text-sm text-on-surface">LATAM</span>
                  <span className="text-xs font-medium bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full">+5 pts</span>
                </div>
              </div>
              <div className="p-2 border-t border-outline-variant bg-surface rounded-b-xl flex gap-2">
                <input type="text" placeholder="Ej: Zona Norte" className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:border-primary focus:outline-none" />
                <input type="number" placeholder="Pts" className="w-16 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:border-primary focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button className="bg-surface-container-low text-primary border border-outline-variant rounded-lg px-2 py-2 hover:bg-surface-container transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}
