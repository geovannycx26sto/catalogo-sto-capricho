'use client';

import { useState } from 'react';
import { Download, X, FileArchive, FileImage } from 'lucide-react';
import { Product, Category, CATEGORIES } from '@/types';
import { fetchAsBlob, downloadBlob, getExtFromUrl } from '@/lib/imageUtils';
import JSZip from 'jszip';

interface DownloadManagerProps {
  products: Product[];
  onClose: () => void;
}

export default function DownloadManager({ products, onClose }: DownloadManagerProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState('');

  const downloadCategory = async (category: Category) => {
    const filtered = products.filter((p) => p.category === category);
    if (filtered.length === 0) return;
    setDownloading(true);
    setProgress(`Descargando ${category}... (0/${filtered.length})`);

    const zip = new JSZip();

    // Download images in batches of 5
    for (let i = 0; i < filtered.length; i += 5) {
      const batch = filtered.slice(i, i + 5);
      const blobs = await Promise.all(
        batch.map((p) => fetchAsBlob(p.imageData))
      );
      batch.forEach((p, j) => {
        const ext = getExtFromUrl(p.imageData);
        zip.file(`${p.name || `imagen-${i + j + 1}`}.${ext}`, blobs[j]);
      });
      setProgress(`Descargando ${category}... (${Math.min(i + 5, filtered.length)}/${filtered.length})`);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, `${category}.zip`);
    setDownloading(false);
    setProgress('');
  };

  const downloadAll = async () => {
    if (products.length === 0) return;
    setDownloading(true);
    setProgress('Preparando catálogo completo...');

    const zip = new JSZip();
    let done = 0;

    for (const cat of CATEGORIES) {
      const filtered = products.filter((p) => p.category === cat);
      if (filtered.length === 0) continue;
      const folder = zip.folder(cat)!;

      for (let i = 0; i < filtered.length; i += 5) {
        const batch = filtered.slice(i, i + 5);
        const blobs = await Promise.all(
          batch.map((p) => fetchAsBlob(p.imageData))
        );
        batch.forEach((p, j) => {
          const ext = getExtFromUrl(p.imageData);
          folder.file(`${p.name || `imagen-${i + j + 1}`}.${ext}`, blobs[j]);
        });
        done += batch.length;
        setProgress(`Descargando... (${done}/${products.length})`);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, 'catalogo-sto-capricho.zip');
    setDownloading(false);
    setProgress('');
  };

  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Descargar Catálogo
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {downloading ? (
            <div className="flex items-center gap-3 p-4">
              <div className="spinner" />
              <span className="text-sm text-gray-600">{progress}</span>
            </div>
          ) : (
            <>
              <button
                onClick={downloadAll}
                disabled={products.length === 0}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                <FileArchive className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm">Catálogo Completo (ZIP)</p>
                  <p className="text-xs text-gray-300">{products.length} imágenes</p>
                </div>
              </button>

              <p className="text-xs font-medium text-gray-500 pt-2">Por categoría:</p>
              {catCounts.map(({ cat, count }) => (
                <button
                  key={cat}
                  onClick={() => downloadCategory(cat)}
                  disabled={count === 0}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-40"
                >
                  <FileImage className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{cat}</p>
                  </div>
                  <span className="text-xs text-gray-400">{count} img</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
