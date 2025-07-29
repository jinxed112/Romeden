import { useState, useCallback, useEffect } from 'react';
import { DevisItem, Devis } from '../utils/types';
import { usePrestations } from './usePrestations';

export const useDevis = () => {
  const [items, setItems] = useState<DevisItem[]>([]);
  const [dateEvenement, setDateEvenement] = useState<Date | null>(null);
  
  // Hook pour récupérer les prestations depuis Supabase
  const { prestations } = usePrestations();

  // Fonction pour trouver une prestation par ID (depuis Supabase)
  const getPrestationById = useCallback((id: string) => {
    return prestations.find(p => p.id === id);
  }, [prestations]);

  // Fonction pour trouver une option par ID (depuis Supabase)
  const getOptionById = useCallback((optionId: string) => {
    // Les options sont dans prestation.options, pas dans une propriété séparée
    for (const prestation of prestations) {
      if (prestation.options) {
        const option = prestation.options.find((o: any) => o.id === optionId);
        if (option) return option;
      }
    }
    return undefined;
  }, [prestations]);

  // Calcul sous-total d'un item (avec données Supabase)
  const calculerSousTotalItem = useCallback((item: DevisItem): number => {
    const prestation = getPrestationById(item.prestationId);
    if (!prestation) {
      console.warn('🚨 Prestation non trouvée:', item.prestationId);
      return 0;
    }
    
    // Prix de base * quantité
    let sousTotal = prestation.prixBase * item.quantite;
    
    // Ajouter les options sélectionnées
    item.optionsSelectionnees.forEach(optionId => {
      const option = getOptionById(optionId);
      if (option) {
        sousTotal += option.prix * item.quantite;
      } else {
        console.warn('🚨 Option non trouvée:', optionId);
      }
    });
    
    console.log('💰 Calcul sous-total:', {
      prestationId: item.prestationId,
      prestationPrix: prestation.prixBase,
      quantite: item.quantite,
      options: item.optionsSelectionnees,
      sousTotal
    });
    
    return sousTotal;
  }, [getPrestationById, getOptionById]);

  // Recalculer les sous-totaux quand les prestations/options changent
  useEffect(() => {
    if (prestations.length > 0 && items.length > 0) {
      setItems(currentItems => 
        currentItems.map(item => ({
          ...item,
          sousTotal: calculerSousTotalItem(item)
        }))
      );
    }
  }, [prestations, calculerSousTotalItem]);

  // Réinitialiser le devis
  const reinitialiserDevis = useCallback(() => {
    setItems([]);
    setDateEvenement(null);
  }, []);

  // Ajouter un item
  const ajouterItem = useCallback((prestationId: string) => {
    const itemExistant = items.find(item => item.prestationId === prestationId);
    
    if (itemExistant) {
      // Augmenter la quantité
      setItems(currentItems =>
        currentItems.map(item => 
          item.prestationId === prestationId 
            ? { 
                ...item, 
                quantite: item.quantite + 1,
                sousTotal: calculerSousTotalItem({ ...item, quantite: item.quantite + 1 })
              }
            : item
        )
      );
    } else {
      // Créer nouvel item
      const nouvelItem: DevisItem = {
        prestationId,
        quantite: 1,
        optionsSelectionnees: [],
        sousTotal: 0
      };
      nouvelItem.sousTotal = calculerSousTotalItem(nouvelItem);
      
      console.log('➕ Ajout nouvel item:', nouvelItem);
      setItems(currentItems => [...currentItems, nouvelItem]);
    }
  }, [items, calculerSousTotalItem]);

  // Supprimer un item
  const supprimerItem = useCallback((prestationId: string) => {
    setItems(currentItems => currentItems.filter(item => item.prestationId !== prestationId));
  }, []);

  // Modifier quantité
  const modifierQuantite = useCallback((prestationId: string, nouvelleQuantite: number) => {
    if (nouvelleQuantite <= 0) {
      supprimerItem(prestationId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item => 
        item.prestationId === prestationId 
          ? { 
              ...item, 
              quantite: nouvelleQuantite,
              sousTotal: calculerSousTotalItem({ ...item, quantite: nouvelleQuantite })
            }
          : item
      )
    );
  }, [supprimerItem, calculerSousTotalItem]);

  // Toggle option
  const toggleOption = useCallback((prestationId: string, optionId: string) => {
    setItems(currentItems =>
      currentItems.map(item => {
        if (item.prestationId === prestationId) {
          const optionDejaSelectionnee = item.optionsSelectionnees.includes(optionId);
          const nouvellesOptions = optionDejaSelectionnee 
            ? item.optionsSelectionnees.filter(id => id !== optionId)
            : [...item.optionsSelectionnees, optionId];
          
          const itemModifie = { ...item, optionsSelectionnees: nouvellesOptions };
          itemModifie.sousTotal = calculerSousTotalItem(itemModifie);
          
          console.log('🔀 Toggle option:', {
            prestationId,
            optionId,
            nouvelleSélection: nouvellesOptions,
            nouveauSousTotal: itemModifie.sousTotal
          });
          
          return itemModifie;
        }
        return item;
      })
    );
  }, [calculerSousTotalItem]);

  // Changer date
  const changerDate = useCallback((date: Date | null) => {
    setDateEvenement(date);
  }, []);

  // Getters
  const getQuantiteItem = useCallback((prestationId: string): number => {
    const item = items.find(item => item.prestationId === prestationId);
    return item ? item.quantite : 0;
  }, [items]);

  const isOptionSelectionnee = useCallback((prestationId: string, optionId: string): boolean => {
    const item = items.find(item => item.prestationId === prestationId);
    return item ? item.optionsSelectionnees.includes(optionId) : false;
  }, [items]);

  const getSousTotalItem = useCallback((prestationId: string): number => {
    const item = items.find(item => item.prestationId === prestationId);
    const result = item ? item.sousTotal : 0;
    console.log('📊 getSousTotalItem:', { prestationId, result, item });
    return result;
  }, [items]);

  // Calcul du devis total
  const devis: Devis = {
    items,
    dateEvenement,
    majorationDate: 0, // À calculer selon la date
    sousTotal: items.reduce((total, item) => total + item.sousTotal, 0),
    majorationMontant: 0, // À calculer selon la date
    total: items.reduce((total, item) => total + item.sousTotal, 0)
  };

  // État du devis
  const estVide = items.length === 0;
  const nombreItems = items.length;
  const nombrePrestations = items.reduce((total, item) => total + item.quantite, 0);

  return {
    devis,
    items,
    dateEvenement,
    ajouterItem,
    supprimerItem,
    modifierQuantite,
    toggleOption,
    getQuantiteItem,
    isOptionSelectionnee,
    getSousTotalItem,
    changerDate,
    reinitialiserDevis,
    estVide,
    nombreItems,
    nombrePrestations
  };
};