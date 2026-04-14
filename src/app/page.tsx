'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Download,
  Share2,
  Eye,
  Package,
  Copy,
  Check,
  ExternalLink,
  CheckSquare,
  Trash2,
  X,
} from 'lucide-react';
import { Product, Category, CATEGORIES } from '@/types';
import { getAllProducts, deleteProducts } from '@/lib/store';
import CategoryNav from '@/components/CategoryNav';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import ImageUploader from '@/components/ImageUploader';
import ImageModal from '@/components/ImageModal';
import DownloadManager from '@/components/DownloadManager';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'TODOS'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getAllProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      c[cat] = products.filter((p) => p.category === cat).length;
    });
    return c;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'TODOS') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/catalogo`
      : '/catalogo';

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedIds(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await deleteProducts(Array.from(selectedIds));
      await loadProducts();
      exitSelectionMode();
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">Sto Capricho</h1>
                <p className="text-xs text-gray-500">Panel de Administración</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectionMode ? (
                <button
                  onClick={exitSelectionMode}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancelar</span>
                </button>
              ) : (
                <>
                  <a
                    href="/catalogo"
                    target="_blank"
                    className="btn-icon hidden sm:flex items-center gap-1.5 text-xs text-gray-600"
                    title="Ver catálogo público"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden md:inline">Vista previa</span>
                  </a>
                  <button
                    onClick={() => setShowShare(!showShare)}
                    className="btn-secondary flex items-center gap-2 text-sm relative"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Compartir</span>
                  </button>
                  <button
                    onClick={enterSelectionMode}
                    className="btn-secondary flex items-center gap-2 text-sm"
                    title="Seleccionar varias para eliminar"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Seleccionar</span>
                  </button>
                  <button
                    onClick={() => setShowDownload(true)}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Descargar</span>
                  </button>
                  <button
                    onClick={() => setShowUploader(true)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Subir</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Share dropdown */}
          {showShare && (
            <div className="absolute right-4 sm:right-6 top-14 bg-white rounded-xl shadow-xl border p-4 w-80 z-40">
              <p className="text-sm font-medium mb-2">Enlace del catálogo público:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-primary flex items-center gap-1.5 text-xs px-3"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <a
                href="/catalogo"
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mt-3"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir catálogo público
              </a>
              <p className="text-[10px] text-gray-400 mt-2">
                Los clientes verán el catálogo en modo solo lectura, optimizado para móvil.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search + Categories */}
        <div className="space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryNav selected={selectedCategory} onSelect={setSelectedCategory} counts={counts} />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredProducts.length} producto(s)
            {selectedCategory !== 'TODOS' && ` en ${selectedCategory}`}
            {searchQuery && ` · búsqueda: "${searchQuery}"`}
          </p>
        </div>

        {/* Selection action bar */}
        {selectionMode && (
          <div className="sticky top-16 z-20 bg-white rounded-xl border shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {selectedIds.size} seleccionada(s)
              </span>
              {selectedIds.size > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  limpiar
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAllVisible}
                className="btn-secondary text-xs flex items-center gap-1.5"
                disabled={filteredProducts.length === 0}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Seleccionar todo
                {filteredProducts.length > 0 && ` (${filteredProducts.length})`}
              </button>
              <button
                onClick={() => setConfirmBulkDelete(true)}
                disabled={selectedIds.size === 0 || deleting}
                className="btn-primary text-xs flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar {selectedIds.size > 0 && `(${selectedIds.size})`}
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No hay productos</p>
            <p className="text-sm text-gray-400 mt-1">
              {products.length === 0
                ? 'Sube imágenes para comenzar a crear tu catálogo'
                : 'No se encontraron resultados para esta búsqueda'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setShowUploader(true)}
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir imágenes
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selectionMode={selectionMode}
                selected={selectedIds.has(product.id)}
                onClick={() =>
                  selectionMode
                    ? toggleSelection(product.id)
                    : setSelectedProduct(product)
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Close share on outside click */}
      {showShare && (
        <div className="fixed inset-0 z-20" onClick={() => setShowShare(false)} />
      )}

      {/* Modals */}
      {showUploader && (
        <ImageUploader
          onUploadComplete={() => {
            loadProducts();
            setShowUploader(false);
          }}
          onClose={() => setShowUploader(false)}
        />
      )}

      {showDownload && (
        <DownloadManager products={products} onClose={() => setShowDownload(false)} />
      )}

      {/* Bulk delete confirmation */}
      {confirmBulkDelete && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) setConfirmBulkDelete(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Eliminar imágenes</h3>
                <p className="text-sm text-gray-500">
                  ¿Eliminar {selectedIds.size} imagen(es) permanentemente?
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                disabled={deleting}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="btn-primary text-sm bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="spinner w-3.5 h-3.5 border-2" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Sí, eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <ImageModal
          product={selectedProduct}
          products={filteredProducts}
          isAdmin={true}
          onClose={() => setSelectedProduct(null)}
          onUpdate={loadProducts}
          onNavigate={(p) => setSelectedProduct(p)}
        />
      )}
    </div>
  );
}
