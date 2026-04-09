import { openDB, IDBPDatabase } from 'idb';
import { Product, Category } from '@/types';

const DB_NAME = 'catalogo-ropa';
const DB_VERSION = 1;
const STORE_NAME = 'products';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('category', 'category');
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDB();
  const products = await db.getAll(STORE_NAME);
  return products.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const db = await getDB();
  const products = await db.getAllFromIndex(STORE_NAME, 'category', category);
  return products.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addProduct(product: Product): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, product);
}

export async function addProducts(products: Product[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const product of products) {
    await tx.store.put(product);
  }
  await tx.done;
}

export async function updateProduct(product: Product): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, { ...product, updatedAt: Date.now() });
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function moveProduct(id: string, newCategory: Category): Promise<void> {
  const db = await getDB();
  const product = await db.get(STORE_NAME, id);
  if (product) {
    product.category = newCategory;
    product.updatedAt = Date.now();
    await db.put(STORE_NAME, product);
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts();
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}
