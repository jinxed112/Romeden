import React, { useState } from 'react';
import { AdminSection } from '../../utils/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<AdminSection['id']>('dashboard');

  const sections: AdminSection[] = [
    { id: 'dashboard', nom: 'Accueil', icon: '🏠' },
    { id: 'prestations', nom: 'Prestations', icon: '🛍️' },
    { id: 'calendrier', nom: 'Calendrier', icon: '📅' },
    { id: 'planning', nom: 'Planning', icon: '📋' },
    { id: 'reservations', nom: 'Réservations', icon: '📝' },
    { id: 'parametres', nom: 'Paramètres', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-peach-50">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-rose-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                  Administration
                </span>
              </h1>
              <p className="text-gray-600 text-lg">Gérez votre activité RomEden Events</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Section active</p>
              <p className="text-2xl font-bold text-rose-600">
                {sections.find(s => s.id === activeSection)?.nom}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-rose-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">📂 Navigation</h2>
              <div className="space-y-3">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full p-4 rounded-2xl text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg transform scale-105' 
                        : 'bg-white/80 hover:bg-white text-gray-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{section.icon}</span>
                      <div>
                        <div className="font-medium">{section.nom}</div>
                        {section.badge && (
                          <div className="text-xs opacity-80">
                            {section.badge} {section.badge > 1 ? 'éléments' : 'élément'}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
