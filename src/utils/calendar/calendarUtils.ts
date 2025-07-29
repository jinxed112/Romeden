// Utilitaires calendrier pour RomEden Events

/**
 * Obtient tous les jours d'un mois avec informations complètes
 */
export const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const days = [];
  
  // Jours du mois précédent pour compléter la première semaine
  const startWeekDay = firstDay.getDay();
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const daysInPreviousMonth = new Date(previousYear, previousMonth + 1, 0).getDate();
  
  for (let i = startWeekDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(previousYear, previousMonth, daysInPreviousMonth - i),
      isCurrentMonth: false,
      isPrevious: true
    });
  }
  
  // Jours du mois courant
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
      isPrevious: false
    });
  }
  
  // Jours du mois suivant pour compléter la dernière semaine
  const remainingDays = 42 - days.length; // 6 semaines × 7 jours
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(nextYear, nextMonth, day),
      isCurrentMonth: false,
      isPrevious: false
    });
  }
  
  return days;
};

/**
 * Vérifie si une date est un weekend
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Dimanche ou Samedi
};

/**
 * Formate une date en français
 */
export const formatDateFr = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formate une date courte
 */
export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('fr-FR');
};

/**
 * Convertit Date en string YYYY-MM-DD
 */
export const dateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Convertit string YYYY-MM-DD en Date
 */
export const stringToDate = (dateString: string): Date => {
  return new Date(dateString + 'T12:00:00'); // Midi pour éviter problèmes timezone
};

/**
 * Vérifie si deux dates sont le même jour
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return dateToString(date1) === dateToString(date2);
};

/**
 * Ajoute des jours à une date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Obtient le premier jour du mois
 */
export const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtient le dernier jour du mois
 */
export const getLastDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Calcule la différence en jours entre deux dates
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDiff = date2.getTime() - date1.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Génère une plage de dates
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

/**
 * Obtient le nom du mois en français
 */
export const getMonthNameFr = (monthIndex: number): string => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex];
};

/**
 * Obtient le nom du jour en français
 */
export const getDayNameFr = (dayIndex: number): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayIndex];
};

/**
 * Vérifie si une date est dans le passé
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Vérifie si une date est dans le futur
 */
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
};

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};
