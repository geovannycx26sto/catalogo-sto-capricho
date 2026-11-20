export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  tags: string[];
  price: string; // precio como texto (ej: "15.000") — vacío si no aplica
  imageData: string; // base64
  thumbnailData: string; // compressed base64 for grid
  createdAt: number;
  updatedAt: number;
}

export type Category =
  | 'TALLAS M'
  | 'TALLAS L'
  | 'TALLAS XL'
  | 'TALLAS XXL'
  | 'CONJUNTOS M'
  | 'CONJUNTOS L'
  | 'CONJUNTOS XL'
  | 'CONJUNTOS XXL'
  | 'REFERENCIAS'
  | 'VESTIDOS';

export const CATEGORIES: Category[] = [
  'REFERENCIAS',
  'TALLAS M',
  'TALLAS L',
  'TALLAS XL',
  'TALLAS XXL',
  'CONJUNTOS M',
  'CONJUNTOS L',
  'CONJUNTOS XL',
  'CONJUNTOS XXL',
  'VESTIDOS',
];

export const CONJUNTOS_CATEGORIES: Category[] = [
  'CONJUNTOS M',
  'CONJUNTOS L',
  'CONJUNTOS XL',
  'CONJUNTOS XXL',
];

export type CategoryFilter = Category | 'TODOS' | 'CONJUNTOS';

export interface NavItem {
  label: string;
  filter: CategoryFilter;
  children?: { label: string; filter: Category }[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Referencias', filter: 'REFERENCIAS' },
  { label: 'Tallas M', filter: 'TALLAS M' },
  { label: 'Tallas L', filter: 'TALLAS L' },
  { label: 'Tallas XL', filter: 'TALLAS XL' },
  { label: 'Tallas XXL', filter: 'TALLAS XXL' },
  {
    label: 'Conjuntos',
    filter: 'CONJUNTOS',
    children: [
      { label: 'M', filter: 'CONJUNTOS M' },
      { label: 'L', filter: 'CONJUNTOS L' },
      { label: 'XL', filter: 'CONJUNTOS XL' },
      { label: 'XXL', filter: 'CONJUNTOS XXL' },
    ],
  },
  { label: 'Vestidos', filter: 'VESTIDOS' },
];
