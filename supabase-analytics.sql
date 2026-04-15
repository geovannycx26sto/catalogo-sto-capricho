-- ============================================
-- EJECUTAR ESTO EN SUPABASE > SQL Editor
-- (Tablas de analítica para el panel de administración)
-- ============================================

-- 1. Tabla de visitas al catálogo público
CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT,
  device TEXT,              -- mobile | tablet | desktop
  referrer TEXT,
  user_agent TEXT,
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC);

-- 2. Tabla de vistas de producto (cuando abren el modal)
CREATE TABLE IF NOT EXISTS product_views (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT,
  product_category TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at DESC);

-- 3. RLS: insertar público (cualquiera puede registrar su visita) y leer público
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insertar visitas" ON visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Leer visitas" ON visits FOR SELECT USING (true);

CREATE POLICY "Insertar vistas de producto" ON product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Leer vistas de producto" ON product_views FOR SELECT USING (true);
