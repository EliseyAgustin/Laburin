import { useEffect, useState, type ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LabelList,
} from 'recharts';
import { Activity, BellRing, Briefcase, Gauge, Hourglass, Inbox, Target, type LucideIcon } from 'lucide-react';
import { mensajeDeError } from '@/lib/errores';
import { useTheme } from '@/hooks/useTheme';
import { calcularMetricas, cargarDatosMetricas } from '@/services/metricas';
import { ESTADO_POSTULACION_LABEL } from '@/services/postulaciones';

const CHART_COLORS = {
  light: {
    grid: '#e4e9f5',
    axisText: '#4b5468',
    tooltipBg: '#12172b',
    tooltipText: '#ffffff',
    primary: '#1e4fd8',
    series: { mail: '#1e4fd8', llamada: '#0d9488', entrevista: '#d97706', nota: '#7c3aed' },
    bandas: { alto: '#16a34a', medio: '#d97706', bajo: '#dc2626', sinScore: '#9aa3b8' },
  },
  dark: {
    grid: '#2a3350',
    axisText: '#a7afc7',
    tooltipBg: '#1d253e',
    tooltipText: '#e7eaf6',
    primary: '#7da2ff',
    series: { mail: '#7da2ff', llamada: '#5eead4', entrevista: '#fbbf24', nota: '#c4b5fd' },
    bandas: { alto: '#4ade80', medio: '#fbbf24', bajo: '#f87171', sinScore: '#6b7594' },
  },
};

const porcentaje = (valor: number | null) => (valor === null ? '—' : `${Math.round(valor * 100)}%`);

function KpiCard({ label, icon: Icon, value, detail }: { label: string; icon: LucideIcon; value: string; detail: string }) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:border-primary transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{label}</span>
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-2xl font-semibold text-on-surface">{value}</div>
      <p className="text-[11px] text-on-surface-variant mt-1">{detail}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  badge,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: { text: string; title: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col h-100 ${className ?? ''}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-heading font-semibold text-on-surface">{title}</h3>
          <p className="text-sm text-on-surface-variant">{subtitle}</p>
        </div>
        {badge && (
          <span
            title={badge.title}
            className="shrink-0 bg-tertiary-container text-on-tertiary-container text-[11px] font-semibold px-2 py-1 rounded-full cursor-help"
          >
            {badge.text}
          </span>
        )}
      </div>
      <div className="flex-1 w-full h-full min-h-0">{children}</div>
    </div>
  );
}

function SinDatos({ mensaje }: { mensaje: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-outline-variant">
      <Inbox className="w-10 h-10" />
      <p className="text-sm text-on-surface-variant text-center">{mensaje}</p>
    </div>
  );
}

type Metricas = ReturnType<typeof calcularMetricas>;

