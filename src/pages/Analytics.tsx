import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Target, Briefcase, Hourglass, Eye, TrendingUp, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const CHART_COLORS = {
  light: { grid: '#e4e9f5', axisText: '#4b5468', tooltipBg: '#12172b', tooltipText: '#ffffff', primary: '#1e4fd8', primaryMuted: '#b7c9ff' },
  dark: { grid: '#2a3350', axisText: '#a7afc7', tooltipBg: '#1d253e', tooltipText: '#e7eaf6', primary: '#7da2ff', primaryMuted: '#3a4260' },
};

const funnelData = [
  { name: 'Por aplicar', value: 150 },
  { name: 'Aplicado', value: 110 },
  { name: 'Entrevista HR', value: 45 },
  { name: 'Prueba Técnica', value: 20 },
  { name: 'Entrevista Final', value: 8 },
  { name: 'Oferta', value: 2 },
];

const categoryData = [
  { name: 'QA', value: 42 },
  { name: 'Data Entry', value: 35 },
  { name: 'Frontend', value: 28 },
  { name: 'Backend', value: 22 },
  { name: 'Diseño', value: 15 },
];

export function Analytics() {
  const { theme } = useTheme();
  const colors = CHART_COLORS[theme];

  return (
    <div className="flex-1 overflow-y-auto p-margin h-full bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-4xl font-heading font-bold tracking-tight text-on-background mb-8">Analytics</h2>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:border-primary transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Tasa de respuesta</span>
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-on-surface">32%</span>
              <span className="text-[11px] font-semibold text-success flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +5%
              </span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:border-primary transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Postulaciones activas</span>
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-on-surface">14</span>
              <span className="text-[11px] font-semibold text-outline flex items-center">
                <ArrowRight className="w-3.5 h-3.5 mr-1" /> =
              </span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:border-primary transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Tiempo prom. etapa</span>
              <Hourglass className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-on-surface">4.2d</span>
              <span className="text-[11px] font-semibold text-error flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +1.1d
              </span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:border-primary transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Total ofertas vistas</span>
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-on-surface">1,240</span>
              <span className="text-[11px] font-semibold text-success flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +120
              </span>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Funnel Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col h-100">
            <div className="mb-4">
              <h3 className="text-xl font-heading font-semibold text-on-surface">Progresión del Kanban</h3>
              <p className="text-sm text-on-surface-variant">Tasa de conversión por etapa del proceso</p>
            </div>
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={colors.grid} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: colors.axisText }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: colors.axisText }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: colors.tooltipBg, borderRadius: '8px', color: colors.tooltipText, border: 'none' }}
                    itemStyle={{ color: colors.tooltipText }}
                    cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index > 3 ? colors.primary : colors.primaryMuted} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="lg:col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col h-100">
            <div className="mb-4">
              <h3 className="text-xl font-heading font-semibold text-on-surface">Volumen por Categoría</h3>
              <p className="text-sm text-on-surface-variant">Ofertas guardadas por área</p>
            </div>
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.axisText }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12, fill: colors.axisText }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: colors.tooltipBg, borderRadius: '8px', color: colors.tooltipText, border: 'none' }}
                    itemStyle={{ color: colors.tooltipText }}
                    cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                  />
                  <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
