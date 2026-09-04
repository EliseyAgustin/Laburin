import { useState } from 'react';
import { MoreHorizontal, Clock, Inbox } from 'lucide-react';
import { ApplicationDetailPanel } from '@/components/ApplicationDetailPanel';

export function Dashboard() {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    setSelectedApplication(id);
  };

  const closePanel = () => {
    setSelectedApplication(null);
  };

  return (
    <div className="flex-1 h-full bg-surface-bright p-lg overflow-x-auto relative">
      <div className="flex gap-lg h-full pb-sm w-max">
        
        {/* Column: Por aplicar */}
        <div className="flex flex-col w-80 h-full rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden">
          <div className="px-md py-sm border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wide">Por aplicar</h3>
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-semibold">3</span>
          </div>
          <div className="flex-1 overflow-y-auto p-sm space-y-sm custom-scrollbar">
            
            <div 
              onClick={() => handleCardClick('frontend-dev')}
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-md shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer border-t-4 border-t-secondary-fixed flex flex-col min-h-30"
            >
              <div className="flex justify-between items-start mb-sm">
                <h4 className="text-sm font-medium text-on-surface leading-tight">Frontend Developer</h4>
                <MoreHorizontal className="text-outline w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-on-surface-variant mb-md">TechCorp Inc.</p>
              <div className="flex justify-between items-end mt-auto">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-xs font-semibold text-on-surface-variant">Score: 85</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">2d</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCardClick('ux-ui')}
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-md shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer border-t-4 border-t-primary-fixed flex flex-col min-h-30"
            >
              <div className="flex justify-between items-start mb-sm">
                <h4 className="text-sm font-medium text-on-surface leading-tight">UX/UI Designer</h4>
                <MoreHorizontal className="text-outline w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-on-surface-variant mb-md">Design Studio LLC</p>
              <div className="flex justify-between items-end mt-auto">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  <span className="text-xs font-semibold text-on-surface-variant">Score: 92</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">5d</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Column: Aplicado */}
        <div className="flex flex-col w-80 h-full rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden">
          <div className="px-md py-sm border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wide">Aplicado</h3>
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-semibold">1</span>
          </div>
          <div className="flex-1 overflow-y-auto p-sm space-y-sm custom-scrollbar">
            
            <div 
              onClick={() => handleCardClick('react-eng')}
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-md shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer border-t-4 border-t-tertiary-fixed flex flex-col min-h-30"
            >
              <div className="flex justify-between items-start mb-sm">
                <h4 className="text-sm font-medium text-on-surface leading-tight">React Engineer</h4>
                <MoreHorizontal className="text-outline w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-on-surface-variant mb-md">FinTech Solutions</p>
              <div className="flex justify-between items-end mt-auto">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="text-xs font-semibold text-on-surface-variant">Score: 78</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">12d</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Column: En proceso */}
        <div className="flex flex-col w-80 h-full rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden">
          <div className="px-md py-sm border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wide">En proceso</h3>
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
          </div>
          <div className="flex-1 overflow-y-auto p-sm space-y-sm flex flex-col items-center justify-center text-outline-variant custom-scrollbar">
            <Inbox className="w-12 h-12 mb-1" />
            <p className="text-xs font-medium">Sin tarjetas</p>
          </div>
        </div>
        
        {/* Column: Entrevista */}
        <div className="flex flex-col w-80 h-full rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden">
          <div className="px-md py-sm border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wide">Entrevista</h3>
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-semibold">2</span>
          </div>
          <div className="flex-1 overflow-y-auto p-sm space-y-sm custom-scrollbar">
            
            <div 
              onClick={() => handleCardClick('senior-product')}
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-md shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer border-t-4 border-t-primary flex flex-col min-h-30"
            >
              <div className="flex justify-between items-start mb-sm">
                <h4 className="text-sm font-medium text-on-surface leading-tight">Senior Frontend Engineer</h4>
                <MoreHorizontal className="text-outline w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-on-surface-variant mb-md">Stripe</p>
              <div className="flex justify-between items-end mt-auto">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-xs font-semibold text-on-surface-variant">Score: 92</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">1d</span>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-surface-container-lowest border border-outline-variant rounded-md p-md shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer border-t-4 border-t-primary flex flex-col min-h-30"
            >
              <div className="flex justify-between items-start mb-sm">
                <h4 className="text-sm font-medium text-on-surface leading-tight">Senior Product Designer</h4>
                <MoreHorizontal className="text-outline w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-on-surface-variant mb-md">Global Innovations</p>
              <div className="flex justify-between items-end mt-auto">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-xs font-semibold text-on-surface-variant">Score: 95</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">1d</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Column: Oferta */}
        <div className="flex flex-col w-80 h-full rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden">
          <div className="px-md py-sm border-b border-outline-variant bg-surface flex justify-between items-center shrink-0">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wide">Oferta</h3>
            <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
          </div>
          <div className="flex-1 overflow-y-auto p-sm space-y-sm flex flex-col items-center justify-center text-outline-variant custom-scrollbar">
            <Inbox className="w-12 h-12 mb-1" />
            <p className="text-xs font-medium">Sin tarjetas</p>
          </div>
        </div>

      </div>

      <ApplicationDetailPanel 
        isOpen={selectedApplication !== null} 
        onClose={closePanel} 
        applicationId={selectedApplication}
      />
    </div>
  );
}
