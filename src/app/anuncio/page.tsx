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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImg(true);
      const url = await uploadAnnouncementImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      alert('Error al subir imagen: ' + (err as Error).message);
    } finally {
      setUploadingImg(false);
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="btn-icon" title="Volver al panel">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-lg leading-tight">
                  Anuncio de bienvenida
                </h1>
                <p className="text-xs text-gray-500">
                  Aparece al entrar al catálogo público
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {form.image_url && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Vista previa</span>
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || loading || uploadingImg}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Switch activo/oculto */}
            <div className="bg-white rounded-2xl border p-4 flex items-center justify-between gap-4">
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
                      ? 'Los visitantes ven el anuncio al entrar'
                      : 'No aparece en el catálogo público'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  form.enabled ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Imagen */}
            <div className="bg-white rounded-2xl border p-4">
              <p className="text-sm font-medium mb-3">Imagen del anuncio</p>

              {form.image_url ? (
                <div className="relative rounded-xl overflow-hidden bg-gray-100 border">
                  <img
                    src={form.image_url}
                    alt="Anuncio"
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {/* Cambiar imagen */}
                    <label className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploadingImg}
                        className="hidden"
                      />
                      {uploadingImg ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-700" />
                      )}
                    </label>
                    {/* Eliminar imagen */}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, image_url: '' }))
                      }
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-red-600"
                      title="Quitar imagen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-56 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
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
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <span className="mt-3 text-sm text-gray-500">
                        Subiendo imagen...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="mt-3 text-sm font-medium text-gray-700">
                        Toca para subir tu imagen
                      </span>
                      <span className="mt-1 text-xs text-gray-400">
                        JPG · PNG · WEBP
                      </span>
                    </>
                  )}
                </label>
              )}

              <p className="text-xs text-gray-400 mt-2">
                La imagen se muestra exactamente como la subas (sin recorte ni texto adicional).
              </p>
            </div>

            {savedAt && (
              <p className="text-xs text-green-600 text-center">
                ✓ Guardado a las {savedAt}
              </p>
            )}
          </>
        )}
      </main>

      {showPreview && (
        <>
          <AnnouncementModal preview={form} />
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
