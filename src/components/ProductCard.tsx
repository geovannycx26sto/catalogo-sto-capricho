'use client';

import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer overflow-hidden group product-grid-enter image-hover-zoom"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-50">
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
