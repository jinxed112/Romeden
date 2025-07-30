import React, { useState, useEffect } from 'react';
import { DisponibiliteJour } from '../../../utils/types';
import { dateToString, formatDateFr, addDays } from '../../../utils/calendar/calendarUtils';
import { isJourFerie, getNomJourFerie } from '../../../utils/calendar/holidaysData';

interface PlanningStats {
  evenementsDisponibles: number;
  evenementsBloques: number;
  joursRestantsMois: number;
  tauxOccupation: number;
  caPrevisionnelMois: number;
}

interface EvenementPlanning {
  date: string;
  dateObj: Date;
  statut: 'disponible' | 'indisponible' | 'bloque';
  majoration: number;
  motif?: string;
  jourFerie?: string;
  isWeekend: boolean;
  prixEstime: number;
}

const PlanningView: React.FC = () => {
  const [disponibilites, setDisponibilites] = useState<DisponibiliteJour[]>([]);
  const [evenements, setEvenements] = useState<EvenementPlanning[]>([]);
  const [stats, setStats] = useState<PlanningStats>({
    evenementsDisponibles: 0,
    evenementsBloques: 0,
    joursRestantsMois: 0,
    tauxOccupation: 0,
    caPrevisionnelMois: 0
  });

  // Charger les données
  useEffect(() => {
    loadPlanningData();
  }, []);

  const loadPlanningData = () => {
    try {
      // Charger disponibilités
      const savedDispos = localStorage.getItem('romeden_disponibilites');
      const dispos: DisponibiliteJour[] = savedDispos ? JSON.parse(savedDispos) : [];
      setDisponibilites(dispos);

      // Générer événements des 30 prochains jours
      const events = generateUpcomingEvents(dispos);
      setEvenements(events);

      // Calculer statistiques
      const calculatedStats = calculateStats(events);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Erreur chargement planning:', error);
    }
  };

  const generateUpcomingEvents = (dispos: DisponibiliteJour[]): EvenementPlanning[] => {
    const events: EvenementPlanning[] = [];
    const today = new Date();
    
    // 30 prochains jours
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      const dateStr = dateToString(date);
      const custom = dispos.find(d => d.date === dateStr);
      
      // Déterminer le statut - FIX TYPESCRIPT
      let statut: 'disponible' | 'indisponible' | 'bloque' = 'indisponible';
      let majoration = 0;
      let motif = undefined;
      
      if (custom) {
        // Filtrer le statut 'reserve' qui n'existe pas dans l'interface
        if (custom.statut === 'reserve') {
          statut = 'disponible'; // On considère réservé comme disponible dans le planning
        } else {
          statut = custom.statut as 'disponible' | 'indisponible' | 'bloque';
        }
        majoration = custom.majoration;
        motif = custom.motif;
      }
      
      // Info jour - FIX TYPESCRIPT
      const jourFerieNom = getNomJourFerie(date);
      const jourFerie = jourFerieNom || undefined; // Convertir null en undefined
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Prix estimé (base 200€ + majorations)
      let prixEstime = 200; // Prix de base moyen
      if (majoration > 0) {
        prixEstime += (prixEstime * majoration) / 100;
      } else if (jourFerie) {
        prixEstime += (prixEstime * 30) / 100; // +30% férié
      } else if (isWeekend) {
        prixEstime += (prixEstime * 20) / 100; // +20% weekend
      }
      
      events.push({
        date: dateStr,
        dateObj: date,
        statut,
        majoration,
        motif,
        jourFerie,
        isWeekend,
        prixEstime: Math.round(prixEstime)
      });
    }
    
    return events;
  };

  const calculateStats = (events: EvenementPlanning[]): PlanningStats => {
    const disponibles = events.filter(e => e.statut === 'disponible');
    const bloques = events.filter(e => e.statut === 'bloque');
    
    // Jours restants ce mois
    const today = new Date();
    const finMois = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const joursRestantsMois = Math.max(0, finMois.getDate() - today.getDate());
    
    // CA prévisionnel (seulement les disponibles)
    const caPrevisionnelMois = disponibles.reduce((total, event) => {
      return total + event.prixEstime;
    }, 0);
    
    // Taux d'occupation (disponible + bloqué / total)
    const tauxOccupation = Math.round(((disponibles.length + bloques.length) / events.length) * 100);
    
    return {
      evenementsDisponibles: disponibles.length,
      evenementsBloques: bloques.length,
      joursRestantsMois,
      tauxOccupation,
      caPrevisionnelMois
    };
  };

  const getEventIcon = (event: EvenementPlanning) => {
    if (event.jourFerie) return '🎉';
    if (event.statut === 'disponible') return '✅';
    if (event.statut === 'bloque') return '🔒';
    return '🚫';
  };

  const getEventColor = (event: EvenementPlanning) => {
    if (event.statut === 'disponible') return 'border-green-300 bg-green-50';
    if (event.statut === 'bloque') return 'border-gray-300 bg-gray-50';
    return 'border-red-300 bg-red-50';
  };

  return (
    <div className="space-y-6">

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.evenementsDisponibles}</div>
              <div className="text-sm text-gray-600">Jours disponibles</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.evenementsBloques}</div>
              <div className="text-sm text-gray-600">Jours bloqués</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.tauxOccupation}%</div>
              <div className="text-sm text-gray-600">Taux occupation</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-amber-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.caPrevisionnelMois}€</div>
              <div className="text-sm text-gray-600">CA prévisionnel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={loadPlanningData}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
          >
            🔄 Actualiser les données
          </button>
          <button
            onClick={() => {
              const data = JSON.stringify(disponibilites, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `planning-romeden-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
          >
            📥 Exporter planning
          </button>
        </div>
      </div>

      {/* Liste des événements à venir */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">📅 Événements à venir (30 jours)</h3>
          <div className="text-sm text-gray-600">
            Cliquez sur un événement pour le modifier
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {evenements.map((event, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${getEventColor(event)}`}
              onClick={() => {
                // Ouvrir le calendrier à cette date
                alert(`Fonctionnalité à venir : Éditer la date ${formatDateFr(event.dateObj)}`);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getEventIcon(event)}</div>
                  <div>
                    <div className="font-bold text-gray-800">
                      {formatDateFr(event.dateObj)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.jourFerie && `🎉 ${event.jourFerie} - `}
                      {event.isWeekend && !event.jourFerie && '📅 Weekend - '}
                      {event.statut === 'disponible' && 'Disponible pour réservation'}
                      {event.statut === 'bloque' && `Bloqué${event.motif ? ` - ${event.motif}` : ''}`}
                      {event.statut === 'indisponible' && 'Indisponible (par défaut)'}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">
                    {event.prixEstime}€
                  </div>
                  {event.majoration > 0 && (
                    <div className="text-sm text-orange-600">
                      +{event.majoration}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {evenements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600">Configurez vos disponibilités dans le calendrier</p>
          </div>
        )}
      </div>

      {/* Résumé mensuel */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-3xl shadow-lg p-6 border border-rose-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Résumé mensuel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">{stats.joursRestantsMois}</div>
            <div className="text-sm text-gray-600">Jours restants ce mois</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.evenementsDisponibles}</div>
            <div className="text-sm text-gray-600">Créneaux disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{stats.caPrevisionnelMois}€</div>
            <div className="text-sm text-gray-600">Potentiel maximum</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-xl">
          <div className="text-sm text-gray-600 mb-2">Répartition des créneaux :</div>
          <div className="flex space-x-4 text-sm">
            <span className="text-green-600">✅ {stats.evenementsDisponibles} disponibles</span>
            <span className="text-gray-600">🔒 {stats.evenementsBloques} bloqués</span>
            <span className="text-red-600">🚫 {30 - stats.evenementsDisponibles - stats.evenementsBloques} indisponibles</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningView;