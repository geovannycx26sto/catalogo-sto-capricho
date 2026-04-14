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
        selected ? 'ring-2 ring-gray-900' : ''
      }`}
    >
      {selectionMode && (
        <div
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
            selected
              ? 'bg-gray-900 border-gray-900 text-white'
              : 'bg-white/90 border-white shadow'
          }`}
        >
          {selected && <Check className="w-4 h-4" />}
        </div>
      )}
      <div className={`aspect-[3/4] overflow-hidden bg-gray-50 ${selected ? 'opacity-80' : ''}`}>
        <img
          src={product.thumbnailData}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
