'use client';

import { CategoryFilter, NAV_ITEMS, CONJUNTOS_CATEGORIES } from '@/types';

interface CategoryNavProps {
  selected: CategoryFilter;
  onSelect: (cat: CategoryFilter) => void;
  counts: Record<string, number>;
}

export default function CategoryNav({ selected, onSelect, counts }: CategoryNavProps) {
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const conjuntosCount = CONJUNTOS_CATEGORIES.reduce((s, c) => s + (counts[c] || 0), 0);

  const isConjuntosActive =
    selected === 'CONJUNTOS' || CONJUNTOS_CATEGORIES.includes(selected as any);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const isActive = item.children
            ? isConjuntosActive
            : selected === item.filter;
          const count = item.children
            ? conjuntosCount
            : counts[item.filter] || 0;

          return (
            <button
              key={item.filter}
              onClick={() => onSelect(item.filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
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
      </div>

      {/* Sub-menu for CONJUNTOS */}
      {isConjuntosActive && (
        <div className="flex gap-2 overflow-x-auto pb-1 pl-2 scrollbar-hide">
          <button
            onClick={() => onSelect('CONJUNTOS')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              selected === 'CONJUNTOS'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Todos
            <span className="ml-1 opacity-70">({conjuntosCount})</span>
          </button>
          {CONJUNTOS_CATEGORIES.map((cat) => {
            const sizeLabel = cat.replace('CONJUNTOS ', '');
            return (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  selected === cat
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {sizeLabel}
                <span className="ml-1 opacity-70">({counts[cat] || 0})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
