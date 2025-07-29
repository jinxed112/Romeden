import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface GalleryImage {
  id: string;
  src: string;
  category: 'anniversaires' | 'baby-showers' | 'baptemes' | 'gender-reveals' | 'mariages';
  title: string;
  alt: string;
  date_ajout: string;
  order_num: number;
  is_portfolio: boolean;
  tags: string[];
  filename?: string;
}

export const useGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('galerie')
        .select('*')
        .order('order_num', { ascending: true })
        .order('date_ajout', { ascending: false });

      if (error) {
        console.error('Erreur chargement galerie:', error);
        setError(error.message);
        return;
      }

      console.log('📸 Images chargées:', data?.length);
      setImages(data || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('galerie')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('galerie')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Erreur upload:', err);
      return null;
    }
  }, []);

  const addImage = useCallback(async (imageData: Omit<GalleryImage, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('galerie')
        .insert([imageData])
        .select()
        .single();

      if (error) {
        console.error('Erreur ajout image:', error);
        return null;
      }

      await loadImages();
      return data;
    } catch (err) {
      console.error('Erreur:', err);
      return null;
    }
  }, [loadImages]);

  const updateImage = useCallback(async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const { error } = await supabase
        .from('galerie')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Erreur mise à jour:', error);
        return false;
      }

      await loadImages();
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      return false;
    }
  }, [loadImages]);

  const deleteImage = useCallback(async (id: string, filename?: string) => {
    try {
      if (filename) {
        const { error: storageError } = await supabase.storage
          .from('galerie')
          .remove([filename]);
        
        if (storageError) {
          console.warn('Erreur suppression storage:', storageError);
        }
      }

      const { error } = await supabase
        .from('galerie')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur suppression:', error);
        return false;
      }

      await loadImages();
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      return false;
    }
  }, [loadImages]);

  const togglePortfolio = useCallback(async (id: string, currentStatus: boolean) => {
    return updateImage(id, { is_portfolio: !currentStatus });
  }, [updateImage]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const getImagesByCategory = useCallback((category: string) => {
    if (category === 'tous') return images;
    return images.filter(img => img.category === category);
  }, [images]);

  const getPortfolioImages = useCallback(() => {
    return images.filter(img => img.is_portfolio).sort((a, b) => a.order_num - b.order_num);
  }, [images]);

  const stats = {
    total: images.length,
    portfolio: images.filter(img => img.is_portfolio).length,
    byCategory: {
      anniversaires: images.filter(img => img.category === 'anniversaires').length,
      'baby-showers': images.filter(img => img.category === 'baby-showers').length,
      baptemes: images.filter(img => img.category === 'baptemes').length,
      'gender-reveals': images.filter(img => img.category === 'gender-reveals').length,
      mariages: images.filter(img => img.category === 'mariages').length,
    }
  };

  return {
    images,
    loading,
    error,
    stats,
    loadImages,
    uploadImage,
    addImage,
    updateImage,
    deleteImage,
    togglePortfolio,
    getImagesByCategory,
    getPortfolioImages
  };
};
