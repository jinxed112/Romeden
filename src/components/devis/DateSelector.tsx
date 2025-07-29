import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAvailability } from '../../hooks/calendar/useAvailability';

interface DateSelectorProps {
  onDateSelect: (date: string, majoration: number) => void;
  selectedDate: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onDateSelect, selectedDate }) => {
  const availability = useAvailability();
  const [dateInfo, setDateInfo] = useState<string>('');

  const getJourSemaine = (date: Date): string => {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return jours[date.getDay()];
  };

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

  // Utiliser les données Supabase via le hook
  const getStatutDate = (date: Date) => {
    // Dates passées = indisponibles
    if (date < new Date()) {
      return { statut: 'indisponible', majoration: 0 };
    }

    // Utiliser le hook Supabase (version sync pour l'affichage)
    const status = availability.getDateInfoSync(date);
    return {
      statut: status.statut,
      majoration: status.majoration
    };
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const { statut } = getStatutDate(date);
    const dateStr = date.toISOString().split('T')[0];
    
    let classes = 'relative ';
    
    switch (statut) {
      case 'disponible':
        classes += 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer';
        break;
      case 'reserve':
        classes += 'bg-blue-100 text-blue-800 cursor-not-allowed';
        break;
      case 'bloque':
        classes += 'bg-gray-100 text-gray-600 cursor-not-allowed';
        break;
      default:
        classes += 'bg-red-50 text-red-400 cursor-not-allowed';
    }

    if (selectedDate === dateStr) {
      classes += ' ring-2 ring-rose-400 ring-offset-1';
    }

    return classes;
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const { statut } = getStatutDate(date);
    return statut !== 'disponible';
  };

  const onClickDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const { statut, majoration } = getStatutDate(date);
    
    if (statut === 'disponible') {
      onDateSelect(dateStr, majoration);
      
      // Afficher info sur la date
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

  const tileContent = ({ date }: { date: Date }) => {
    const { statut, majoration } = getStatutDate(date);
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {majoration > 0 && statut === 'disponible' && (
          <div className="absolute -top-1 -right-1 bg-amber-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            +{majoration}%
          </div>
        )}
        {statut === 'reserve' && (
          <div className="absolute -top-1 -right-1 text-blue-600 text-xs">📋</div>
        )}
      </div>
    );
  };

  // Loading state
  if (availability.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          <span className="ml-4 text-gray-600">📡 Chargement du calendrier depuis Supabase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📅 Sélectionnez votre date</h3>
        
        {/* Info Supabase */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">🔄</span>
            <div className="text-sm text-blue-800">
              <span className="font-semibold">Calendrier synchronisé</span> • 
              {availability.disponibilites.length} disponibilités chargées depuis Supabase
            </div>
          </div>
        </div>
        
        {/* Légende */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Bloqué</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
            <span>Indisponible</span>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <Calendar
          onClickDay={onClickDay}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          tileContent={tileContent}
          locale="fr-FR"
          minDate={new Date()}
          className="w-full"
        />
      </div>

      {/* Info date sélectionnée */}
      {dateInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-600 text-xl">✅</div>
            <div>
              <div className="font-semibold text-green-800">Date sélectionnée</div>
              <div className="text-green-700">{dateInfo}</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-1">Comment ça marche :</div>
            <ul className="space-y-1">
              <li>• Seules les dates <span className="font-semibold text-green-700">vertes</span> sont disponibles à la réservation</li>
              <li>• Les majorations (weekend, jours fériés) sont automatiquement appliquées</li>
              <li>• Les dates avec <span className="bg-amber-400 text-white px-1 rounded">+%</span> ont une majoration tarifaire</li>
              <li>• Les dates grises sont bloquées par l'administrateur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
