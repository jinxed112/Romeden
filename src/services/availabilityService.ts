import { supabase } from '../utils/supabaseClient';
import { DisponibiliteJour, ParametresCalendrier } from '../utils/types';
import { isJourFerie } from '../utils/calendar/holidaysData';
import { isWeekend, dateToString, stringToDate } from '../utils/calendar/calendarUtils';

const STORAGE_KEY_SETTINGS = 'romeden_calendar_settings';

export const getDefaultSettings = (): ParametresCalendrier => ({
  joursFerrmeture: [],
  majorationWeekend: 20,
  majorationFerie: 30,
  delaiReservationMin: 2,
  notificationsEmail: true,
  heuresOuverture: {
    debut: '09:00',
    fin: '18:00'
  }
});

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

export const saveCalendarSettings = (settings: ParametresCalendrier): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Erreur sauvegarde paramètres calendrier:', error);
  }
};

export const loadDisponibilites = async (): Promise<DisponibiliteJour[]> => {
  try {
    const { data, error } = await supabase
      .from('disponibilites')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return [];
    }

    const disponibilites: DisponibiliteJour[] = (data || []).map(row => ({
      date: row.date,
      statut: row.statut as DisponibiliteJour['statut'],
      majoration: parseFloat(row.majoration) || 0,
      motif: row.motif || undefined
    }));

    return disponibilites;
  } catch (error) {
    console.error('❌ Erreur chargement disponibilités:', error);
    return [];
  }
};

export const saveDisponibilite = async (disponibilite: DisponibiliteJour): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('disponibilites')
      .upsert({
        date: disponibilite.date,
        statut: disponibilite.statut,
        majoration: disponibilite.majoration,
        motif: disponibilite.motif || null
      }, {
        onConflict: 'date'
      });

    return !error;
  } catch (error) {
    console.error('❌ Erreur sauvegarde disponibilité:', error);
    return false;
  }
};

export const deleteDisponibilite = async (date: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('disponibilites')
      .delete()
      .eq('date', date);
    return !error;
  } catch (error) {
    return false;
  }
};

export const getAvailabilityForDate = async (date: string): Promise<DisponibiliteJour | null> => {
  try {
    const { data, error } = await supabase
      .from('disponibilites')
      .select('*')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      return null;
    }

    if (!data) return null;

    return {
      date: data.date,
      statut: data.statut as DisponibiliteJour['statut'],
      majoration: parseFloat(data.majoration) || 0,
      motif: data.motif || undefined
    };
  } catch (error) {
    return null;
  }
};

export const setAvailabilityForDate = async (date: string, availability: Partial<DisponibiliteJour>): Promise<boolean> => {
  const newAvailability: DisponibiliteJour = {
    date,
    statut: 'indisponible',
    majoration: 0,
    ...availability
  };
  return await saveDisponibilite(newAvailability);
};

export const removeCustomAvailability = async (date: string): Promise<boolean> => {
  return await deleteDisponibilite(date);
};

export const getAvailabilityForMonth = async (year: number, month: number): Promise<DisponibiliteJour[]> => {
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('disponibilites')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDateStr)
      .order('date');

    if (error) return [];

    return (data || []).map(row => ({
      date: row.date,
      statut: row.statut as DisponibiliteJour['statut'],
      majoration: parseFloat(row.majoration) || 0,
      motif: row.motif || undefined
    }));
  } catch (error) {
    return [];
  }
};

export const blockDateRange = async (startDate: string, endDate: string, motif: string): Promise<boolean> => {
  try {
    const start = stringToDate(startDate);
    const end = stringToDate(endDate);
    const datesToBlock: any[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      datesToBlock.push({
        date: dateToString(currentDate),
        statut: 'bloque',
        majoration: 0,
        motif
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const { error } = await supabase
      .from('disponibilites')
      .upsert(datesToBlock, { onConflict: 'date' });

    return !error;
  } catch (error) {
    return false;
  }
};

export const unblockDateRange = async (startDate: string, endDate: string): Promise<boolean> => {
  try {
    const start = stringToDate(startDate);
    const end = stringToDate(endDate);
    const datesToUnblock: string[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      datesToUnblock.push(dateToString(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const { error } = await supabase
      .from('disponibilites')
      .delete()
      .in('date', datesToUnblock);

    return !error;
  } catch (error) {
    return false;
  }
};

export const setMultipleDatesAvailable = async (dates: Date[], majoration?: number): Promise<boolean> => {
  try {
    const datesToSave = dates.map(date => {
      let defaultMajoration = 0;
      if (isJourFerie(date)) {
        defaultMajoration = 30;
      } else if (isWeekend(date)) {
        defaultMajoration = 20;
      }

      return {
        date: dateToString(date),
        statut: 'disponible',
        majoration: majoration !== undefined ? majoration : defaultMajoration,
        motif: majoration !== undefined ? 'Majoration personnalisée' : undefined
      };
    });

    const { error } = await supabase
      .from('disponibilites')
      .upsert(datesToSave, { onConflict: 'date' });

    return !error;
  } catch (error) {
    return false;
  }
};

export const getDateStatus = async (date: Date): Promise<{
  statut: DisponibiliteJour['statut'];
  majoration: number;
  motif?: string;
  isCustom: boolean;
}> => {
  const dateStr = dateToString(date);
  const customAvailability = await getAvailabilityForDate(dateStr);

  if (customAvailability) {
    return {
      statut: customAvailability.statut,
      majoration: customAvailability.majoration,
      motif: customAvailability.motif,
      isCustom: true
    };
  }

  return {
    statut: 'indisponible',
    majoration: 0,
    motif: 'Non configuré par l\'admin',
    isCustom: false
  };
};

export const isDateAvailableForBooking = async (date: Date): Promise<boolean> => {
  const status = await getDateStatus(date);
  const settings = loadCalendarSettings();

  if (status.statut !== 'disponible') {
    return false;
  }

  const today = new Date();
  const daysDifference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
  return daysDifference >= settings.delaiReservationMin;
};

export const getUnavailableDates = async (startDate: Date, endDate: Date): Promise<string[]> => {
  const unavailable: string[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const isAvailable = await isDateAvailableForBooking(currentDate);
    if (!isAvailable) {
      unavailable.push(dateToString(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return unavailable;
};
