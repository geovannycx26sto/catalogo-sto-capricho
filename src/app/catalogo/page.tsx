'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Search, X, Package, ChevronLeft, ChevronRight, Tag, Heart, Sparkles, Shield, Truck, Star } from 'lucide-react';
import { Product, Category, CategoryFilter, CATEGORIES, CONJUNTOS_CATEGORIES, NAV_ITEMS } from '@/types';
import { getAllProducts } from '@/lib/store';
import { downloadFromUrl, getExtFromUrl } from '@/lib/imageUtils';
import { trackVisit, trackProductView } from '@/lib/analytics';
import AnnouncementModal from '@/components/AnnouncementModal';

export default function CatalogoPublico() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('REFERENCIAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  const conjuntosCount = CONJUNTOS_CATEGORIES.reduce(
    (s, c) => s + (counts[c] || 0), 0
  );

  const isConjuntosActive =
    selectedCategory === 'CONJUNTOS' || CONJUNTOS_CATEGORIES.includes(selectedCategory as Category);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory === 'CONJUNTOS') {
      filtered = filtered.filter((p) => CONJUNTOS_CATEGORIES.includes(p.category));
    } else if (selectedCategory !== 'TODOS') {
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

  const handleCategoryChange = useCallback((filter: CategoryFilter) => {
    setSelectedCategory(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (selectedProduct) setImageLoaded(false);
  }, [selectedProduct]);

  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const whatsappBase = 'https://wa.me/573136954802';

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-white">
      {/* Hero header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-pink-50/50 to-amber-50/40" />
        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-16 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm text-xs font-medium text-rose-600 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Nueva coleccion disponible
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Sto Capricho
          </h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-md mx-auto">
            Moda femenina con estilo y personalidad. Encuentra tu look perfecto.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Envios a todo el pais
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Compra segura
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Calidad garantizada
            </span>
          </div>
        </div>
      </header>

      {/* Sticky nav */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-full border border-gray-200 bg-gray-50/80
                focus:bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none text-sm
                transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1 justify-center flex-wrap scrollbar-hide">
              {NAV_ITEMS.map((item) => {
                const isActive = item.children
                  ? isConjuntosActive
                  : selectedCategory === item.filter;
                const count = item.children
                  ? conjuntosCount
                  : counts[item.filter] || 0;
                return (
                  <button
                    key={item.filter}
                    onClick={() => handleCategoryChange(item.filter)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-md pill-active'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {item.label}
                    <span className={`ml-1 ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => handleCategoryChange('TODOS')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === 'TODOS'
                    ? 'bg-gray-900 text-white shadow-md pill-active'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Todos
                <span className={`ml-1 ${selectedCategory === 'TODOS' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {allCount}
                </span>
              </button>
            </div>

            {/* Sub-tallas conjuntos */}
            {isConjuntosActive && (
              <div className="flex gap-2 overflow-x-auto pb-1 justify-center flex-wrap scrollbar-hide">
                <button
                  onClick={() => handleCategoryChange('CONJUNTOS')}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedCategory === 'CONJUNTOS'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Todos ({conjuntosCount})
                </button>
                {CONJUNTOS_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {cat.replace('CONJUNTOS ', '')} ({counts[cat] || 0})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Results count */}
      {!loading && filteredProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-1">
          <p className="text-xs text-gray-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            {selectedCategory !== 'TODOS' && (
              <> en <span className="font-medium text-gray-500">{selectedCategory === 'CONJUNTOS' ? 'Conjuntos' : selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()}</span></>
            )}
          </p>
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-2xl skeleton" />
                <div className="mt-3 space-y-2 px-1">
                  <div className="h-4 w-16 rounded skeleton" />
                  <div className="h-3 w-24 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-5">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">
              {products.length === 0 ? 'Catalogo vacio' : 'Sin resultados'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {products.length === 0
                ? 'Pronto habra productos disponibles'
                : 'Intenta con otra busqueda o categoria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5 stagger-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  trackProductView(product);
                }}
                className="cursor-pointer group product-grid-enter product-card-tap"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 image-hover-zoom shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={product.thumbnailData}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {product.price && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-900 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                        $ {product.price}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                      <Heart className="w-3 h-3" />
                      Ver detalle
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 px-1">
                  <p className="text-xs text-gray-400 truncate">{product.name}</p>
                  {product.price && (
                    <p className="font-bold text-sm text-gray-900 mt-0.5">$ {product.price}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer with trust signals */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-center space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">Sto Capricho</h3>
              <p className="text-sm text-gray-500 mt-1">Tu tienda de moda femenina</p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 text-gray-400">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-5 h-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Envios</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Shield className="w-5 h-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Seguro</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Star className="w-5 h-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Calidad</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Heart className="w-5 h-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Estilo</span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`${whatsappBase}?text=${encodeURIComponent('Hola, vi su catalogo y me gustaria mas informacion')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escribenos por WhatsApp
            </a>

            <p className="text-[11px] text-gray-300">
              &copy; {new Date().getFullYear()} Sto Capricho &middot; Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>

      {/* Announcement Modal */}
      <AnnouncementModal />

      {/* Floating WhatsApp Button */}
      <a
        href={`${whatsappBase}?text=${encodeURIComponent(
          selectedProduct
            ? `Hola, me interesa este producto: ${selectedProduct.name} (${selectedProduct.category})`
            : 'Hola, vi su catalogo y me gustaria mas informacion'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 wa-pulse group"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm font-medium hidden sm:inline">Escribenos</span>
      </a>

      {/* Product Modal - Premium View */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
        >
          {/* Nav arrows - desktop */}
          {currentIndex > 0 && (
            <button
              onClick={() => setSelectedProduct(filteredProducts[currentIndex - 1])}
              className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {currentIndex < filteredProducts.length - 1 && (
            <button
              onClick={() => setSelectedProduct(filteredProducts[currentIndex + 1])}
              className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="bg-white sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col modal-slide-up sm:mx-4 rounded-t-2xl">
            {/* Close */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="relative bg-gray-100 flex items-center justify-center min-h-[320px] max-h-[55vh] sm:max-h-[65vh] overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
              <img
                src={selectedProduct.imageData}
                alt={selectedProduct.name}
                className={`max-w-full max-h-[55vh] sm:max-h-[65vh] object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
              {/* Mobile nav arrows */}
              <div className="sm:hidden absolute bottom-3 right-3 flex gap-2">
                {currentIndex > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(filteredProducts[currentIndex - 1]); }}
                    className="p-2 rounded-full bg-white/90 shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {currentIndex < filteredProducts.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(filteredProducts[currentIndex + 1]); }}
                    className="p-2 rounded-full bg-white/90 shadow-md"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Counter */}
              {filteredProducts.length > 1 && (
                <span className="absolute top-3 left-3 text-xs bg-black/40 text-white px-2.5 py-1 rounded-full">
                  {currentIndex + 1} / {filteredProducts.length}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
                <h3 className="font-semibold text-lg mt-2 text-gray-900">{selectedProduct.name}</h3>
                {selectedProduct.price && (
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    $ {selectedProduct.price}
                  </p>
                )}
              </div>

              {selectedProduct.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-[11px] text-gray-500 border border-gray-100"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <a
                  href={`${whatsappBase}?text=${encodeURIComponent(`Hola, me interesa este producto: ${selectedProduct.name} (${selectedProduct.category})${selectedProduct.price ? ` - $${selectedProduct.price}` : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Consultar por WhatsApp
                </a>
                <button
                  onClick={() => handleDownload(selectedProduct)}
                  className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors"
                  title="Descargar imagen"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
