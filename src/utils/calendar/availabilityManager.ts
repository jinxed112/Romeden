import { DisponibiliteJour, ParametresCalendrier } from '../types';
import { getMajorationDate } from '../devisCalculator';
import { isJourFerie } from './holidaysData';
import { isWeekend, dateToString, stringToDate } from './calendarUtils';

const STORAGE_KEY_DISPONIBILITES = 'romeden_disponibilites';
const STORAGE_KEY_SETTINGS = 'romeden_calendar_settings';

/**
 * Paramètres calendrier par défaut
 */
export const getDefaultSettings = (): ParametresCalendrier => ({
  joursFerrmeture: [], // Aucun jour fermé par défaut
  majorationWeekend: 20,
  majorationFerie: 30,
  delaiReservationMin: 2, // 2 jours minimum
  notificationsEmail: true,
  heuresOuverture: {
    debut: '09:00',
    fin: '18:00'
  }
});

/**
 * Charge les paramètres calendrier
 */
export const loadCalendarSettings = (): ParametresCalendrier => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      return { ...getDefaultSettings(), ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Erreur chargement paramètres calendrier:', error);
  }
  return getDefaultSettings();
};

/**
 * Sauvegarde les paramètres calendrier
 */
export const saveCalendarSettings = (settings: ParametresCalendrier): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Erreur sauvegarde paramètres calendrier:', error);
  }
};

/**
 * Charge les disponibilités depuis localStorage
 */
export const loadDisponibilites = (): DisponibiliteJour[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DISPONIBILITES);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn('Erreur chargement disponibilités:', error);
    return [];
  }
};

/**
 * Sauvegarde les disponibilités dans localStorage
 */
export const saveDisponibilites = (disponibilites: DisponibiliteJour[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_DISPONIBILITES, JSON.stringify(disponibilites));
    console.log('✅ Disponibilités sauvegardées:', disponibilites.length, 'éléments');
  } catch (error) {
    console.error('❌ Erreur sauvegarde disponibilités:', error);
  }
};

/**
 * Obtient la disponibilité d'une date spécifique
 */
export const getAvailabilityForDate = (date: string): DisponibiliteJour | null => {
  const disponibilites = loadDisponibilites();
  return disponibilites.find(d => d.date === date) || null;
};

/**
 * Définit la disponibilité d'une date
 */
export const setAvailabilityForDate = (date: string, availability: Partial<DisponibiliteJour>): void => {
  const disponibilites = loadDisponibilites();
  const existingIndex = disponibilites.findIndex(d => d.date === date);
  
  const newAvailability: DisponibiliteJour = {
    date,
    statut: 'indisponible', // ⭐ DÉFAUT CHANGÉ ICI
    majoration: 0,
    ...availability
  };
  
  console.log('💾 Sauvegarde disponibilité pour', date, ':', newAvailability);
  
  if (existingIndex >= 0) {
    disponibilites[existingIndex] = newAvailability;
  } else {
    disponibilites.push(newAvailability);
  }
  
  saveDisponibilites(disponibilites);
};

/**
 * Supprime la disponibilité personnalisée d'une date (retour aux règles par défaut)
 */
export const removeCustomAvailability = (date: string): void => {
  const disponibilites = loadDisponibilites();
  const filtered = disponibilites.filter(d => d.date !== date);
  console.log('🗑️ Suppression disponibilité personnalisée pour', date);
  saveDisponibilites(filtered);
};

/**
 * Obtient toutes les disponibilités d'un mois
 */
export const getAvailabilityForMonth = (year: number, month: number): DisponibiliteJour[] => {
  const disponibilites = loadDisponibilites();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  return disponibilites.filter(d => d.date.startsWith(monthStr));
};

/**
 * Bloque une plage de dates (congés, fermeture)
 */
