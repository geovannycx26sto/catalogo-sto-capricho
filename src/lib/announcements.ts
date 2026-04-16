import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

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

/**
 * Sube una imagen al bucket "catalog-images" bajo la carpeta "announcements/"
 * y devuelve su URL pública. Comprime la imagen antes de subir.
 */
export async function uploadAnnouncementImage(file: File): Promise<string> {
  // Comprime a máx 1.5 MB / 1600 px para que cargue rápido
  const compressed = await imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    preserveExif: false,
  });

  // Detecta extensión
  const mime = compressed.type || 'image/jpeg';
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const path = `announcements/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('catalog-images')
    .upload(path, compressed, {
      contentType: mime,
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from('catalog-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function saveAnnouncement(a: Omit<Announcement, 'updated_at'>) {
  const payload = { ...a, id: 'main', updated_at: new Date().toISOString() };
  // upsert para manejar el caso en que la fila no exista
  const { error } = await supabase
    .from('announcement')
    .upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}
