import React from 'react';
import { useAdminCalendar } from '../../../hooks/calendar/useAdminCalendar';
import { getMonthNameFr, addDays, dateToString } from '../../../utils/calendar/calendarUtils';
import { setMultipleDatesAvailable } from '../../../utils/calendar/availabilityManager';

const CalendarControls: React.FC = () => {
  const { calendar, availability } = useAdminCalendar();

  const currentYear = calendar.currentMonth.year;
  const currentMonth = calendar.currentMonth.month;

  const generateYearOptions = () => {
    const years = [];
    for (let year = currentYear - 2; year <= currentYear + 3; year++) {
      years.push(year);
    }
    return years;
  };

  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      name: getMonthNameFr(i)
    }));
  };

  // Action rapide : rendre disponible cette semaine
  const rendreDisponibleSemaine = () => {
    const today = new Date();
    const dates = [];
    
    // Créer les 7 prochains jours
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(today, i));
    }
    
    if (window.confirm(`Rendre disponibles les 7 prochains jours ?\n(du ${dates[0].toLocaleDateString('fr-FR')} au ${dates[6].toLocaleDateString('fr-FR')})`)) {
      setMultipleDatesAvailable(dates);
      // Forcer le rechargement
      window.location.reload();
    }
  };

  // Action rapide : rendre disponible tout le mois
  const rendreDisponibleMois = () => {
    const dates = [];
    const year = calendar.currentMonth.year;
    const month = calendar.currentMonth.month;
    
    // Tous les jours du mois courant
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Seulement les jours futurs
      if (date >= new Date()) {
        dates.push(date);
      }
    }
    
    if (dates.length > 0 && window.confirm(`Rendre disponibles tous les jours restants de ${getMonthNameFr(month)} ${year} ?\n(${dates.length} jours)`)) {
      setMultipleDatesAvailable(dates);
      // Forcer le rechargement
      window.location.reload();
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-rose-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        
        {/* Navigation mois */}
        <div className="flex items-center space-x-4">
          <button
            onClick={calendar.goToPreviousMonth}
            className="p-3 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-md"
          >
            ← Précédent
          </button>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {calendar.currentMonth.monthName} {currentYear}
            </div>
          </div>
          <button
            onClick={calendar.goToNextMonth}
            className="p-3 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-md"
          >
            Suivant →
          </button>
        </div>

        {/* Sélecteurs et actions */}
        <div className="flex items-center space-x-3">
          <select
            value={currentMonth}
            onChange={(e) => calendar.navigateToMonth(currentYear, parseInt(e.target.value))}
            className="px-4 py-2 bg-white border-2 border-rose-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
          >
            {generateMonthOptions().map(month => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => calendar.navigateToMonth(parseInt(e.target.value), currentMonth)}
            className="px-4 py-2 bg-white border-2 border-rose-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            onClick={calendar.goToToday}
            className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-xl font-medium hover:from-amber-500 hover:to-yellow-500 transition-all transform hover:scale-105 shadow-md"
          >
            📅 Aujourd'hui
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-6 pt-6 border-t border-rose-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Actions rapides</h4>
            <p className="text-sm text-gray-600">Configurez rapidement vos disponibilités</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={rendreDisponibleSemaine}
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-medium hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-md"
          >
            ✅ Disponible 7 jours
          </button>
          
          <button
            onClick={rendreDisponibleMois}
            className="px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl font-medium hover:from-blue-500 hover:to-cyan-500 transition-all transform hover:scale-105 shadow-md"
          >
            📅 Disponible ce mois
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-md"
          >
            🔄 Actualiser
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          💡 <strong>Astuce :</strong> Par défaut, toutes les dates sont indisponibles. 
          Cliquez sur une date ou utilisez les boutons ci-dessus pour les rendre disponibles.
        </div>
      </div>
    </div>
  );
};

export default CalendarControls;
