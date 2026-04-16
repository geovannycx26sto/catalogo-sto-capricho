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

export type Category = 'TALLAS M' | 'TALLAS L' | 'TALLAS XL' | 'TALLAS XXL' | 'REFERENCIAS' | 'OTROS';

export const CATEGORIES: Category[] = [
  'REFERENCIAS',
  'TALLAS M',
  'TALLAS L',
  'TALLAS XL',
  'TALLAS XXL',
  'OTROS',
];
