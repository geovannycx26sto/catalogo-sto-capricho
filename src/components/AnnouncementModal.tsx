'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAnnouncement, Announcement } from '@/lib/announcements';

const SEEN_KEY = 'sc_announcement_seen';

interface Props {
  /** Si true, ignora el flag de "ya visto" (para la vista previa admin) */
  forcePreview?: boolean;
  /** Permite pasar un anuncio directo (vista previa en edición en vivo) */
  preview?: Announcement;
}

export default function AnnouncementModal({ forcePreview, preview }: Props) {
  const [data, setData] = useState<Announcement | null>(preview ?? null);
  const [visible, setVisible] = useState(!!preview || !!forcePreview);

  useEffect(() => {
    if (preview) {
      setData(preview);
      setVisible(true);
      return;
    }
    // Carga desde DB
    getAnnouncement().then((a) => {
      if (!a.enabled) return;
      if (!forcePreview) {
        try {
          // Mostrar una vez por sesión + invalidar si cambió updated_at
          const seen = sessionStorage.getItem(SEEN_KEY);
          if (seen && a.updated_at && seen === a.updated_at) return;
        } catch {}
      }
      setData(a);
      setVisible(true);
    });
  }, [forcePreview, preview]);

  const close = () => {
    setVisible(false);
    if (data?.updated_at && !forcePreview && !preview) {
      try {
        sessionStorage.setItem(SEEN_KEY, data.updated_at);
      } catch {}
    }
  };

  if (!visible || !data) return null;

  const hasImage = !!data.image_url;
  const hasCta = !!(data.cta_label && data.cta_url);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden relative max-w-3xl w-full flex flex-col ${
          hasImage ? 'md:flex-row' : ''
        } max-h-[90vh]`}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {hasImage && (
          <div className="md:w-1/2 bg-gray-100 flex-shrink-0">
            <img
              src={data.image_url}
              alt={data.title || 'Anuncio'}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
        )}

        <div
          className={`flex-1 p-6 sm:p-8 flex flex-col justify-center ${
            hasImage ? '' : 'text-center items-center'
          }`}
        >
          {data.subtitle && (
            <p className="text-xs sm:text-sm font-medium tracking-wider text-gray-500 uppercase mb-2">
              {data.subtitle}
            </p>
          )}
          {data.title && (
            <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-gray-900">
              {data.title}
            </h2>
          )}
          {data.body && (
            <p className="mt-3 text-sm sm:text-base text-gray-600 whitespace-pre-line">
              {data.body}
            </p>
          )}
          {hasCta && (
            <a
              href={data.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="mt-5 inline-flex items-center justify-center bg-gray-900 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-black transition-colors self-start"
            >
              {data.cta_label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
