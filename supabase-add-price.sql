-- ============================================
-- Agregar columna 'price' a la tabla products
-- Ejecutar en Supabase > SQL Editor
-- ============================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS price TEXT DEFAULT '';
