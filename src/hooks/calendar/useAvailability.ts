import { useState, useCallback, useEffect, useMemo } from 'react';
import { DisponibiliteJour } from '../../utils/types';
import { dateToString } from '../../utils/calendar/calendarUtils';

// Import du service Supabase
import {
  loadDisponibilites,
  setAvailabilityForDate,
  removeCustomAvailability,
  getAvailabilityForDate,
  getDateStatus,
  isDateAvailableForBooking,
  blockDateRange,
  unblockDateRange,
  getAvailabilityForMonth,
  setMultipleDatesAvailable
} from '../../services/availabilityService';

export const useAvailability = () => {
  const [disponibilites, setDisponibilites] = useState<DisponibiliteJour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Chargement initial - SUPABASE
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('📊 Chargement disponibilités depuis Supabase...');
        
        const data = await loadDisponibilites();
        console.log('✅ Chargé', data.length, 'disponibilités');
        setDisponibilites(data);
        
      } catch (error) {
        console.error('❌ Erreur chargement disponibilités:', error);
        setDisponibilites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [updateTrigger]);

  // Force le rechargement des données
  const forceReload = useCallback(() => {
    console.log('🔄 Force rechargement...');
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Définir disponibilité d'une date
  const setDateAvailability = useCallback(async (date: Date, availability: Partial<DisponibiliteJour>) => {
    const dateStr = dateToString(date);
    
    console.log('💾 Sauvegarde disponibilité:', {
      date: dateStr,
      availability
    });
    
    try {
      const success = await setAvailabilityForDate(dateStr, availability);
      
      if (success) {
        console.log('✅ Sauvegarde réussie');
        forceReload();
        return true;
      } else {
        throw new Error('Échec sauvegarde Supabase');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur de sauvegarde. Vérifiez votre connexion.');
      return false;
    }
  }, [forceReload]);

  // Supprimer disponibilité personnalisée
  const removeCustomDateAvailability = useCallback(async (date: Date) => {
    const dateStr = dateToString(date);
    
    console.log('🗑️ Suppression disponibilité personnalisée:', dateStr);
    
    try {
      const success = await removeCustomAvailability(dateStr);
      
      if (success) {
        console.log('✅ Suppression réussie');
        forceReload();
        return true;
      } else {
        throw new Error('Échec suppression Supabase');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('❌ Erreur de suppression. Vérifiez votre connexion.');
      return false;
    }
  }, [forceReload]);

  // Bloquer une plage de dates
  const blockDates = useCallback(async (startDate: Date, endDate: Date, motif: string) => {
    const startStr = dateToString(startDate);
    const endStr = dateToString(endDate);
    
    try {
      const success = await blockDateRange(startStr, endStr, motif);
      if (success) {
        forceReload();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur blocage plage:', error);
      return false;
    }
  }, [forceReload]);

  // Débloquer une plage de dates
  const unblockDates = useCallback(async (startDate: Date, endDate: Date) => {
    const startStr = dateToString(startDate);
    const endStr = dateToString(endDate);
    
    try {
      const success = await unblockDateRange(startStr, endStr);
      if (success) {
        forceReload();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur déblocage plage:', error);
      return false;
    }
  }, [forceReload]);

  // Obtenir le statut d'une date (utilise le cache local d'abord)
  const getDateInfo = useCallback(async (date: Date) => {
    const dateStr = dateToString(date);
    const cached = disponibilites.find(d => d.date === dateStr);
    
    if (cached) {
      return {
        statut: cached.statut,
        majoration: cached.majoration,
        motif: cached.motif,
        isCustom: true
      };
    }
    
    return await getDateStatus(date);
  }, [disponibilites]);

  // Version synchrone du statut pour l'UI (utilise uniquement le cache)
  const getDateInfoSync = useCallback((date: Date) => {
    const dateStr = dateToString(date);
    const cached = disponibilites.find(d => d.date === dateStr);
    
    if (cached) {
      return {
        statut: cached.statut,
        majoration: cached.majoration,
        motif: cached.motif,
        isCustom: true
      };
    }
    
    return {
      statut: 'indisponible' as const,
      majoration: 0,
      motif: 'Non configuré par l\'admin',
      isCustom: false
    };
  }, [disponibilites]);

  // Vérifier si une date est disponible pour réservation
  const isAvailableForBooking = useCallback(async (date: Date) => {
    return await isDateAvailableForBooking(date);
  }, []);

  // Obtenir disponibilité spécifique d'une date
  const getCustomAvailability = useCallback(async (date: Date) => {
    const dateStr = dateToString(date);
    const cached = disponibilites.find(d => d.date === dateStr);
    if (cached) {
      return cached;
    }
    return await getAvailabilityForDate(dateStr);
  }, [disponibilites]);

  // Obtenir toutes les disponibilités d'un mois
  const getMonthAvailability = useCallback(async (year: number, month: number) => {
    return await getAvailabilityForMonth(year, month);
  }, []);

  // Statistiques du mois
  const getMonthStats = useCallback(async (year: number, month: number) => {
    const monthAvailability = await getAvailabilityForMonth(year, month);
    
    const stats = {
      totalDays: new Date(year, month + 1, 0).getDate(),
      availableDays: 0,
      blockedDays: 0,
      reservedDays: 0,
      customMajorations: 0
    };

    for (let day = 1; day <= stats.totalDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = dateToString(date);
      const dayData = monthAvailability.find((d: DisponibiliteJour) => d.date === dateStr);
      
      if (dayData) {
        switch (dayData.statut) {
          case 'disponible':
            stats.availableDays++;
            break;
          case 'bloque':
          case 'indisponible':
            stats.blockedDays++;
            break;
          case 'reserve':
            stats.reservedDays++;
            break;
        }
        
        if (dayData.majoration > 0) {
          stats.customMajorations++;
        }
      } else {
        stats.blockedDays++;
      }
    }

    return stats;
  }, []);

  // Helpers pour l'UI
  const hasCustomAvailability = useCallback((date: Date) => {
    const dateStr = dateToString(date);
    return disponibilites.some(d => d.date === dateStr);
  }, [disponibilites]);

  return {
    // État
    disponibilites,
    isLoading,

    // Actions CRUD
    setDateAvailability,
    removeCustomDateAvailability,
    blockDates,
    unblockDates,

    // Lecture
    getDateInfo,
    getDateInfoSync, // ⭐ NOUVEAU: version synchrone pour UI
    getCustomAvailability,
    getMonthAvailability,
    isAvailableForBooking,
    hasCustomAvailability,

    // Statistiques
    getMonthStats,

    // Utilitaires
    forceReload
  };
};
