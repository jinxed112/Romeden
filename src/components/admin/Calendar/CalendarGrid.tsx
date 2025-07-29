import React from 'react';
import { useAdminCalendar } from '../../../hooks/calendar/useAdminCalendar';
import { getMonthDays, dateToString } from '../../../utils/calendar/calendarUtils';
import { isToday, isWeekend } from '../../../utils/calendar/calendarUtils';
import { isJourFerie } from '../../../utils/calendar/holidaysData';

interface CalendarGridProps {
  year: number;
  month: number;
  onDateClick: (date: Date) => void;
  selectedDate?: Date | null;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  onDateClick,
  selectedDate
}) => {
  const { availability } = useAdminCalendar();
  const days = getMonthDays(year, month);

  const getCellClasses = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      return "p-3 text-gray-400 bg-gray-50 rounded-xl cursor-default";
    }

    // Utiliser la version SYNCHRONE du hook
    const dateStatus = availability.getDateInfoSync(date);
    
    let statusClasses = "p-3 rounded-xl cursor-pointer transition-all hover:shadow-lg border-2 ";

    // Couleurs selon le statut
    switch (dateStatus.statut) {
      case 'disponible':
        if (isJourFerie(date)) {
          statusClasses = "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200";
        } else if (isWeekend(date)) {
          statusClasses = "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200";
        } else {
          statusClasses = "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
        }
        break;
      case 'bloque':
        statusClasses = "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";
        break;
      case 'reserve':
        statusClasses = "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200";
        break;
      default: // indisponible
        statusClasses = "bg-red-100 text-red-800 border-red-300 hover:bg-red-200";
        break;
    }

    // Jour sélectionné
    if (selectedDate && dateToString(date) === dateToString(selectedDate)) {
      statusClasses += " ring-4 ring-blue-400";
    }

    // Aujourd'hui
    if (isToday(date)) {
      statusClasses += " ring-2 ring-offset-2 ring-indigo-500";
    }

    return statusClasses;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      {/* En-têtes des jours */}
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
          const dateStatus = availability.getDateInfoSync(dayInfo.date);
          
          return (
            <div
              key={index}
              className={getCellClasses(dayInfo.date, dayInfo.isCurrentMonth)}
              onClick={() => dayInfo.isCurrentMonth && onDateClick(dayInfo.date)}
              style={{ minHeight: '80px' }}
            >
              <div className="font-bold text-lg mb-1">{dayInfo.date.getDate()}</div>
              
              {dayInfo.isCurrentMonth && (
                <div className="space-y-1">
                  {/* Statut principal */}
                  <div className="text-xs font-medium">
                    {dateStatus.statut === 'disponible' && '✅'}
                    {dateStatus.statut === 'indisponible' && '🚫'}
                    {dateStatus.statut === 'bloque' && '🔒'}
                    {dateStatus.statut === 'reserve' && '📅'}
                  </div>

                  {/* Jour férié */}
                  {isJourFerie(dayInfo.date) && (
                    <div className="text-xs text-purple-600 font-bold">
                      🎉 Férié
                    </div>
                  )}

                  {/* Weekend */}
                  {isWeekend(dayInfo.date) && !isJourFerie(dayInfo.date) && (
                    <div className="text-xs text-blue-600 font-bold">
                      📅 Weekend
                    </div>
                  )}

                  {/* Majoration */}
                  {dateStatus.majoration > 0 && (
                    <div className="text-xs bg-orange-200 text-orange-800 px-1 py-0.5 rounded">
                      +{dateStatus.majoration}%
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
