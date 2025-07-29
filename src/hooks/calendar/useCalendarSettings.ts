import { useState, useCallback, useEffect } from 'react';
import { ParametresCalendrier } from '../../utils/types';
import {
  loadCalendarSettings,
  saveCalendarSettings,
  getDefaultSettings
} from '../../utils/calendar/availabilityManager';

export const useCalendarSettings = () => {
  const [settings, setSettings] = useState<ParametresCalendrier>(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Chargement initial
  useEffect(() => {
    const loadSettings = () => {
      try {
        const loadedSettings = loadCalendarSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
        setSettings(getDefaultSettings());
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Sauvegarder les paramètres
  const saveSettings = useCallback(async (newSettings: ParametresCalendrier) => {
    setIsSaving(true);
    try {
      saveCalendarSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Mettre à jour un paramètre spécifique
  const updateSetting = useCallback(<K extends keyof ParametresCalendrier>(
    key: K,
    value: ParametresCalendrier[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Réinitialiser aux paramètres par défaut
  const resetToDefaults = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    saveSettings(defaultSettings);
  }, [saveSettings]);

  // Helpers pour majorations
  const updateMajorationWeekend = useCallback((majoration: number) => {
    updateSetting('majorationWeekend', majoration);
  }, [updateSetting]);

  const updateMajorationFerie = useCallback((majoration: number) => {
    updateSetting('majorationFerie', majoration);
  }, [updateSetting]);

  // Helpers pour jours de fermeture
  const toggleJourFermeture = useCallback((jour: number) => {
    const joursActuels = settings.joursFerrmeture;
    const nouveauxJours = joursActuels.includes(jour)
      ? joursActuels.filter(j => j !== jour)
      : [...joursActuels, jour];
    
    updateSetting('joursFerrmeture', nouveauxJours);
  }, [settings.joursFerrmeture, updateSetting]);

  const setJoursFermeture = useCallback((jours: number[]) => {
    updateSetting('joursFerrmeture', jours);
  }, [updateSetting]);

  // Helpers pour heures d'ouverture
  const updateHeuresOuverture = useCallback((debut: string, fin: string) => {
    updateSetting('heuresOuverture', { debut, fin });
  }, [updateSetting]);

  // Helpers pour délai minimum
  const updateDelaiMinimum = useCallback((delai: number) => {
    updateSetting('delaiReservationMin', delai);
  }, [updateSetting]);

  // Helpers pour notifications
  const toggleNotifications = useCallback(() => {
    updateSetting('notificationsEmail', !settings.notificationsEmail);
  }, [settings.notificationsEmail, updateSetting]);

  // Validation des paramètres
  const validateSettings = useCallback((settingsToValidate: ParametresCalendrier): string[] => {
    const errors: string[] = [];

    if (settingsToValidate.majorationWeekend < 0 || settingsToValidate.majorationWeekend > 100) {
      errors.push('La majoration weekend doit être entre 0 et 100%');
    }

    if (settingsToValidate.majorationFerie < 0 || settingsToValidate.majorationFerie > 100) {
      errors.push('La majoration jour férié doit être entre 0 et 100%');
    }

    if (settingsToValidate.delaiReservationMin < 0 || settingsToValidate.delaiReservationMin > 30) {
      errors.push('Le délai minimum doit être entre 0 et 30 jours');
    }

    // Validation heures d'ouverture
    const heureDebut = settingsToValidate.heuresOuverture.debut;
    const heureFin = settingsToValidate.heuresOuverture.fin;
    
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(heureDebut)) {
      errors.push('Heure de début invalide (format HH:MM)');
    }
    
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(heureFin)) {
      errors.push('Heure de fin invalide (format HH:MM)');
    }
    
    if (heureDebut >= heureFin) {
      errors.push('L\'heure de fin doit être après l\'heure de début');
    }

    return errors;
  }, []);

  // Obtenir les noms des jours de fermeture
  const getJoursFermetureNames = useCallback(() => {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return settings.joursFerrmeture.map(jour => jours[jour]);
  }, [settings.joursFerrmeture]);

  return {
    // État
    settings,
    isLoading,
    isSaving,

    // Actions principales
    saveSettings,
    updateSetting,
    resetToDefaults,

    // Actions spécifiques
    updateMajorationWeekend,
    updateMajorationFerie,
    toggleJourFermeture,
    setJoursFermeture,
    updateHeuresOuverture,
    updateDelaiMinimum,
    toggleNotifications,

    // Validation
    validateSettings,

    // Helpers
    getJoursFermetureNames
  };
};
