import { useCalendar } from './useCalendar';
import { useAvailability } from './useAvailability';
import { usePlanning } from './usePlanning';
import { useCalendarSettings } from './useCalendarSettings';

/**
 * Hook principal pour l'administration du calendrier
 * Combine tous les hooks calendrier en une interface unifiée
 */
export const useAdminCalendar = () => {
  const calendar = useCalendar();
  const availability = useAvailability();
  const planning = usePlanning();
  const settings = useCalendarSettings();

  // État de chargement global
  const isLoading = availability.isLoading || planning.isLoading || settings.isLoading;

  return {
    // Hooks individuels (pour accès granulaire si nécessaire)
    calendar,
    availability,
    planning,
    settings,

    // État global
    isLoading
  };
};

// Exports individuels pour utilisation séparée
export { useCalendar } from './useCalendar';
export { useAvailability } from './useAvailability';
export { usePlanning } from './usePlanning';
export { useCalendarSettings } from './useCalendarSettings';
