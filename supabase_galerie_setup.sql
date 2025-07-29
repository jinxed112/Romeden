-- ===========================================
-- SETUP GALERIE SUPABASE - À EXÉCUTER DANS L'ÉDITEUR SQL
-- ===========================================

-- 1. CRÉATION TABLE GALERIE
CREATE TABLE galerie (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  src TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('anniversaires', 'baby-showers', 'baptemes', 'gender-reveals', 'mariages')),
  title TEXT NOT NULL,
  alt TEXT,
  dateAjout TIMESTAMPTZ DEFAULT NOW(),
  "order" INTEGER DEFAULT 0,
  isPortfolio BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEX POUR PERFORMANCE
CREATE INDEX idx_galerie_category ON galerie(category);
CREATE INDEX idx_galerie_order ON galerie("order");
CREATE INDEX idx_galerie_portfolio ON galerie(isPortfolio);
CREATE INDEX idx_galerie_date ON galerie(dateAjout DESC);

-- 3. FONCTION UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_galerie_updated_at 
  BEFORE UPDATE ON galerie 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. DONNÉES DE TEST (OPTIONNEL)
INSERT INTO galerie (src, category, title, alt, "order", isPortfolio, tags) VALUES
('https://via.placeholder.com/800x600/FF69B4/FFFFFF?text=Demo+1', 'anniversaires', 'Anniversaire Licorne', 'Décoration anniversaire licorne', 1, TRUE, ARRAY['premium', 'tendance']),
('https://via.placeholder.com/800x600/87CEEB/FFFFFF?text=Demo+2', 'baby-showers', 'Baby Shower Rose', 'Décoration baby shower rose', 2, TRUE, ARRAY['pastel', 'douceur']),
('https://via.placeholder.com/800x600/F0F8FF/000000?text=Demo+3', 'baptemes', 'Baptême Ange', 'Décoration baptême ange', 3, FALSE, ARRAY['élégant', 'spirituel']);
