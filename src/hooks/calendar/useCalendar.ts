import { useState, useCallback, useMemo } from 'react';
import { CalendarViewMode } from '../../utils/types';
import { 
  getMonthDays, 
  getMonthNameFr,
  addDays,
  getFirstDayOfMonth,
  getLastDayOfMonth
} from '../../utils/calendar/calendarUtils';

export const useCalendar = () => {
  // État principal du calendrier
  const [viewMode, setViewMode] = useState<CalendarViewMode>({
    type: 'mois',
    dateActive: new Date()
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculs dérivés du mois courant
  const currentMonth = useMemo(() => {
    const date = viewMode.dateActive;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    console.log('📅 Calcul mois courant:', { year, month, monthName: getMonthNameFr(month) });
    
    return {
      year,
      month,
      monthName: getMonthNameFr(month),
      firstDay: getFirstDayOfMonth(date),
      lastDay: getLastDayOfMonth(date),
      days: getMonthDays(year, month)
    };
  }, [viewMode.dateActive]);

  // Navigation dans le calendrier
  const navigateToMonth = useCallback((year: number, month: number) => {
    console.log('🗓️ Navigation vers:', { year, month });
    const newDate = new Date(year, month, 1);
    setViewMode(prev => ({
      ...prev,
      dateActive: newDate
    }));
  }, []);

  const goToPreviousMonth = useCallback(() => {
    console.log('⬅️ Mois précédent');
    setViewMode(prev => {
      const currentDate = prev.dateActive;
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      console.log('📅 Nouvelle date:', newDate);
      return {
        ...prev,
        dateActive: newDate
      };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    console.log('➡️ Mois suivant');
    setViewMode(prev => {
      const currentDate = prev.dateActive;
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      console.log('📅 Nouvelle date:', newDate);
      return {
        ...prev,
        dateActive: newDate
      };
    });
  }, []);

  const goToToday = useCallback(() => {
    console.log('🏠 Retour aujourd\'hui');
    const today = new Date();
    setViewMode(prev => ({
      ...prev,
      dateActive: new Date(today.getFullYear(), today.getMonth(), 1)
    }));
    setSelectedDate(today);
  }, []);

  // Changement de mode de vue
  const changeViewMode = useCallback((type: CalendarViewMode['type']) => {
    console.log('👁️ Changement vue:', type);
    setViewMode(prev => ({
      ...prev,
      type
    }));
  }, []);

  // Sélection de date
  const selectDate = useCallback((date: Date) => {
    console.log('📌 Sélection date:', date);
    setSelectedDate(date);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDate(null);
  }, []);

  // Helpers pour l'UI
  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === viewMode.dateActive.getMonth() && 
           date.getFullYear() === viewMode.dateActive.getFullYear();
  }, [viewMode.dateActive]);

  const isSelectedDate = useCallback((date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  }, [selectedDate]);

  // Navigation rapide
  const navigateToDate = useCallback((date: Date) => {
    setViewMode(prev => ({
      ...prev,
      dateActive: new Date(date.getFullYear(), date.getMonth(), 1)
    }));
    setSelectedDate(date);
  }, []);

  return {
    // État
    viewMode,
    selectedDate,
    currentMonth,

    // Navigation
    navigateToMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    navigateToDate,

    // Mode de vue
    changeViewMode,

    // Sélection
    selectDate,
    clearSelection,
    isSelectedDate,

    // Helpers
    isCurrentMonth
  };
};
