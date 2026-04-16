import { supabase } from './supabase';
import { Product, Category } from '@/types';

// ============================================================
// Supabase Cloud Store
// Table: products
// Storage Bucket: catalog-images (public)
// ============================================================

interface DBProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: string | null;
  image_url: string;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
}

function toProduct(row: DBProduct): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.category as Category,
    tags: row.tags || [],
    price: row.price || '',
    imageData: row.image_url,
    thumbnailData: row.thumbnail_url,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

// ---------- Upload image to Supabase Storage ----------
async function uploadImage(
  base64: string,
  folder: string,
  filename: string
): Promise<string> {
  // Convert base64 to blob
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const ext = mime.includes('png') ? 'png' : 'jpg';
  const bstr = atob(parts[1]);
  const arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    arr[i] = bstr.charCodeAt(i);
  }
  const blob = new Blob([arr], { type: mime });

  const path = `${folder}/${filename}.${ext}`;

  const { error } = await supabase.storage
    .from('catalog-images')
    .upload(path, blob, {
      contentType: mime,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('catalog-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

async function deleteImage(url: string) {
  // Extract path from URL: .../catalog-images/full/xxx.jpg
  const match = url.match(/catalog-images\/(.+)$/);
  if (match) {
    await supabase.storage.from('catalog-images').remove([match[1]]);
  }
}

// ---------- CRUD Operations ----------

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(toProduct);
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(toProduct);
}

export async function addProduct(product: Product): Promise<void> {
  // Upload images to storage
  const imageUrl = await uploadImage(product.imageData, 'full', product.id);
  const thumbUrl = await uploadImage(product.thumbnailData, 'thumbs', product.id);

  const { error } = await supabase.from('products').insert({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    tags: product.tags,
    price: product.price || '',
    image_url: imageUrl,
    thumbnail_url: thumbUrl,
    created_at: new Date(product.createdAt).toISOString(),
    updated_at: new Date(product.updatedAt).toISOString(),
  });

  if (error) throw error;
}

export async function addProducts(products: Product[]): Promise<void> {
  // Upload all images in parallel (batches of 3)
  const rows: any[] = [];

  for (let i = 0; i < products.length; i += 3) {
    const batch = products.slice(i, i + 3);
    const results = await Promise.all(
      batch.map(async (product) => {
        const [imageUrl, thumbUrl] = await Promise.all([
          uploadImage(product.imageData, 'full', product.id),
          uploadImage(product.thumbnailData, 'thumbs', product.id),
        ]);
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          tags: product.tags,
          price: product.price || '',
          image_url: imageUrl,
          thumbnail_url: thumbUrl,
          created_at: new Date(product.createdAt).toISOString(),
          updated_at: new Date(product.updatedAt).toISOString(),
        };
      })
    );
    rows.push(...results);
  }

  const { error } = await supabase.from('products').insert(rows);
  if (error) throw error;
}

export async function updateProduct(product: Product): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      name: product.name,
      description: product.description,
      category: product.category,
      tags: product.tags,
      price: product.price || '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', product.id);

  if (error) throw error;
}

export async function updateProductPrice(id: string, price: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ price, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function updateProductName(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  // Get image URLs first to delete from storage
  const { data } = await supabase
    .from('products')
    .select('image_url, thumbnail_url')
    .eq('id', id)
    .single();

  if (data) {
    await Promise.all([
      deleteImage(data.image_url),
      deleteImage(data.thumbnail_url),
    ]);
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  // Fetch all image urls for bulk storage removal
  const { data } = await supabase
    .from('products')
    .select('image_url, thumbnail_url')
    .in('id', ids);

  if (data && data.length > 0) {
    const paths: string[] = [];
    for (const row of data) {
      for (const url of [row.image_url, row.thumbnail_url]) {
        const match = url?.match(/catalog-images\/(.+)$/);
        if (match) paths.push(match[1]);
      }
    }
    if (paths.length > 0) {
      await supabase.storage.from('catalog-images').remove(paths);
    }
  }

  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) throw error;
}

export async function moveProduct(id: string, newCategory: Category): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      category: newCategory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function searchProducts(query: string): Promise<Product[]> {
  // Supabase doesn't have great full-text search on free tier,
  // so we fetch all and filter client-side
  const products = await getAllProducts();
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}