export const blockDateRange = (startDate: string, endDate: string, motif: string): void => {
  const start = stringToDate(startDate);
  const end = stringToDate(endDate);
  const disponibilites = loadDisponibilites();
  
  let currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = dateToString(currentDate);
    const existingIndex = disponibilites.findIndex(d => d.date === dateStr);
    
    const blockedDay: DisponibiliteJour = {
      date: dateStr,
      statut: 'bloque',
      majoration: 0,
      motif
    };
    
    if (existingIndex >= 0) {
      disponibilites[existingIndex] = blockedDay;
    } else {
      disponibilites.push(blockedDay);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  saveDisponibilites(disponibilites);
};

/**
 * Débloque une plage de dates
 */
export const unblockDateRange = (startDate: string, endDate: string): void => {
  const start = stringToDate(startDate);
  const end = stringToDate(endDate);
  const disponibilites = loadDisponibilites();
  
  let currentDate = new Date(start);
  const datesToRemove: string[] = [];
  
  while (currentDate <= end) {
    datesToRemove.push(dateToString(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const filtered = disponibilites.filter(d => !datesToRemove.includes(d.date));
  saveDisponibilites(filtered);
};

/**
 * ⭐ LOGIQUE MODIFIÉE : PAR DÉFAUT INDISPONIBLE
 * Calcule le statut et la majoration d'une date selon les règles
 */
export const getDateStatus = (date: Date): {
  statut: DisponibiliteJour['statut'];
  majoration: number;
  motif?: string;
  isCustom: boolean;
} => {
  const dateStr = dateToString(date);
  const customAvailability = getAvailabilityForDate(dateStr);
  
  // Si disponibilité personnalisée définie
  if (customAvailability) {
    return {
      statut: customAvailability.statut,
      majoration: customAvailability.majoration,
      motif: customAvailability.motif,
      isCustom: true
    };
  }
  
  // ⭐ NOUVEAU : Par défaut, toutes les dates sont INDISPONIBLES
  // Mélissa doit explicitement rendre les dates disponibles
  return {
    statut: 'indisponible',
    majoration: 0,
    motif: 'Non configuré par l\'admin',
    isCustom: false
  };
};

/**
 * Vérifie si une date est disponible pour réservation
 */
export const isDateAvailableForBooking = (date: Date): boolean => {
  const status = getDateStatus(date);
  const settings = loadCalendarSettings();
  
  // Vérifier statut
  if (status.statut !== 'disponible') {
    return false;
  }
  
  // Vérifier délai minimum
  const today = new Date();
  const daysDifference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  return daysDifference >= settings.delaiReservationMin;
};

/**
 * Obtient toutes les dates indisponibles d'une période
 */
export const getUnavailableDates = (startDate: Date, endDate: Date): string[] => {
  const unavailable: string[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (!isDateAvailableForBooking(currentDate)) {
      unavailable.push(dateToString(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return unavailable;
};

/**
 * ⭐ NOUVELLE FONCTION : Rendre plusieurs dates disponibles rapidement
 */
export const setMultipleDatesAvailable = (dates: Date[], majoration?: number): void => {
  const disponibilites = loadDisponibilites();
  
  dates.forEach(date => {
    const dateStr = dateToString(date);
    const existingIndex = disponibilites.findIndex(d => d.date === dateStr);
    
    // Calculer majoration par défaut selon le jour
    let defaultMajoration = 0;
    if (isJourFerie(date)) {
      defaultMajoration = 30;
    } else if (isWeekend(date)) {
      defaultMajoration = 20;
    }
    
    const newAvailability: DisponibiliteJour = {
      date: dateStr,
      statut: 'disponible',
      majoration: majoration !== undefined ? majoration : defaultMajoration,
      motif: majoration !== undefined ? 'Majoration personnalisée' : undefined
    };
    
    if (existingIndex >= 0) {
      disponibilites[existingIndex] = newAvailability;
    } else {
      disponibilites.push(newAvailability);
    }
  });
  
  console.log('✅ Rendu disponible', dates.length, 'dates');
  saveDisponibilites(disponibilites);
};
