'use client';

import { useState, useEffect, useMemo } from 'react';
import { Download, Search, X, Package, ChevronLeft, ChevronRight, Tag, MessageCircle } from 'lucide-react';
import { Product, Category, CATEGORIES } from '@/types';
import { getAllProducts } from '@/lib/store';
import { downloadFromUrl, getExtFromUrl } from '@/lib/imageUtils';
import { trackVisit, trackProductView } from '@/lib/analytics';

export default function CatalogoPublico() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'TODOS'>('REFERENCIAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
    trackVisit('/catalogo');
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

  const currentIndex = selectedProduct
    ? filteredProducts.findIndex((p) => p.id === selectedProduct.id)
    : -1;

  const handleDownload = (product: Product) => {
    const ext = getExtFromUrl(product.imageData);
    downloadFromUrl(product.imageData, `${product.name}.${ext}`);
  };

  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Sto Capricho
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Explora nuestra colección completa
          </p>
        </div>
      </header>

      {/* Sticky nav */}
      <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 bg-gray-50
                focus:bg-white focus:border-gray-400 focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 justify-center flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat} ({counts[cat] || 0})
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory('TODOS')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'TODOS'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({allCount})
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">
              {products.length === 0 ? 'Catálogo vacío' : 'Sin resultados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  trackProductView(product);
                }}
                className="cursor-pointer group product-grid-enter"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 image-hover-zoom">
                  <img
                    src={product.thumbnailData}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-2 px-0.5">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-8 text-center text-xs text-gray-400">
        <p>Sto Capricho &middot; Catálogo Digital &middot; {new Date().getFullYear()}</p>
      </footer>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/573136954802?text=${encodeURIComponent(
          selectedProduct
            ? `Hola, me interesa este producto: ${selectedProduct.name} (${selectedProduct.category})`
            : 'Hola, vi su catálogo y me gustaría más información'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-[#20bd5a] hover:shadow-xl transition-all duration-300 group"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm font-medium hidden sm:inline">Escríbenos</span>
      </a>

      {/* Image Modal - Public View */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
        >
          {/* Nav arrows */}
          {currentIndex > 0 && (
            <button
              onClick={() => setSelectedProduct(filteredProducts[currentIndex - 1])}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < filteredProducts.length - 1 && (
            <button
              onClick={() => setSelectedProduct(filteredProducts[currentIndex + 1])}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Image */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center min-h-[300px] max-h-[60vh] sm:max-h-[70vh]">
              <img
                src={selectedProduct.imageData}
                alt={selectedProduct.name}
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain"
              />
            </div>

            {/* Info */}
            <div className="p-4 border-t space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.price && (
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      $ {selectedProduct.price}
                    </p>
                  )}
                  {selectedProduct.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedProduct.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gray-50 text-[10px] text-gray-500"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
              <a
                                href={`https://wa.me/573136954802?text=${encodeURIComponent(`Hola, me interesa este producto: ${selectedProduct?.name} (${selectedProduct?.category})`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200"
                              >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Consultar
              </a>
                  <button
                    onClick={() => handleDownload(selectedProduct)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="btn-icon"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
