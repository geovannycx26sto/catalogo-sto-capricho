import { supabase } from './supabase';

export interface Announcement {
  id: string;
  enabled: boolean;
  image_url: string;
  title: string;
  subtitle: string;
  body: string;
  cta_label: string;
  cta_url: string;
  updated_at?: string;
}

const DEFAULT: Announcement = {
  id: 'main',
  enabled: false,
  image_url: '',
  title: '',
  subtitle: '',
  body: '',
  cta_label: '',
  cta_url: '',
};

export async function getAnnouncement(): Promise<Announcement> {
  try {
    const { data, error } = await supabase
      .from('announcement')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();
    if (error) return DEFAULT;
    if (!data) return DEFAULT;
    return { ...DEFAULT, ...(data as Announcement) };
  } catch {
    return DEFAULT;
  }
}

export async function saveAnnouncement(a: Omit<Announcement, 'updated_at'>) {
  const payload = { ...a, id: 'main', updated_at: new Date().toISOString() };
  // upsert para manejar el caso en que la fila no exista
  const { error } = await supabase
    .from('announcement')
    .upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}
