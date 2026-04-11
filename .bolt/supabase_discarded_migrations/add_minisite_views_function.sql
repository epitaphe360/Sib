-- Fonction pour incrémenter le compteur de vues d'un mini-site
CREATE OR REPLACE FUNCTION increment_minisite_views(p_exhibitor_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE mini_sites
  SET views = COALESCE(views, 0) + 1
  WHERE exhibitor_id = p_exhibitor_id;
END;
$$ LANGUAGE plpgsql;

-- Commentaire pour la documentation
COMMENT ON FUNCTION increment_minisite_views IS 'Incrémente le compteur de vues d''un mini-site';
