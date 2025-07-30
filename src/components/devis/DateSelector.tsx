import React, { useState } from 'react';
import { useAvailability } from '../../hooks/calendar/useAvailability';

interface DateSelectorProps {
  onDateSelect: (date: string, majoration: number) => void;
  selectedDate: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onDateSelect, selectedDate }) => {
  const availability = useAvailability();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateInfo, setDateInfo] = useState<string>('');

  const isWeekend = (date: Date): boolean => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const isJourFerie = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    const joursFeries2025 = [
      '2025-01-01', '2025-05-01', '2025-05-08', '2025-07-14',
      '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25'
    ];
    return joursFeries2025.includes(dateStr);
  };

  const getStatutDate = (date: Date) => {
    if (date < new Date()) {
      return { statut: 'indisponible', majoration: 0 };
    }

    const status = availability.getDateInfoSync(date);
    return {
      statut: status.statut,
      majoration: status.majoration
    };
  };

  const onClickDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const { statut, majoration } = getStatutDate(date);
    
    if (statut === 'disponible') {
      onDateSelect(dateStr, majoration);
      
      let info = `📅 ${date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`;
      
      if (majoration > 0) {
        info += ` • Majoration: +${majoration}%`;
        if (isWeekend(date)) info += ' (weekend)';
        if (isJourFerie(date)) info += ' (jour férié)';
      }
      
      setDateInfo(info);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDayStatus = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      return { 
        className: 'text-gray-300', 
        disabled: true, 
        statut: 'indisponible' as const, 
        majoration: 0 
      };
    }

    const { statut, majoration } = getStatutDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = selectedDate === dateStr;
    
    let className = 'relative ';
    let disabled = false;
    
    switch (statut) {
      case 'disponible':
        className += 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200';
        break;
      case 'reserve':
        className += 'bg-blue-100 text-blue-800 border border-blue-200';
        disabled = true;
        break;
      case 'bloque':
        className += 'bg-gray-100 text-gray-600 border border-gray-200';
        disabled = true;
        break;
      default:
        className += 'bg-red-50 text-red-400 border border-red-100';
        disabled = true;
    }

    if (isSelected && !disabled) {
      className += ' ring-2 ring-rose-400 ring-offset-1 bg-rose-200 text-rose-800';
    }

    return { className, disabled, statut, majoration: majoration || 0 };
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const days = getDaysInMonth(currentMonth);

  // Loading state
  if (availability.isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-12 sm:py-20">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-rose-500"></div>
          <span className="ml-3 sm:ml-4 text-gray-600 text-sm sm:text-base">📡 Chargement du calendrier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center sm:text-left">
          📅 Sélectionnez votre date
        </h3>
        
        {/* Info Supabase - Compact sur mobile */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="text-blue-600">🔄</span>
            <div className="text-xs sm:text-sm text-blue-800 text-center sm:text-left">
              <span className="font-semibold">Calendrier synchronisé</span> • 
              {availability.disponibilites.length} disponibilités
            </div>
          </div>
        </div>
        
        {/* Légende - Stack sur mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Réservé</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Bloqué</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-50 border border-red-200 rounded"></div>
            <span>Indisponible</span>
          </div>
        </div>
      </div>

      {/* Calendrier Custom */}
      <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 touch-manipulation"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h4 className="text-lg sm:text-xl font-bold text-gray-800">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 touch-manipulation"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
          {dayNames.map(day => (
            <div key={day} className="text-center py-2 text-xs sm:text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((dayObj, index) => {
            const { date, isCurrentMonth } = dayObj;
            const { className, disabled, statut, majoration } = getDayStatus(date, isCurrentMonth);
            
            return (
              <button
                key={index}
                onClick={() => !disabled && onClickDay(date)}
                disabled={disabled}
                className={`
                  relative aspect-square min-h-[40px] sm:min-h-[48px] 
                  rounded-lg sm:rounded-xl transition-all duration-200 
                  flex items-center justify-center text-sm sm:text-base font-medium
                  touch-manipulation
                  ${className}
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                `}
              >
                <span className="relative z-10">
                  {date.getDate()}
                </span>
                
                {/* Majoration Badge */}
                {majoration > 0 && statut === 'disponible' && (
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold leading-none">
                    +
                  </div>
                )}
                
                {/* Réservé Badge */}
                {statut === 'reserve' && (
                  <div className="absolute -top-1 -right-1 text-blue-600 text-xs">📋</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info date sélectionnée */}
      {dateInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-green-600 text-lg sm:text-xl">✅</div>
            <div className="flex-1">
              <div className="font-semibold text-green-800 text-sm sm:text-base">Date sélectionnée</div>
              <div className="text-green-700 text-sm sm:text-base leading-relaxed">{dateInfo}</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions - Compact sur mobile */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="text-blue-600 text-lg sm:text-xl">ℹ️</div>
          <div className="text-xs sm:text-sm text-blue-800">
            <div className="font-semibold mb-1 sm:mb-2">Comment ça marche :</div>
            <ul className="space-y-1">
              <li>• Seules les dates <span className="font-semibold text-green-700">vertes</span> sont disponibles</li>
              <li>• Les majorations sont automatiquement appliquées</li>
              <li>• Les dates avec <span className="bg-amber-400 text-white px-1 rounded text-xs">+</span> ont une majoration</li>
              <li>• Les dates grises sont bloquées par l'administrateur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;