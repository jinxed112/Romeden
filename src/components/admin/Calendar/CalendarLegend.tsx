import React from 'react';

const CalendarLegend: React.FC = () => {
  const legendItems = [
    { color: 'bg-green-100 border-green-200 text-green-800', label: 'Disponible', icon: '✅' },
    { color: 'bg-blue-100 border-blue-200 text-blue-800', label: 'Weekend (+20%)', icon: '🎯' },
    { color: 'bg-purple-100 border-purple-200 text-purple-800', label: 'Jour férié (+30%)', icon: '🎉' },
    { color: 'bg-amber-100 border-amber-200 text-amber-800', label: 'Réservé', icon: '📅' },
    { color: 'bg-red-100 border-red-200 text-red-800', label: 'Indisponible', icon: '🚫' }
  ];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-rose-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">🏷️ Légende du calendrier</h3>
          <p className="text-sm text-gray-600">Comprenez les couleurs et symboles utilisés</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {legendItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl border-2 ${item.color}`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
