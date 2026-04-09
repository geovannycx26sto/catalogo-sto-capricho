'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check } from 'lucide-react';
import { Category, CATEGORIES, Product } from '@/types';
import { compressImage, createThumbnail, generateId } from '@/lib/imageUtils';
import { addProducts } from '@/lib/store';

interface ImageUploaderProps {
  onUploadComplete: () => void;
  onClose: () => void;
}

interface PendingFile {
  file: File;
  preview: string;
  name: string;
  description: string;
  category: Category;
  tags: string;
}

export default function ImageUploader({ onUploadComplete, onClose }: ImageUploaderProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [defaultCategory, setDefaultCategory] = useState<Category>('TALLAS M');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: PendingFile[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name.replace(/\.[^.]+$/, ''),
        description: '',
        category: defaultCategory,
        tags: '',
      }));
      setPendingFiles((prev) => [...prev, ...newFiles]);
    },
    [defaultCategory]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFile = (index: number, updates: Partial<PendingFile>) => {
    setPendingFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const applyCategory = (category: Category) => {
    setDefaultCategory(category);
    setPendingFiles((prev) => prev.map((f) => ({ ...f, category })));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    setProgress(0);

    const products: Product[] = [];
    const batchSize = 3;

    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      const batch = pendingFiles.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (pf) => {
          const [imageData, thumbnailData] = await Promise.all([
            compressImage(pf.file),
            createThumbnail(pf.file),
          ]);
          const product: Product = {
            id: generateId(),
            name: pf.name,
            description: pf.description,
            category: pf.category,
            tags: pf.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            imageData,
            thumbnailData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return product;
        })
      );
      products.push(...results);
      setProgress(Math.round(((i + batch.length) / pendingFiles.length) * 100));
    }

    await addProducts(products);
    pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
    setPendingFiles([]);
    setUploading(false);
    onUploadComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Subir Imágenes</h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 font-medium">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
          </div>

          {/* Default category */}
          {pendingFiles.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Categoría para todas:
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => applyCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      defaultCategory === cat
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File list */}
          {pendingFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {pendingFiles.length} imagen(es) seleccionada(s)
              </p>
              <div className="grid gap-3 max-h-[40vh] overflow-y-auto">
                {pendingFiles.map((pf, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-gray-50 items-start">
                    <img
                      src={pf.preview}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        value={pf.name}
                        onChange={(e) => updateFile(idx, { name: e.target.value })}
                        placeholder="Nombre / Referencia"
                        className="w-full text-sm px-2 py-1 rounded border border-gray-200 focus:outline-none focus:border-gray-400"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pf.tags}
                          onChange={(e) => updateFile(idx, { tags: e.target.value })}
                          placeholder="Tags (separados por coma)"
                          className="flex-1 text-xs px-2 py-1 rounded border border-gray-200 focus:outline-none focus:border-gray-400"
                        />
                        <select
                          value={pf.category}
                          onChange={(e) => updateFile(idx, { category: e.target.value as Category })}
                          className="text-xs px-2 py-1 rounded border border-gray-200 focus:outline-none focus:border-gray-400 bg-white"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => removeFile(idx)} className="btn-icon flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex items-center justify-between gap-3">
          {uploading ? (
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="spinner" />
                <span className="text-sm text-gray-600">Comprimiendo y subiendo... {progress}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <span className="text-sm text-gray-500">
                {pendingFiles.length > 0 ? `${pendingFiles.length} archivo(s)` : 'Sin archivos'}
              </span>
              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={pendingFiles.length === 0}
                  className="btn-primary flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Subir {pendingFiles.length > 0 && `(${pendingFiles.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
