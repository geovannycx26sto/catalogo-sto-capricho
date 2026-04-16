'use client';

import { Check } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  selectionMode?: boolean;
  selected?: boolean;
}

export default function ProductCard({
  product,
  onClick,
  selectionMode = false,
  selected = false,
}: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer overflow-hidden group product-grid-enter image-hover-zoom relative ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {selectionMode && (
        <div
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'bg-white/90 border-gray-300'
          }`}
        >
          {selected && <Check className="w-4 h-4" strokeWidth={3} />}
        </div>
      )}
      <div className="aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          src={product.thumbnailData}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        {product.price ? (
          <p className="font-semibold text-sm text-gray-900">$ {product.price}</p>
        ) : (
          <p className="font-semibold text-sm text-gray-300">Sin precio</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5 truncate">{product.name}</p>
      </div>
    </div>
  );
}
