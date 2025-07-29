import React, { useState, useEffect } from 'react';
import { useAdminCalendar } from '../../../hooks/calendar/useAdminCalendar';
import { DisponibiliteJour } from '../../../utils/types';
import { formatDateFr, dateToString } from '../../../utils/calendar/calendarUtils';
import { isJourFerie, getNomJourFerie } from '../../../utils/calendar/holidaysData';

interface DateManagementModalProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const DateManagementModal: React.FC<DateManagementModalProps> = ({
  date,
  isOpen,
  onClose,
  onSave
}) => {
  const { availability } = useAdminCalendar();
  
  // États locaux pour le formulaire
  const [statut, setStatut] = useState<'disponible' | 'indisponible' | 'bloque' | 'reserve'>('indisponible');
  const [majoration, setMajoration] = useState(0);
  const [motif, setMotif] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // États pour les données actuelles
  const [dateInfo, setDateInfo] = useState<any>(null);
  const [customAvailability, setCustomAvailability] = useState<DisponibiliteJour | null>(null);

  // Charger les données au montage et quand la date change
  useEffect(() => {
    if (!isOpen) return;

    const loadDateData = async () => {
      // Charger les infos sync pour l'affichage
      const syncInfo = availability.getDateInfoSync(date);
      setDateInfo(syncInfo);
      
      // Charger la disponibilité personnalisée
      const customData = await availability.getCustomAvailability(date);
      setCustomAvailability(customData);

      if (customData) {
        setStatut(customData.statut as any);
        setMajoration(customData.majoration);
        setMotif(customData.motif || '');
      } else {
        setStatut('indisponible');
        setMajoration(0);
        setMotif('');
      }
    };

    loadDateData();
  }, [date, isOpen, availability]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await availability.setDateAvailability(date, {
        statut,
        majoration,
        motif: motif.trim() || undefined
      });

      if (success) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette configuration personnalisée ?')) return;
    
    setIsSaving(true);
    try {
      const success = await availability.removeCustomDateAvailability(date);
      if (success) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const jourFerieNom = getNomJourFerie(date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            📅 {formatDateFr(date)}
          </h3>
          {jourFerieNom && (
            <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              🎉 {jourFerieNom}
            </div>
          )}
        </div>

        {/* Informations actuelles */}
        {dateInfo && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-3">📊 État actuel</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Statut</div>
                <div className={`font-medium ${
                  dateInfo.statut === 'disponible' ? 'text-green-600' :
                  dateInfo.statut === 'reserve' ? 'text-amber-600' :
                  dateInfo.statut === 'bloque' ? 'text-gray-600' :
                  'text-red-600'
                }`}>
                  {dateInfo.statut === 'disponible' ? '✅ Disponible' :
                   dateInfo.statut === 'reserve' ? '📅 Réservé' :
                   dateInfo.statut === 'bloque' ? '🔒 Bloqué' :
                   '🚫 Indisponible'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Majoration</div>
                <div className="font-medium text-orange-600">
                  {dateInfo.majoration > 0 ? `+${dateInfo.majoration}%` : 'Aucune'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de modification */}
        <div className="space-y-6">
          
          {/* Statut */}
          <div>
            <label className="block font-bold text-gray-800 mb-3">🎯 Nouveau statut</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                <input
                  type="radio"
                  name="statut"
                  value="disponible"
                  checked={statut === 'disponible'}
                  onChange={(e) => setStatut(e.target.value as any)}
                  className="w-5 h-5 text-green-600"
                />
                <span className="text-green-600 font-medium">✅ DISPONIBLE pour réservation</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                <input
                  type="radio"
                  name="statut"
                  value="indisponible"
                  checked={statut === 'indisponible'}
                  onChange={(e) => setStatut(e.target.value as any)}
                  className="w-5 h-5 text-red-600"
                />
                <span className="text-red-600 font-medium">🚫 INDISPONIBLE</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                <input
                  type="radio"
                  name="statut"
                  value="bloque"
                  checked={statut === 'bloque'}
                  onChange={(e) => setStatut(e.target.value as any)}
                  className="w-5 h-5 text-gray-600"
                />
                <span className="text-gray-600 font-medium">🔒 BLOQUÉ (congés, fermeture)</span>
              </label>
            </div>
          </div>

          {/* Majoration (si disponible) */}
          {statut === 'disponible' && (
            <div>
              <label className="block font-bold text-gray-800 mb-2">💰 Majoration (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={majoration}
                onChange={(e) => setMajoration(Number(e.target.value))}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
              <div className="text-sm text-gray-600 mt-1">
                0 = pas de majoration, 20 = +20% sur le prix de base
              </div>
            </div>
          )}

          {/* Motif */}
          <div>
            <label className="block font-bold text-gray-800 mb-2">📝 Note/Motif (optionnel)</label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Congés, événement spécial..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4 mt-8">
          
          <div className="flex space-x-4">
            {customAvailability && (
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
              >
                🗑️ Supprimer config
              </button>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500">🔧 Debug</summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
              <div>📅 Date: {dateToString(date)}</div>
              <div>🎯 Statut: {statut}</div>
              <div>💰 Majoration: {majoration}%</div>
              <div>📝 Motif: "{motif}"</div>
              <div>⚙️ A config: {customAvailability ? 'OUI' : 'NON'}</div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default DateManagementModal;
