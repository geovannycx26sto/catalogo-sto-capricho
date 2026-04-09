export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  tags: string[];
  imageData: string; // base64
  thumbnailData: string; // compressed base64 for grid
  createdAt: number;
  updatedAt: number;
}

export type Category = 'TALLAS M' | 'TALLAS L' | 'TALLAS XL' | 'TALLAS XXL' | 'REFERENCIAS' | 'OTROS';

export const CATEGORIES: Category[] = [
  'TALLAS M',
  'TALLAS L',
  'TALLAS XL',
  'TALLAS XXL',
  'REFERENCIAS',
  'OTROS',
];
