-- ============================================
-- EJECUTAR EN SUPABASE > SQL Editor
-- Tabla de anuncio/bienvenida editable
-- ============================================

CREATE TABLE IF NOT EXISTS announcement (
  id TEXT PRIMARY KEY DEFAULT 'main',
  enabled BOOLEAN DEFAULT false,
  image_url TEXT DEFAULT '',
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  body TEXT DEFAULT '',
  cta_label TEXT DEFAULT '',
  cta_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserta la fila única si no existe
INSERT INTO announcement (id)
VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- RLS: lectura pública (los visitantes lo ven) e insert/update público (admin sin auth)
ALTER TABLE announcement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leer anuncio" ON announcement FOR SELECT USING (true);
CREATE POLICY "Actualizar anuncio" ON announcement FOR UPDATE USING (true);
CREATE POLICY "Insertar anuncio" ON announcement FOR INSERT WITH CHECK (true);
