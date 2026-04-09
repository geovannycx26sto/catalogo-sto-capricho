'use client';

import { Category, CATEGORIES } from '@/types';

interface CategoryNavProps {
  selected: Category | 'TODOS';
  onSelect: (cat: Category | 'TODOS') => void;
  counts: Record<string, number>;
}

export default function CategoryNav({ selected, onSelect, counts }: CategoryNavProps) {
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect('TODOS')}
        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === 'TODOS'
            ? 'bg-gray-900 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Todos
        <span className="ml-1.5 text-xs opacity-70">({allCount})</span>
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === cat
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat}
          <span className="ml-1.5 text-xs opacity-70">({counts[cat] || 0})</span>
        </button>
      ))}
    </div>
  );
}
