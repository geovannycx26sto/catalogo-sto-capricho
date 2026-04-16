'use client';

import { useState } from 'react';
import { X, Download, Trash2, ArrowLeftRight, Tag, ChevronLeft, ChevronRight, Pencil, Check } from 'lucide-react';
import { Product, Category, CATEGORIES } from '@/types';
import { downloadFromUrl, getExtFromUrl } from '@/lib/imageUtils';
import { deleteProduct, moveProduct, updateProductPrice } from '@/lib/store';

interface ImageModalProps {
  product: Product;
  products: Product[];
  isAdmin: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onNavigate: (product: Product) => void;
}

export default function ImageModal({
  product,
  products,
  isAdmin,
  onClose,
  onUpdate,
  onNavigate,
}: ImageModalProps) {
  const [showMove, setShowMove] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(product.price || '');
  const [savingPrice, setSavingPrice] = useState(false);

  const currentIndex = products.findIndex((p) => p.id === product.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < products.length - 1;

  const handleDownload = () => {
    const ext = getExtFromUrl(product.imageData);
    downloadFromUrl(product.imageData, `${product.name}.${ext}`);
  };

  const handleDelete = async () => {
    await deleteProduct(product.id);
    onUpdate();
    onClose();
  };

  const handleMove = async (cat: Category) => {
    await moveProduct(product.id, cat);
    setShowMove(false);
    onUpdate();
  };

  const handleSavePrice = async () => {
    try {
      setSavingPrice(true);
      await updateProductPrice(product.id, priceInput.trim());
      setEditingPrice(false);
      onUpdate();
    } catch (e) {
      alert('Error al guardar precio: ' + (e as Error).message);
    } finally {
      setSavingPrice(false);
    }
  };

  const handlePrev = () => {
    if (hasPrev) onNavigate(products[currentIndex - 1]);
  };
  const handleNext = () => {
    if (hasNext) onNavigate(products[currentIndex + 1]);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Image */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          <img
            src={product.imageData}
            alt={product.name}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Info panel */}
        <div className="w-full md:w-80 flex flex-col border-t md:border-t-0 md:border-l">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg truncate">{product.name}</h3>
            <button onClick={onClose} className="btn-icon flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium">
                {product.category}
              </span>
            </div>

            {/* Precio */}
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-gray-500">Precio</p>
                {isAdmin && !editingPrice && (
                  <button
                    onClick={() => {
                      setPriceInput(product.price || '');
                      setEditingPrice(true);
                    }}
                    className="btn-icon text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900"
                  >
                    <Pencil className="w-3 h-3" />
                    {product.price ? 'Editar' : 'Agregar'}
                  </button>
                )}
              </div>
              {editingPrice ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Ej: 15.000"
                    className="flex-1 text-sm px-2 py-1 rounded border border-gray-200 focus:outline-none focus:border-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={handleSavePrice}
                    disabled={savingPrice}
                    className="btn-primary text-xs px-3 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {savingPrice ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setEditingPrice(false)}
                    className="btn-icon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {product.price ? `$ ${product.price}` : <span className="text-sm font-normal text-gray-400">Sin precio</span>}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-gray-600">{product.description}</p>
            )}

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Move category */}
            {isAdmin && showMove && (
              <div className="p-3 rounded-lg bg-gray-50 space-y-2">
                <p className="text-xs font-medium text-gray-500">Mover a:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.filter((c) => c !== product.category).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleMove(cat)}
                      className="px-2.5 py-1 rounded-full text-xs bg-white border border-gray-200 hover:border-gray-400 transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delete confirm */}
            {isAdmin && confirmDelete && (
              <div className="p-3 rounded-lg bg-red-50 space-y-2">
                <p className="text-sm text-red-700">
                  ¿Eliminar esta imagen permanentemente?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t space-y-2">
            <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Descargar
            </button>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowMove(!showMove);
                    setConfirmDelete(false);
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-xs"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Mover
                </button>
                <button
                  onClick={() => {
                    setConfirmDelete(!confirmDelete);
                    setShowMove(false);
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
