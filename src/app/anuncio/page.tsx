'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Upload, Trash2, Loader2 } from 'lucide-react';
import {
  getAnnouncement,
  saveAnnouncement,
  uploadAnnouncementImage,
  Announcement,
} from '@/lib/announcements';
import AnnouncementModal from '@/components/AnnouncementModal';

const EMPTY: Announcement = {
  id: 'main',
  enabled: false,
  image_url: '',
  title: '',
  subtitle: '',
  body: '',
  cta_label: '',
  cta_url: '',
};

export default function AnuncioAdminPage() {
  const [form, setForm] = useState<Announcement>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    getAnnouncement().then((a) => {
      setForm(a);
      setLoading(false);
    });
  }, []);

  const update = <K extends keyof Announcement>(key: K, value: Announcement[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImg(true);
      const url = await uploadAnnouncementImage(file);
      update('image_url', url);
    } catch (err) {
      alert('Error al subir imagen: ' + (err as Error).message);
    } finally {
      setUploadingImg(false);
      // Permite volver a subir el mismo archivo si se requiere
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveAnnouncement(form);
      setSavedAt(new Date().toLocaleTimeString('es-CO'));
    } catch (e) {
      alert('Error al guardar: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="btn-icon" title="Volver al panel">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-lg leading-tight truncate">
                  Anuncio de bienvenida
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  Aparece al entrar al catálogo público
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowPreview(true)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Vista previa</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            {/* Enabled switch */}
            <label className="flex items-center justify-between gap-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                {form.enabled ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {form.enabled ? 'Activo' : 'Oculto'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.enabled
                      ? 'Se muestra a los visitantes del catálogo'
                      : 'No aparece en el catálogo público'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => update('enabled', !form.enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.enabled ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </label>

            <Field
              label="Imagen"
              hint="Sube una imagen desde tu dispositivo o pega una URL pública"
            >
              {form.image_url ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border">
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = 'none')
                    }
                  />
                  <button
                    type="button"
                    onClick={() => update('image_url', '')}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-red-600"
                    title="Quitar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    uploadingImg
                      ? 'border-gray-400 bg-gray-50 cursor-wait'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingImg}
                    className="hidden"
                  />
                  {uploadingImg ? (
                    <>
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      <span className="mt-2 text-xs text-gray-500">
                        Subiendo imagen...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="mt-2 text-sm font-medium text-gray-700">
                        Click para subir imagen
                      </span>
                      <span className="text-[11px] text-gray-400">
                        JPG, PNG o WEBP (se comprime automáticamente)
                      </span>
                    </>
                  )}
                </label>
              )}
              <div className="mt-2">
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => update('image_url', e.target.value)}
                  placeholder="...o pega una URL pública aquí"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-500"
                />
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Subtítulo (arriba del título)" hint={"Ej: 'Durante el mes de tu cumpleaños'"}>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => update('subtitle', e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-500"
                  maxLength={80}
                />
              </Field>
              <Field label="Título" hint={"Ej: '15% OFF' o '¡Bienvenido!'"}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-500"
                  maxLength={60}
                />
              </Field>
            </div>

            <Field label="Mensaje" hint="Texto secundario. Salto de línea con Enter.">
              <textarea
                value={form.body}
                onChange={(e) => update('body', e.target.value)}
                rows={3}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-500 resize-none"
                maxLength={300}
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Texto del botón" hint="Opcional. Ej: 'Reclamar regalo'">
                <input
                  type="text"
                  value={form.cta_label}
                  onChange={(e) => update('cta_label', e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-500"
                  maxLength={30}
                />
              </Field>
              <Field label="URL del botón" hint="WhatsApp, referencia, o enlace externo">
                <input
                  type="url"
                  value={form.cta_url}
                  onChange={(e) => update('cta_url', e.target.value)}
                  placeholder="https://wa.me/573136954802?text=..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-500"
                />
              </Field>
            </div>

            {savedAt && (
              <p className="text-xs text-green-600">Guardado {savedAt}</p>
            )}
          </div>
        )}
      </main>

      {showPreview && (
        <>
          <AnnouncementModal preview={form} />
          {/* Cerrar la preview al hacer click en el fondo ya lo maneja el modal */}
          <button
            onClick={() => setShowPreview(false)}
            className="fixed top-4 right-4 z-[70] btn-secondary text-xs"
          >
            Cerrar vista previa
          </button>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}
