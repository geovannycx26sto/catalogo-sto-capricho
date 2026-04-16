'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  getVisits,
  getProductViews,
  VisitRow,
  ProductViewRow,
} from '@/lib/analytics';
import { getAllProducts } from '@/lib/store';
import { Product } from '@/types';

type Range = '1d' | '7d' | '30d' | 'all';

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_LABELS: Record<Range, string> = {
  '1d': 'Hoy',
  '7d': '7 días',
  '30d': '30 días',
  all: 'Todo',
};

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Clave YYYY-MM-DD en zona local (evita desfase UTC)
function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function localDateKeyFromMs(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

// Parsea "YYYY-MM-DD" como fecha local (no UTC) para evitar desfase
function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EstadisticasPage() {
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [views, setViews] = useState<ProductViewRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('7d');

  const load = async () => {
    setLoading(true);
    try {
      const [v, pv, prods] = await Promise.all([
        getVisits(1000),
        getProductViews(2000),
        getAllProducts(),
      ]);
      setVisits(v);
      setViews(pv);
      setProducts(prods);
    } catch (e) {
      alert('Error cargando estadísticas: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const priceById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of products) if (p.price) m[p.id] = p.price;
    return m;
  }, [products]);

  useEffect(() => {
    load();
  }, []);

  const cutoff = useMemo(() => {
    const today = startOfToday();
    if (range === '1d') return today;
    if (range === '7d') return today - 6 * DAY_MS;
    if (range === '30d') return today - 29 * DAY_MS;
    return 0; // 'all'
  }, [range]);

  const fVisits = useMemo(
    () => visits.filter((v) => new Date(v.created_at).getTime() >= cutoff),
    [visits, cutoff]
  );
  const fViews = useMemo(
    () => views.filter((v) => new Date(v.created_at).getTime() >= cutoff),
    [views, cutoff]
  );

  const uniqueSessions = useMemo(
    () => new Set(fVisits.map((v) => v.session_id).filter(Boolean)).size,
    [fVisits]
  );

  const deviceBreakdown = useMemo(() => {
    const d = { mobile: 0, tablet: 0, desktop: 0 };
    for (const v of fVisits) {
      const k = (v.device || 'desktop') as keyof typeof d;
      if (k in d) d[k]++;
    }
    return d;
  }, [fVisits]);

  // Serie por día (en zona local)
  const byDay = useMemo(() => {
    const days = range === '1d' ? 1 : range === '7d' ? 7 : 30;
    const today = startOfToday();
    const map: Record<string, { visits: number; views: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      map[localDateKeyFromMs(today - i * DAY_MS)] = { visits: 0, views: 0 };
    }
    for (const v of fVisits) {
      const key = localDateKey(v.created_at);
      if (map[key]) map[key].visits++;
    }
    for (const v of fViews) {
      const key = localDateKey(v.created_at);
      if (map[key]) map[key].views++;
    }
    return Object.entries(map).map(([date, vals]) => ({ date, ...vals }));
  }, [fVisits, fViews, range]);

  const maxDayValue = Math.max(1, ...byDay.map((d) => Math.max(d.visits, d.views)));

  // Top productos
  const topProducts = useMemo(() => {
    const counts: Record<
      string,
      { id: string; name: string; category: string; count: number }
    > = {};
    for (const v of fViews) {
      const key = v.product_id;
      if (!counts[key]) {
        counts[key] = {
          id: v.product_id,
          name: v.product_name || '(sin nombre)',
          category: v.product_category || '',
          count: 0,
        };
      }
      counts[key].count++;
    }
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [fViews]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="btn-icon"
                title="Volver al panel"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">
                  Estadísticas
                </h1>
                <p className="text-xs text-gray-500">Flujo de visitantes del catálogo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full p-1">
                {(['1d', '7d', '30d', 'all'] as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      range === r
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {RANGE_LABELS[r]}
                  </button>
                ))}
              </div>
              <button onClick={load} className="btn-icon" title="Actualizar">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {/* Range selector mobile */}
          <div className="sm:hidden pb-3 flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {(['1d', '7d', '30d', 'all'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  range === r
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard
                icon={<Users className="w-5 h-5" />}
                label="Visitas"
                value={fVisits.length}
                hint={`${uniqueSessions} únicos`}
              />
              <MetricCard
                icon={<Eye className="w-5 h-5" />}
                label="Vistas de producto"
                value={fViews.length}
              />
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Vistas / visita"
                value={
                  fVisits.length > 0
                    ? (fViews.length / fVisits.length).toFixed(1)
                    : '0'
                }
              />
              <MetricCard
                icon={<Smartphone className="w-5 h-5" />}
                label="Móvil / Desktop / Tablet"
                value={`${deviceBreakdown.mobile}/${deviceBreakdown.desktop}/${deviceBreakdown.tablet}`}
                small
              />
            </div>

            {/* Gráfico por día */}
            <section className="bg-white rounded-2xl border p-4 sm:p-6">
              <h2 className="font-medium text-sm mb-4">
                Actividad por día ({RANGE_LABELS[range]})
              </h2>
              <div className="flex items-end gap-1 sm:gap-2 h-48 overflow-x-auto pb-2">
                {byDay.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 min-w-[24px] flex flex-col items-center gap-1"
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-40">
                      <div
                        className="w-1/2 bg-blue-500 rounded-t"
                        style={{
                          height: `${(d.visits / maxDayValue) * 100}%`,
                          minHeight: d.visits > 0 ? '4px' : '0',
                        }}
                        title={`${d.visits} visitas`}
                      />
                      <div
                        className="w-1/2 bg-purple-400 rounded-t"
                        style={{
                          height: `${(d.views / maxDayValue) * 100}%`,
                          minHeight: d.views > 0 ? '4px' : '0',
                        }}
                        title={`${d.views} vistas de producto`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatDateShort(parseLocalDate(d.date))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500" /> Visitas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-400" /> Vistas de producto
                </span>
              </div>
            </section>

            {/* Top productos + Visitas recientes */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <section className="bg-white rounded-2xl border p-4 sm:p-6">
                <h2 className="font-medium text-sm mb-4">Top productos más vistos</h2>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">
                    Sin vistas en este período
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {topProducts.map((p, i) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-3 py-2 border-b last:border-0"
                      >
                        <span className="text-xs font-semibold text-gray-400 w-5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">
                            {p.category}
                            {priceById[p.id] && (
                              <span className="ml-2 font-semibold text-gray-700">
                                $ {priceById[p.id]}
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="text-sm font-semibold">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white rounded-2xl border p-4 sm:p-6">
                <h2 className="font-medium text-sm mb-4">Visitas recientes</h2>
                {fVisits.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">
                    Sin visitas en este período
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                    {fVisits.slice(0, 50).map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center gap-3 py-2 border-b last:border-0 text-sm"
                      >
                        <DeviceIcon device={v.device} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">
                            {v.referrer ? (
                              <>
                                desde{' '}
                                <span className="text-gray-600">
                                  {new URL(v.referrer).hostname}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">directo</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(v.created_at)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <p className={small ? 'text-lg font-semibold' : 'text-2xl font-bold'}>
        {value}
      </p>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function DeviceIcon({ device }: { device: string | null }) {
  const Icon =
    device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor;
  return <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />;
}
