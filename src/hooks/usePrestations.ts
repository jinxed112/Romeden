import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

// Interface pour le type de prestation complète
interface PrestationComplete {
  id: string;
  nom: string;
  description: string;
  prixBase: number;
  categorie: string;
  active: boolean;
  image: string;
  couleurTheme: string;
  options: {
    id: string;
    nom: string;
    description: string;
    prix: number;
  }[];
}

export const usePrestations = () => {
  const [prestations, setPrestations] = useState<PrestationComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement des prestations AVEC leurs options
  const loadPrestations = async () => {
    setLoading(true);
    try {
      // Charger prestations
      const { data: prestationsData, error: prestationsError } = await supabase
        .from('prestations')
        .select('*')
        .order('nom');

      if (prestationsError) throw prestationsError;

      // Charger toutes les options
      const { data: optionsData, error: optionsError } = await supabase
        .from('options_prestations')
        .select('*')
        .order('nom');

      if (optionsError) throw optionsError;

      // Combiner prestations avec leurs options
      const prestationsWithOptions: PrestationComplete[] = (prestationsData || []).map((p: any) => ({
        id: p.id,
        nom: p.nom,
        description: p.description,
        prixBase: p.prix_base,
        categorie: p.categorie,
        active: p.active,
        image: "",
        couleurTheme: p.couleur_theme || 'from-rose-200 to-pink-200',
        options: (optionsData || [])
          .filter((opt: any) => opt.prestation_id === p.id)
          .map((opt: any) => ({
            id: opt.id,
            nom: opt.nom,
            description: opt.description,
            prix: opt.prix
          }))
      }));

      setPrestations(prestationsWithOptions);
      console.log(`✅ ${prestationsWithOptions.length} prestations chargées avec options`);
    } catch (err: any) {
      console.error('❌ Erreur chargement:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPORTANT: useEffect avec tableau de dépendances vide pour éviter les boucles infinies
  useEffect(() => {
    loadPrestations();
  }, []); // Tableau vide = chargement une seule fois au montage

  const addPrestation = async (prestation: any) => {
    try {
      const { data, error } = await supabase
        .from('prestations')
        .insert([{
          nom: prestation.nom,
          description: prestation.description,
          prix_base: prestation.prixBase,
          categorie: prestation.categorie,
          active: prestation.active,
          couleur_theme: prestation.couleurTheme || 'from-rose-200 to-pink-200'
        }])
        .select()
        .single();

      if (error) throw error;

      const converted: PrestationComplete = {
        id: data.id,
        nom: data.nom,
        description: data.description,
        prixBase: data.prix_base,
        categorie: data.categorie,
        active: data.active,
        image: "",
        couleurTheme: data.couleur_theme,
        options: []
      };

      setPrestations(prev => [...prev, converted]);
      console.log('✅ Prestation ajoutée:', data.nom);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur ajout:', err);
      setError(err.message);
      return null;
    }
  };

  // ✅ NOUVELLE FONCTION : Ajouter une option à une prestation
  const addOption = async (prestationId: string, option: { nom: string; description: string; prix: number }) => {
    try {
      const { data, error } = await supabase
        .from('options_prestations')
        .insert([{
          prestation_id: prestationId,
          nom: option.nom,
          description: option.description,
          prix: option.prix
        }])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le state local
      setPrestations(prev => prev.map(p => 
        p.id === prestationId 
          ? {
              ...p,
              options: [...p.options, {
                id: data.id,
                nom: data.nom,
                description: data.description,
                prix: data.prix
              }]
            }
          : p
      ));

      console.log('✅ Option ajoutée:', data.nom);
      return data;
    } catch (err: any) {
      console.error('❌ Erreur ajout option:', err);
      setError(err.message);
      return null;
    }
  };

  // ✅ NOUVELLE FONCTION : Supprimer une option
  const deleteOption = async (prestationId: string, optionId: string) => {
    try {
      const { error } = await supabase
        .from('options_prestations')
        .delete()
        .eq('id', optionId);

      if (error) throw error;

      // Mettre à jour le state local
      setPrestations(prev => prev.map(p => 
        p.id === prestationId 
          ? { ...p, options: p.options.filter(opt => opt.id !== optionId) }
          : p
      ));

      console.log('✅ Option supprimée:', optionId);
    } catch (err: any) {
      console.error('❌ Erreur suppression option:', err);
      setError(err.message);
    }
  };

  const deletePrestation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prestations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPrestations(prev => prev.filter(p => p.id !== id));
      console.log('✅ Prestation supprimée:', id);
    } catch (err: any) {
      console.error('❌ Erreur suppression:', err);
      setError(err.message);
    }
  };

  const toggleActive = async (id: string) => {
    const prestation = prestations.find(p => p.id === id);
    if (!prestation) return;

    try {
      const { error } = await supabase
        .from('prestations')
        .update({ active: !prestation.active })
        .eq('id', id);

      if (error) throw error;

      setPrestations(prev => prev.map(p => 
        p.id === id ? { ...p, active: !p.active } : p
      ));
      console.log('✅ Toggle prestation:', id);
    } catch (err: any) {
      console.error('❌ Erreur toggle:', err);
      setError(err.message);
    }
  };

  return {
    prestations,
    loading,
    error,
    addPrestation,
    addOption, // ✅ NOUVELLE FONCTION
    deleteOption, // ✅ NOUVELLE FONCTION
    updatePrestation: async () => console.log('Update à implémenter'),
    deletePrestation,
    toggleActive,
    getPrestationsActives: () => prestations.filter(p => p.active),
    getPrestationsByCategory: (category: string) => prestations.filter(p => p.categorie === category && p.active),
    getPrestationById: (id: string) => prestations.find(p => p.id === id),
    refresh: loadPrestations
  };
};