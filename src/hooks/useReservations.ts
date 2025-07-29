import { useState, useCallback, useEffect } from 'react';
import { ReservationSupabase, loadReservations, createReservation, updateReservation, deleteReservation, changeReservationStatus, getReservationsByMonth, getReservationStats } from '../services/reservationService';

export const useReservations = () => {
  const [reservations, setReservations] = useState<ReservationSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // ================================
  // CHARGEMENT INITIAL - SUPABASE
  // ================================
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('📊 Chargement réservations depuis Supabase...');
        
        const data = await loadReservations();
        console.log('✅ Chargé', data.length, 'réservations');
        setReservations(data);
        
      } catch (error) {
        console.error('❌ Erreur chargement réservations:', error);
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [updateTrigger]);

  // Force le rechargement des données
  const forceReload = useCallback(() => {
    console.log('🔄 Force rechargement réservations...');
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // ================================
  // ACTIONS CRUD - SUPABASE
  // ================================

  // Créer une nouvelle réservation
  const createReservationAction = useCallback(async (reservationData: Omit<ReservationSupabase, 'id' | 'created_at'>) => {
    try {
      console.log('💾 Création nouvelle réservation:', reservationData);
      
      const newReservation = await createReservation(reservationData);
      
      if (newReservation) {
        console.log('✅ Réservation créée avec succès:', newReservation.id);
        forceReload();
        return newReservation;
      } else {
        throw new Error('Échec création réservation');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      alert('❌ Erreur de création. Vérifiez votre connexion.');
      return null;
    }
  }, [forceReload]);

  // Mettre à jour une réservation
  const updateReservationAction = useCallback(async (id: string, updates: Partial<ReservationSupabase>) => {
    try {
      console.log('🔄 Mise à jour réservation:', id, updates);
      
      const success = await updateReservation(id, updates);
      
      if (success) {
        console.log('✅ Réservation mise à jour');
        forceReload();
        return true;
      } else {
        throw new Error('Échec mise à jour');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      alert('❌ Erreur de mise à jour. Vérifiez votre connexion.');
      return false;
    }
  }, [forceReload]);

  // Supprimer une réservation
  const deleteReservationAction = useCallback(async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      return false;
    }

    try {
      console.log('🗑️ Suppression réservation:', id);
      
      const success = await deleteReservation(id);
      
      if (success) {
        console.log('✅ Réservation supprimée');
        forceReload();
        return true;
      } else {
        throw new Error('Échec suppression');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('❌ Erreur de suppression. Vérifiez votre connexion.');
      return false;
    }
  }, [forceReload]);

  // Changer le statut d'une réservation
  const changeStatusAction = useCallback(async (id: string, newStatus: ReservationSupabase['statut']) => {
    try {
      console.log('🎯 Changement statut:', id, '→', newStatus);
      
      const success = await changeReservationStatus(id, newStatus);
      
      if (success) {
        console.log('✅ Statut changé');
        forceReload();
        return true;
      } else {
        throw new Error('Échec changement statut');
      }
      
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      alert('❌ Erreur de changement de statut.');
      return false;
    }
  }, [forceReload]);

  // ================================
  // LECTURE - CACHE + SUPABASE
  // ================================

  // Obtenir une réservation par ID
  const getReservationById = useCallback((id: string) => {
    return reservations.find(r => r.id === id);
  }, [reservations]);

  // Obtenir les réservations par statut
  const getReservationsByStatus = useCallback((statut: ReservationSupabase['statut']) => {
    return reservations.filter(r => r.statut === statut);
  }, [reservations]);

  // Obtenir les réservations d'une date
  const getReservationsForDate = useCallback((date: string) => {
    return reservations.filter(r => r.date_evenement === date);
  }, [reservations]);

  // Obtenir les réservations d'un mois
  const getReservationsForMonth = useCallback(async (year: number, month: number) => {
    return await getReservationsByMonth(year, month);
  }, []);

  // ================================
  // STATISTIQUES
  // ================================

  // Statistiques rapides (cache local)
  const quickStats = useCallback(() => {
    const total = reservations.length;
    const en_attente = reservations.filter(r => r.statut === 'en_attente').length;
    const confirme = reservations.filter(r => r.statut === 'confirme').length;
    const refuse = reservations.filter(r => r.statut === 'refuse').length;
    const chiffre_affaires = reservations
      .filter(r => r.statut === 'confirme')
      .reduce((total, r) => total + r.montant, 0);

    return {
      total,
      en_attente,
      confirme,
      refuse,
      chiffre_affaires
    };
  }, [reservations]);

  // Statistiques complètes (Supabase)
  const getFullStats = useCallback(async () => {
    return await getReservationStats();
  }, []);

  // ================================
  // HELPERS POUR L'UI
  // ================================

  // Vérifier si une date a des réservations
  const hasReservationsOnDate = useCallback((date: string) => {
    return reservations.some(r => r.date_evenement === date);
  }, [reservations]);

  // Obtenir le nombre de réservations d'une date
  const getReservationCountForDate = useCallback((date: string) => {
    return reservations.filter(r => r.date_evenement === date).length;
  }, [reservations]);

  // Récentes réservations (5 dernières)
  const getRecentReservations = useCallback((limit: number = 5) => {
    return [...reservations]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }, [reservations]);

  return {
    // État
    reservations,
    isLoading,

    // Actions CRUD
    createReservation: createReservationAction,
    updateReservation: updateReservationAction,
    deleteReservation: deleteReservationAction,
    changeStatus: changeStatusAction,

    // Lecture
    getReservationById,
    getReservationsByStatus,
    getReservationsForDate,
    getReservationsForMonth,

    // Statistiques
    quickStats,
    getFullStats,

    // Helpers
    hasReservationsOnDate,
    getReservationCountForDate,
    getRecentReservations,

    // Utilitaires
    forceReload
  };
};
