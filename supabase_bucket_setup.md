# 📦 CONFIGURATION BUCKET SUPABASE STORAGE

## 1. Créer le bucket 'galerie'

Dans l'interface Supabase > Storage:

1. Cliquer sur "New bucket"
2. Nom: `galerie`
3. Cocher "Public bucket" ✅
4. Cliquer "Save"

## 2. Configurer les politiques (RLS)

Dans l'éditeur SQL de Supabase, exécuter:

```sql
-- Lecture publique des images
CREATE POLICY "Images publiques en lecture" ON storage.objects 
  FOR SELECT TO anon USING (bucket_id = 'galerie');

-- Upload pour utilisateurs authentifiés
CREATE POLICY "Upload pour admin" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'galerie');

-- Suppression pour utilisateurs authentifiés  
CREATE POLICY "Delete pour admin" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'galerie');
```

## 3. Vérification

✅ Bucket 'galerie' créé et public
✅ Politiques RLS configurées
✅ Table 'galerie' créée (via supabase_galerie_setup.sql)
✅ Hook useGallery installé
✅ GalleryView admin mis à jour

## 4. Test

1. Allez dans l'admin > Galerie
2. Uploadez une image de test
3. Vérifiez qu'elle apparaît dans le Storage
4. Marquez-la comme "Portfolio"
5. Vérifiez qu'elle apparaît dans le Hero

