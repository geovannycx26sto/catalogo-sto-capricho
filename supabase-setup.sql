-- ============================================
-- EJECUTAR ESTO EN SUPABASE > SQL Editor
-- ============================================

-- 1. Crear tabla de productos
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Politica: TODOS pueden leer (para el catalogo publico)
CREATE POLICY "Lectura publica de productos"
  ON products FOR SELECT
  USING (true);

-- 4. Politica: TODOS pueden insertar (admin sin auth por simplicidad)
CREATE POLICY "Insertar productos"
  ON products FOR INSERT
  WITH CHECK (true);

-- 5. Politica: TODOS pueden actualizar
CREATE POLICY "Actualizar productos"
  ON products FOR UPDATE
  USING (true);

-- 6. Politica: TODOS pueden eliminar
CREATE POLICY "Eliminar productos"
  ON products FOR DELETE
  USING (true);

-- 7. Indice para busquedas por categoria
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
