import { Devis, DevisItem, Prestation, Option } from './types';
import { getPrestationById, getOptionById } from './prestationsData';

// Calcul des majorations de date
export const getMajorationDate = (date: Date): number => {
  const jour = date.getDay(); // 0 = dimanche, 6 = samedi
  const joursFeries2025 = [
    '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', 
    '2025-05-29', '2025-06-09', '2025-07-14', '2025-08-15',
    '2025-11-01', '2025-11-11', '2025-12-25'
  ];
  
  const dateString = date.toISOString().split('T')[0];
  
  // Jours fériés : +30%
  if (joursFeries2025.includes(dateString)) {
    return 30;
  }
  
  // Weekend (samedi/dimanche) : +20%
  if (jour === 0 || jour === 6) {
    return 20;
  }
  
  // Jours normaux : 0%
  return 0;
};

// Calcul sous-total d'un item (prestation + options)
export const calculerSousTotalItem = (item: DevisItem): number => {
  const prestation = getPrestationById(item.prestationId);
  if (!prestation) return 0;
  
  // Prix de base * quantité
  let sousTotal = prestation.prixBase * item.quantite;
  
  // Ajouter les options sélectionnées
  item.optionsSelectionnees.forEach(optionId => {
    const option = getOptionById(optionId);
    if (option) {
      sousTotal += option.prix * item.quantite;
    }
  });
  
  return sousTotal;
};

// Calcul du devis complet
export const calculerDevis = (items: DevisItem[], dateEvenement: Date | null): Devis => {
  // Calcul du sous-total (sans majoration date)
  const sousTotal = items.reduce((total, item) => {
    return total + calculerSousTotalItem(item);
  }, 0);
  
  // Calcul majoration date
  let majorationDate = 0;
  let majorationMontant = 0;
  
  if (dateEvenement) {
    majorationDate = getMajorationDate(dateEvenement);
    majorationMontant = (sousTotal * majorationDate) / 100;
  }
  
  // Total final
  const total = sousTotal + majorationMontant;
  
  return {
    items,
    dateEvenement,
    majorationDate,
    sousTotal,
    majorationMontant,
    total
  };
};

// Ajouter un item au devis
export const ajouterItemDevis = (items: DevisItem[], prestationId: string): DevisItem[] => {
  const itemExistant = items.find(item => item.prestationId === prestationId);
  
  if (itemExistant) {
    // Augmenter la quantité si déjà présent
    return items.map(item => 
      item.prestationId === prestationId 
        ? { 
            ...item, 
            quantite: item.quantite + 1,
            sousTotal: calculerSousTotalItem({ ...item, quantite: item.quantite + 1 })
          }
        : item
    );
  } else {
    // Ajouter nouvel item
    const nouvelItem: DevisItem = {
      prestationId,
      quantite: 1,
      optionsSelectionnees: [],
      sousTotal: 0
    };
    nouvelItem.sousTotal = calculerSousTotalItem(nouvelItem);
    
    return [...items, nouvelItem];
  }
};

// Supprimer un item du devis
export const supprimerItemDevis = (items: DevisItem[], prestationId: string): DevisItem[] => {
  return items.filter(item => item.prestationId !== prestationId);
};

// Modifier quantité d'un item
export const modifierQuantiteItem = (items: DevisItem[], prestationId: string, nouvelleQuantite: number): DevisItem[] => {
  if (nouvelleQuantite <= 0) {
    return supprimerItemDevis(items, prestationId);
  }
  
  return items.map(item => 
    item.prestationId === prestationId 
      ? { 
          ...item, 
          quantite: nouvelleQuantite,
          sousTotal: calculerSousTotalItem({ ...item, quantite: nouvelleQuantite })
        }
      : item
  );
};

// Ajouter/retirer une option à un item
export const toggleOptionItem = (items: DevisItem[], prestationId: string, optionId: string): DevisItem[] => {
  return items.map(item => {
    if (item.prestationId === prestationId) {
      const optionDejaSelectionnee = item.optionsSelectionnees.includes(optionId);
      const nouvellesOptions = optionDejaSelectionnee 
        ? item.optionsSelectionnees.filter(id => id !== optionId)
        : [...item.optionsSelectionnees, optionId];
      
      const itemModifie = { ...item, optionsSelectionnees: nouvellesOptions };
      itemModifie.sousTotal = calculerSousTotalItem(itemModifie);
      
      return itemModifie;
    }
    return item;
  });
};

// Vider le devis
export const viderDevis = (): DevisItem[] => {
  return [];
};

// Formatage prix en euros
export const formaterPrix = (prix: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(prix);
};

// Générer résumé textuel du devis (pour PDF/email)
export const genererResumeDevis = (devis: Devis): string => {
  let resume = "=== DEVIS ROMEDEN EVENTS ===\n\n";
  
  devis.items.forEach(item => {
    const prestation = getPrestationById(item.prestationId);
    if (prestation) {
      resume += `${prestation.nom} x${item.quantite} - ${formaterPrix(prestation.prixBase * item.quantite)}\n`;
      
      item.optionsSelectionnees.forEach(optionId => {
        const option = getOptionById(optionId);
        if (option) {
          resume += `  + ${option.nom} - ${formaterPrix(option.prix * item.quantite)}\n`;
        }
      });
      resume += "\n";
    }
  });
  
  resume += `Sous-total: ${formaterPrix(devis.sousTotal)}\n`;
  
  if (devis.majorationDate > 0) {
    resume += `Majoration date (+${devis.majorationDate}%): ${formaterPrix(devis.majorationMontant)}\n`;
  }
  
  resume += `TOTAL: ${formaterPrix(devis.total)}\n\n`;
  resume += "⚠️ ESTIMATION - Activité en phase test\n";
  resume += "Ce devis n'est pas contractuel.";
  
  return resume;
};
