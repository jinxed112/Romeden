import { useState, useCallback, useEffect, useMemo } from 'react';
import { EvenementCalendrier, PlanningStats, AlertePlanning } from '../../utils/types';
import { dateToString, getMonthNameFr } from '../../utils/calendar/calendarUtils';

const STORAGE_KEY_EVENEMENTS = 'romeden_evenements';

export const usePlanning = () => {
  const [evenements, setEvenements] = useState<EvenementCalendrier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial
  useEffect(() => {
    const loadEvenements = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_EVENEMENTS);
        const data = saved ? JSON.parse(saved) : [];
        setEvenements(data);
      } catch (error) {
        console.error('Erreur chargement événements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvenements();
  }, []);

  // Sauvegarde automatique
  const saveEvenements = useCallback((newEvenements: EvenementCalendrier[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENEMENTS, JSON.stringify(newEvenements));
      setEvenements(newEvenements);
    } catch (error) {
      console.error('Erreur sauvegarde événements:', error);
    }
  }, []);

  // Ajouter un événement
  const addEvenement = useCallback((evenement: Omit<EvenementCalendrier, 'id' | 'dateCreation'>) => {
    const newEvenement: EvenementCalendrier = {
      ...evenement,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dateCreation: new Date().toISOString()
    };

    const updated = [...evenements, newEvenement];
    saveEvenements(updated);
    return newEvenement;
  }, [evenements, saveEvenements]);

  // Modifier un événement
  const updateEvenement = useCallback((id: string, updates: Partial<EvenementCalendrier>) => {
    const updated = evenements.map(evt => 
      evt.id === id ? { ...evt, ...updates } : evt
    );
    saveEvenements(updated);
  }, [evenements, saveEvenements]);

  // Supprimer un événement
  const deleteEvenement = useCallback((id: string) => {
    const updated = evenements.filter(evt => evt.id !== id);
    saveEvenements(updated);
  }, [evenements, saveEvenements]);

  // Changer le statut d'un événement
  const changeEvenementStatus = useCallback((id: string, statut: EvenementCalendrier['statut']) => {
    updateEvenement(id, { statut });
  }, [updateEvenement]);

  // Obtenir événements d'une date
  const getEvenementsForDate = useCallback((date: Date) => {
    const dateStr = dateToString(date);
    return evenements.filter(evt => evt.dateEvenement === dateStr);
  }, [evenements]);

  // Obtenir événements d'un mois
  const getEvenementsForMonth = useCallback((year: number, month: number) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return evenements.filter(evt => evt.dateEvenement.startsWith(monthStr));
  }, [evenements]);

  // Obtenir prochains événements
  const getUpcomingEvenements = useCallback((limite: number = 5) => {
    const aujourd = dateToString(new Date());
    
    return evenements
      .filter(evt => evt.dateEvenement >= aujourd && evt.statut === 'confirme')
      .sort((a, b) => a.dateEvenement.localeCompare(b.dateEvenement))
      .slice(0, limite);
  }, [evenements]);

  // Obtenir événements récents
  const getRecentEvenements = useCallback((limite: number = 5) => {
    return evenements
      .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
      .slice(0, limite);
  }, [evenements]);

  // Calculer statistiques mensuelles
  const calculateMonthlyStats = useCallback((year: number, month: number): PlanningStats['moisEnCours'] => {
    const monthEvents = getEvenementsForMonth(year, month);
    const confirmedEvents = monthEvents.filter(evt => evt.statut === 'confirme');
    
    const chiffreAffaires = confirmedEvents.reduce((total, evt) => total + evt.montant, 0);
    const joursOccupes = new Set(confirmedEvents.map(evt => evt.dateEvenement)).size;
    const totalJoursMois = new Date(year, month + 1, 0).getDate();
    const tauxOccupation = Math.round((joursOccupes / totalJoursMois) * 100);

    return {
      evenementsConfirmes: confirmedEvents.length,
      chiffreAffaires,
      joursOccupes,
      tauxOccupation
    };
  }, [getEvenementsForMonth]);

  // Générer alertes
  const generateAlertes = useCallback((): AlertePlanning[] => {
    const alertes: AlertePlanning[] = [];
    const aujourd = new Date();
    const dansTroisJours = new Date(aujourd.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Nouveaux devis en attente
    const devisEnAttente = evenements.filter(evt => evt.statut === 'devis').length;
    if (devisEnAttente > 0) {
      alertes.push({
        id: 'devis-attente',
        type: 'nouveau_devis',
        message: `${devisEnAttente} devis en attente de confirmation`,
        date: dateToString(aujourd),
        priorite: 'normale',
        action: 'Voir les devis'
      });
    }

    // Événements dans 3 jours
    const prochainementConfirmes = evenements.filter(evt => {
      const dateEvt = new Date(evt.dateEvenement);
      return evt.statut === 'confirme' && 
             dateEvt >= aujourd && 
             dateEvt <= dansTroisJours;
    });

    prochainementConfirmes.forEach(evt => {
      alertes.push({
        id: `rappel-${evt.id}`,
        type: 'rappel',
        message: `Événement "${evt.titre}" dans 3 jours`,
        date: evt.dateEvenement,
        priorite: 'haute',
        action: 'Voir détails'
      });
    });

    // Conflits potentiels (même date, plusieurs événements)
    const eventsByDate = evenements
      .filter(evt => evt.statut === 'confirme')
      .reduce((acc, evt) => {
        if (!acc[evt.dateEvenement]) acc[evt.dateEvenement] = [];
        acc[evt.dateEvenement].push(evt);
        return acc;
      }, {} as Record<string, EvenementCalendrier[]>);

    Object.entries(eventsByDate).forEach(([date, events]) => {
      if (events.length > 1) {
        alertes.push({
          id: `conflit-${date}`,
          type: 'conflit',
          message: `Conflit potentiel : ${events.length} événements le ${new Date(date).toLocaleDateString('fr-FR')}`,
          date,
          priorite: 'haute',
          action: 'Résoudre conflit'
        });
      }
    });

    return alertes;
  }, [evenements]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const total = evenements.length;
    const confirmes = evenements.filter(evt => evt.statut === 'confirme').length;
    const devis = evenements.filter(evt => evt.statut === 'devis').length;
    const termines = evenements.filter(evt => evt.statut === 'termine').length;
    const chiffreAffairesTotal = evenements
      .filter(evt => evt.statut === 'confirme' || evt.statut === 'termine')
      .reduce((total, evt) => total + evt.montant, 0);

    return {
      total,
      confirmes,
      devis,
      termines,
      chiffreAffairesTotal
    };
  }, [evenements]);

  // Helpers pour l'UI
  const hasEvenementOnDate = useCallback((date: Date) => {
    return getEvenementsForDate(date).length > 0;
  }, [getEvenementsForDate]);

  const getEvenementById = useCallback((id: string) => {
    return evenements.find(evt => evt.id === id);
  }, [evenements]);

  return {
    // État
    evenements,
    isLoading,
    globalStats,

    // Actions CRUD
    addEvenement,
    updateEvenement,
    deleteEvenement,
    changeEvenementStatus,

    // Lecture
    getEvenementsForDate,
    getEvenementsForMonth,
    getUpcomingEvenements,
    getRecentEvenements,
    getEvenementById,

    // Statistiques
    calculateMonthlyStats,
    generateAlertes,

    // Helpers
    hasEvenementOnDate
  };
};
