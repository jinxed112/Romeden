import React, { useState } from 'react';
import { useAdminCalendar } from '../../../hooks/calendar/useAdminCalendar';
import { getMonthDays, getMonthNameFr, dateToString } from '../../../utils/calendar/calendarUtils';
import { isToday, isWeekend } from '../../../utils/calendar/calendarUtils';
import { isJourFerie } from '../../../utils/calendar/holidaysData';

const CalendarView: React.FC = () => {
  const { availability } = useAdminCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = getMonthNameFr(month);
  const days = getMonthDays(year, month);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToMonth = (newMonth: number) => {
    setCurrentDate(new Date(year, newMonth, 1));
  };

  const goToYear = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
  };

  // Obtenir le statut d'une date (VERSION SUPABASE)
  const getDateStatus = (date: Date) => {
    return availability.getDateInfoSync(date);
  };

  // Couleurs
  const getDateClasses = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      return "p-3 rounded-lg bg-gray-50 text-gray-400 cursor-default";
    }

    const status = getDateStatus(date);
    const isCurrentDay = isToday(date);
    
    let classes = "p-3 rounded-lg cursor-pointer transition-all hover:shadow-lg border-2 ";
    
    switch (status.statut) {
      case 'disponible':
        classes += "bg-green-100 border-green-300 text-green-800 hover:bg-green-200 ";
        break;
      case 'bloque':
        classes += "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200 ";
        break;
      case 'reserve':
        classes += "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 ";
        break;
      default: // indisponible
        classes += "bg-red-100 border-red-300 text-red-800 hover:bg-red-200 ";
        break;
    }
    
    if (isCurrentDay) {
      classes += "ring-4 ring-blue-400 ";
    }
    
    return classes;
  };

  // Ouvrir modal
  const openModal = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  // Fermer modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
  };

  // Loading state
  if (availability.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">📡 Chargement depuis Supabase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Navigation */}
      <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold text-sm sm:text-base"
          >
            ← Préc.
          </button>
          
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800 text-center flex-1 mx-2">
            {monthName.length > 6 ? monthName.substring(0, 4) + '.' : monthName} {year}
          </h3>
          
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold text-sm sm:text-base"
          >
            Suiv. →
          </button>
        </div>

        <div className="flex justify-center space-x-2 sm:space-x-4">
          <select
            value={month}
            onChange={(e) => goToMonth(parseInt(e.target.value))}
            className="px-3 py-2 sm:px-4 sm:py-2 border rounded-lg text-sm sm:text-base"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const fullName = getMonthNameFr(i);
              const shortName = fullName.length > 6 ? fullName.substring(0, 4) + '.' : fullName;
              return (
                <option key={i} value={i}>{shortName}</option>
              );
            })}
          </select>
          
          <select
            value={year}
            onChange={(e) => goToYear(parseInt(e.target.value))}
            className="px-3 py-2 sm:px-4 sm:py-2 border rounded-lg text-sm sm:text-base"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={() => availability.forceReload()}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm sm:text-base"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center font-bold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((dayInfo, index) => {
            const status = getDateStatus(dayInfo.date);
            return (
              <div
                key={index}
                className={getDateClasses(dayInfo.date, dayInfo.isCurrentMonth)}
                onClick={() => dayInfo.isCurrentMonth && openModal(dayInfo.date)}
                style={{ minHeight: '80px' }}
              >
                <div className="font-bold text-lg mb-1">{dayInfo.date.getDate()}</div>
                
                {dayInfo.isCurrentMonth && (
                  <div className="text-xs">
                    {status.statut === 'disponible' && '✅'}
                    {status.statut === 'indisponible' && '🚫'}
                    {status.statut === 'bloque' && '🔒'}
                    {status.statut === 'reserve' && '📅'}
                    
                    {isJourFerie(dayInfo.date) && <div className="text-purple-600">🎉</div>}
                    {isWeekend(dayInfo.date) && !isJourFerie(dayInfo.date) && <div className="text-blue-600">📅</div>}
                    
                    {status.majoration > 0 && (
                      <div className="bg-orange-200 text-orange-800 px-1 rounded">
                        +{status.majoration}%
                      </div>
                    )}
                  </div>
                )}
                
                {isToday(dayInfo.date) && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h4 className="font-bold mb-4 text-gray-900">🏷️ Légende</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>🚫 Indisponible (défaut)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>✅ Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span>🔒 Bloqué</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
            <span>📅 Réservé</span>
          </div>
        </div>
      </div>

      {/* Modal Supabase */}
      {showModal && selectedDate && (
        <SupabaseModal
          date={selectedDate}
          availability={availability}
          onClose={closeModal}
          onSave={() => {
            closeModal();
            setCurrentDate(new Date(currentDate)); // Force re-render
          }}
        />
      )}
    </div>
  );
};

// Modal qui utilise le hook Supabase
const SupabaseModal: React.FC<{
  date: Date;
  availability: any;
  onClose: () => void;
  onSave: () => void;
}> = ({ date, availability, onClose, onSave }) => {
  const [statut, setStatut] = useState<'disponible' | 'indisponible' | 'bloque' | 'reserve'>('indisponible');
  const [majoration, setMajoration] = useState(0);
  const [motif, setMotif] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const dateStr = dateToString(date);

  const handleSave = async () => {
    setIsSaving(true);
    console.log('💾 SAUVEGARDE SUPABASE:', { date: dateStr, statut, majoration, motif });
    
    try {
      const success = await availability.setDateAvailability(date, {
        statut,
        majoration,
        motif: motif || undefined
      });

      if (success) {
        console.log('✅ SAUVEGARDE RÉUSSIE!');
        alert(`✅ SAUVEGARDÉ dans Supabase !\n\nDate: ${date.toLocaleDateString('fr-FR')}\nStatut: ${statut}`);
        onSave();
      } else {
        alert('❌ Erreur de sauvegarde');
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4">
        
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
          📅 {date.toLocaleDateString('fr-FR')} (SUPABASE)
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-bold mb-3 text-gray-900">Statut :</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="statut"
                  value="disponible"
                  checked={statut === 'disponible'}
                  onChange={(e) => setStatut(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-green-600 font-bold">✅ DISPONIBLE</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="statut"
                  value="indisponible"
                  checked={statut === 'indisponible'}
                  onChange={(e) => setStatut(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-red-600 font-bold">🚫 INDISPONIBLE</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="statut"
                  value="bloque"
                  checked={statut === 'bloque'}
                  onChange={(e) => setStatut(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-gray-600 font-bold">🔒 BLOQUÉ</span>
              </label>
            </div>
          </div>

          {statut === 'disponible' && (
            <div>
              <label className="block font-bold mb-2 text-gray-900">Majoration (%) :</label>
              <input
                type="number"
                min="0"
                max="100"
                value={majoration}
                onChange={(e) => setMajoration(Number(e.target.value))}
                className="w-full p-3 border rounded-lg"
                placeholder="0"
              />
            </div>
          )}

          <div>
            <label className="block font-bold mb-2 text-gray-900">Note :</label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Optionnel..."
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50"
          >
            {isSaving ? '⏳ Sauvegarde...' : '💾 SAUVEGARDER SUPABASE'}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;