export function Analytics() {
  const { theme } = useTheme();
  const colors = CHART_COLORS[theme];
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advertencias, setAdvertencias] = useState<string[]>([]);

  useEffect(() => {
    let cancelado = false;
    cargarDatosMetricas()
      .then(({ datos, advertencias }) => {
        if (cancelado) return;
        setMetricas(calcularMetricas(datos, new Date()));
        setAdvertencias(advertencias);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err, 'No se pudieron cargar las métricas.'));
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const tooltipProps = {
    contentStyle: { backgroundColor: colors.tooltipBg, borderRadius: '8px', color: colors.tooltipText, border: 'none' },
    itemStyle: { color: colors.tooltipText },
    labelStyle: { color: colors.tooltipText },
    cursor: { fill: 'rgba(128,128,128,0.1)' },
  };
  const axisTick = { fontSize: 12, fill: colors.axisText };

  return (
    <div className="flex-1 overflow-y-auto p-margin h-full bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-4xl font-heading font-bold tracking-tight text-on-background mb-8">Analytics</h2>

        {error && <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>}
        {advertencias.map((advertencia) => (
          <div key={advertencia} className="p-4 bg-tertiary-container text-on-tertiary-container rounded-lg text-sm">
            {advertencia}
          </div>
        ))}
        {!metricas && !error && (
          <div className="text-center text-on-surface-variant text-sm py-16">Calculando métricas…</div>
        )}

        {metricas && <Contenido metricas={metricas} colors={colors} tooltipProps={tooltipProps} axisTick={axisTick} />}
      </div>
    </div>
  );
}

function Contenido({
  metricas: m,
  colors,
  tooltipProps,
  axisTick,
}: {
  metricas: Metricas;
  colors: (typeof CHART_COLORS)['light'];
  tooltipProps: object;
  axisTick: object;
}) {
  const totalPostulaciones = Object.values(m.postulaciones.porEstado).reduce((a, b) => a + b, 0);
  const variacionOfertas = m.ofertas.ultimos7 - m.ofertas.previos7;

  const embudoData = m.embudo.etapas.map((e) => ({ name: ESTADO_POSTULACION_LABEL[e.estado], value: e.alcanzadas }));
  const bandas = m.score.bandas;
  const bandasData = bandas && [
    { name: 'Alto (≥75%)', value: bandas.alto, color: colors.bandas.alto },
    { name: 'Medio (50–75%)', value: bandas.medio, color: colors.bandas.medio },
    { name: 'Bajo (<50%)', value: bandas.bajo, color: colors.bandas.bajo },
    { name: 'Sin score', value: bandas.sinScore, color: colors.bandas.sinScore },
  ];
  const semanasData = m.semanas.map((s) => ({
    semana: s.inicio.toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' }),
    Mail: s.mail,
    Llamada: s.llamada,
    Entrevista: s.entrevista,
    Nota: s.nota,
  }));
  const hayInteracciones = m.semanas.some((s) => s.mail + s.llamada + s.entrevista + s.nota > 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Postulaciones activas"
          icon={Briefcase}
          value={String(m.postulaciones.activas)}
          detail={`de ${totalPostulaciones} postulaciones en total`}
        />
        <KpiCard
          label="Tasa de respuesta"
          icon={Target}
          value={porcentaje(m.tasaRespuesta.tasa)}
          detail={
            m.tasaRespuesta.aplicadas === 0
              ? 'Todavía no aplicaste a ninguna'
              : `${m.tasaRespuesta.respondidas} de ${m.tasaRespuesta.aplicadas} postulaciones ya enviadas`
          }
        />
        <KpiCard
          label="Ofertas cargadas"
          icon={Inbox}
          value={String(m.ofertas.total)}
          detail={`${m.ofertas.ultimos7} en los últimos 7 días (${variacionOfertas >= 0 ? '+' : ''}${variacionOfertas} vs. los 7 previos)`}
        />
        <KpiCard
          label="Score promedio"
          icon={Gauge}
          value={m.score.promedio === null ? '—' : m.score.promedio.toFixed(1)}
          detail={
            m.score.promedioPct === null
              ? 'Sin criterios activos para comparar'
              : `${porcentaje(m.score.promedioPct)} del máximo posible (${m.score.maximo} pts)`
          }
        />
        <KpiCard
          label="Actividad reciente"
          icon={Activity}
          value={porcentaje(m.actividad.porcentaje)}
          detail={
            m.actividad.activas === 0
              ? 'No hay postulaciones activas'
              : `${m.actividad.conActividad} de ${m.actividad.activas} activas con interacción en 7 días`
          }
        />
        <KpiCard
          label="Aplicado → 1ª entrevista"
          icon={Hourglass}
          value={m.diasHastaEntrevista.promedio === null ? '—' : `${m.diasHastaEntrevista.promedio.toFixed(1)} días`}
          detail={
            m.diasHastaEntrevista.n === 0
              ? 'Sin datos: requiere fecha de postulación y una interacción de tipo entrevista'
              : `Promedio sobre ${m.diasHastaEntrevista.n} postulación${m.diasHastaEntrevista.n === 1 ? '' : 'es'}`
          }
        />
        <KpiCard
          label="Recordatorios activos"
          icon={BellRing}
          value={String(m.recordatorios.activos)}
          detail={`${m.recordatorios.resueltos} resuelto${m.recordatorios.resueltos === 1 ? '' : 's'}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          className="lg:col-span-2"
          title="Embudo de postulaciones"
          subtitle="Postulaciones que llegaron al menos a cada etapa"
          badge={{
            text: 'Estimación',
            title:
              'Se infiere del estado actual y del historial de cambios. Las postulaciones anteriores al registro de historial solo tienen su estado actual, por eso pueden subestimar etapas intermedias.',
          }}
        >
          {totalPostulaciones === 0 ? (
            <SinDatos mensaje="Todavía no hay postulaciones." />
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={embudoData} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={colors.grid} />
                    <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={axisTick} axisLine={false} tickLine={false} width={90} />
                    <Tooltip {...tooltipProps} />
                    <Bar dataKey="value" name="Postulaciones" fill={colors.primary} radius={[0, 4, 4, 0]} barSize={24}>
                      <LabelList dataKey="value" position="right" fill={colors.axisText} fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Conversión desde la etapa anterior:{' '}
                {m.embudo.etapas
                  .slice(1)
                  .map((e) => `${ESTADO_POSTULACION_LABEL[e.estado]} ${porcentaje(e.conversionDesdeAnterior)}`)
                  .join(' · ')}
                {m.embudo.rechazadas > 0 && ` · ${m.embudo.rechazadas} rechazada${m.embudo.rechazadas === 1 ? '' : 's'} (fuera del camino)`}
              </p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Distribución de score" subtitle="Ofertas por franja, relativa al máximo posible">
          {bandasData === null ? (
            <SinDatos mensaje="No hay criterios activos. Activá al menos uno en Configuración para ver las franjas." />
          ) : m.ofertas.total === 0 ? (
            <SinDatos mensaje="Todavía no cargaste ofertas." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandasData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.axisText }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="value" name="Ofertas" radius={[4, 4, 0, 0]} barSize={32}>
                  {bandasData.map((franja) => (
                    <Cell key={franja.name} fill={franja.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Interacciones por semana"
          subtitle="Ventanas de 7 días, últimas 8 semanas (fecha de inicio de cada ventana)"
        >
          {!hayInteracciones ? (
            <SinDatos mensaje="Todavía no registraste interacciones en las últimas 8 semanas." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semanasData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="semana" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipProps} labelFormatter={(semana) => `Semana desde ${semana}`} />
                <Legend wrapperStyle={{ fontSize: 12, color: colors.axisText }} />
                <Bar dataKey="Mail" stackId="a" fill={colors.series.mail} />
                <Bar dataKey="Llamada" stackId="a" fill={colors.series.llamada} />
                <Bar dataKey="Entrevista" stackId="a" fill={colors.series.entrevista} />
                <Bar dataKey="Nota" stackId="a" fill={colors.series.nota} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Ofertas por fuente" subtitle="Dónde salen las ofertas cargadas">
          {m.ofertas.total === 0 ? (
            <SinDatos mensaje="Todavía no cargaste ofertas." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.fuentes} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="fuente" tick={{ fontSize: 11, fill: colors.axisText }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="cantidad" name="Ofertas" fill={colors.primary} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </>
  );
}
