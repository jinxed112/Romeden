-- Supprimer et recréer la table galerie avec la bonne structure
DROP TABLE IF EXISTS galerie CASCADE;

CREATE TABLE galerie (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  src TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('anniversaires', 'baby-showers', 'baptemes', 'gender-reveals', 'mariages')),
  title TEXT NOT NULL,
  alt TEXT DEFAULT '',
  dateAjout TIMESTAMPTZ DEFAULT NOW(),
  "order" INTEGER DEFAULT 0,
  isPortfolio BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_galerie_category ON galerie(category);
CREATE INDEX idx_galerie_order ON galerie("order");
CREATE INDEX idx_galerie_portfolio ON galerie(isPortfolio);
CREATE INDEX idx_galerie_date ON galerie(dateAjout DESC);

-- Fonction update timestamp
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

-- Images de test
INSERT INTO galerie (src, category, title, alt, "order", isPortfolio, tags) VALUES
('https://via.placeholder.com/800x600/FF69B4/FFFFFF?text=Demo+Anniversaire', 'anniversaires', 'Anniversaire Magique', 'Décoration anniversaire licorne', 1, TRUE, ARRAY['premium', 'tendance']),
('https://via.placeholder.com/800x600/87CEEB/FFFFFF?text=Demo+BabyShower', 'baby-showers', 'Baby Shower Douceur', 'Décoration baby shower rose', 2, TRUE, ARRAY['pastel', 'douceur']),
('https://via.placeholder.com/800x600/F0F8FF/000000?text=Demo+Bapteme', 'baptemes', 'Baptême Élégant', 'Décoration baptême ange', 3, FALSE, ARRAY['élégant', 'spirituel']);
