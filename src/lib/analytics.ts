import { supabase } from './supabase';

// Session id (persistente por navegador) para agrupar eventos sin identificar personas
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem('sc_session_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('sc_session_id', id);
    }
    return id;
  } catch {
    return '';
  }
}

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod|opera mini|iemobile/.test(ua)) return 'mobile';
  return 'desktop';
}

// Evita registrar la misma visita dos veces por recarga rápida (cooldown de 30 min)
function shouldRecordVisit(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const last = Number(localStorage.getItem('sc_last_visit') || 0);
    const now = Date.now();
    if (now - last < 30 * 60 * 1000) return false;
    localStorage.setItem('sc_last_visit', String(now));
    return true;
  } catch {
    return true;
  }
}

export async function trackVisit(path: string = '/catalogo') {
  if (!shouldRecordVisit()) return;
  try {
    await supabase.from('visits').insert({
      session_id: getSessionId(),
      device: detectDevice(),
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      path,
    });
  } catch {
    // Silencioso: analytics no debe romper la experiencia
  }
}

export async function trackProductView(product: {
  id: string;
  name: string;
  category: string;
}) {
  try {
    await supabase.from('product_views').insert({
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      session_id: getSessionId(),
    });
  } catch {
    // Silencioso
  }
}

// -------- Consultas para el dashboard admin --------

export interface VisitRow {
  id: number;
  session_id: string | null;
  device: string | null;
  referrer: string | null;
  user_agent: string | null;
  path: string | null;
  created_at: string;
}

export interface ProductViewRow {
  id: number;
  product_id: string;
  product_name: string | null;
  product_category: string | null;
  session_id: string | null;
  created_at: string;
}

export async function getVisits(limit = 500): Promise<VisitRow[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getProductViews(limit = 1000): Promise<ProductViewRow[]> {
  const { data, error } = await supabase
    .from('product_views')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
