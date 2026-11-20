'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAnnouncement, Announcement } from '@/lib/announcements';

const SEEN_KEY = 'sc_announcement_seen';

interface Props {
  forcePreview?: boolean;
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
    getAnnouncement().then((a) => {
      if (!a.enabled || !a.image_url) return;
      if (!forcePreview) {
        try {
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

  if (!visible || !data?.image_url) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative max-w-lg w-full">
        <button
          onClick={close}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={data.image_url}
          alt="Anuncio"
          className="w-full h-auto rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
