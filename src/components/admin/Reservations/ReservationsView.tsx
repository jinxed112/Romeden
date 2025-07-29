import React, { useState } from 'react';
import { useReservations } from '../../../hooks/useReservations';
import { formaterPrix } from '../../../utils/devisCalculator';

const ReservationsView: React.FC = () => {
  const {
    reservations,
    isLoading,
    changeStatus,
    deleteReservation,
    quickStats,
    getReservationsByStatus,
    forceReload
  } = useReservations();

  const [activeTab, setActiveTab] = useState<'toutes' | 'en_attente' | 'confirme' | 'refuse'>('toutes');

  const stats = quickStats();

  // Filtrer les réservations selon l'onglet actif
  const getFilteredReservations = () => {
    switch (activeTab) {
      case 'en_attente':
        return getReservationsByStatus('en_attente');
      case 'confirme':
        return getReservationsByStatus('confirme');
      case 'refuse':
        return getReservationsByStatus('refuse');
      default:
        return reservations;
    }
  };

  const filteredReservations = getFilteredReservations();

  // Changer le statut d'une réservation
  const handleStatusChange = async (id: string, newStatus: 'en_attente' | 'confirme' | 'refuse') => {
    const success = await changeStatus(id, newStatus);
    if (success) {
      console.log(`✅ Statut changé pour ${id}: ${newStatus}`);
    }
  };

  // Supprimer une réservation
  const handleDelete = async (id: string) => {
    const success = await deleteReservation(id);
    if (success) {
      console.log(`✅ Réservation ${id} supprimée`);
    }
  };

  // Couleurs selon le statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirme':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_attente':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'refuse':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'confirme': return '✅';
      case 'en_attente': return '⏳';
      case 'refuse': return '❌';
      default: return '❓';
    }
  };

  // Fonction pour afficher les prestations de façon lisible
  const renderPrestations = (prestations: any) => {
    try {
      const data = typeof prestations === 'string' ? JSON.parse(prestations) : prestations;
      console.log("📋 DEBUG Prestations:", data);
      
      if (data?.items && Array.isArray(data.items)) {
        return (
          <div className="space-y-2">
            {data.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">
                    {item.prestationNom || 'Service'} 
                    {item.quantite > 1 && <span className="text-gray-600"> (×{item.quantite})</span>}
                  </span>
                  {item.options && item.options.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      Options: {item.options.map((opt: any) => opt.nom).join(', ')}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-gray-700">
                  {formaterPrix(item.sousTotal || 0)}
                </span>
              </div>
            ))}
            
            {data.majoration_date > 0 && (
              <div className="flex justify-between items-center bg-amber-50 p-2 rounded border border-amber-200">
                <span className="text-amber-700 font-medium">Majoration date (+{data.majoration_date}%)</span>
                <span className="font-semibold text-amber-700">
                  +{formaterPrix((data.sous_total * data.majoration_date) / 100)}
                </span>
              </div>
            )}
          </div>
        );
      }
      
      return <div className="text-gray-500 italic">Détails indisponibles</div>;
      
    } catch (error) {
      return <div className="text-red-500 text-sm">Erreur affichage prestations</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        <span className="ml-4 text-gray-600">📡 Chargement réservations depuis Supabase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            📋 Gestion des Réservations
          </span>
        </h2>
        <p className="text-center text-gray-600">Suivez et gérez toutes vos demandes de réservation</p>
        
        <div className="flex justify-center mt-4">
          <button
            onClick={forceReload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            🔄 Actualiser depuis Supabase
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total réservations</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-amber-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.en_attente}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.confirme}</div>
              <div className="text-sm text-gray-600">Confirmées</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-rose-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600">{formaterPrix(stats.chiffre_affaires)}</div>
              <div className="text-sm text-gray-600">Chiffre d'affaires</div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets de filtrage */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { key: 'toutes', label: 'Toutes', count: stats.total },
            { key: 'en_attente', label: 'En attente', count: stats.en_attente },
            { key: 'confirme', label: 'Confirmées', count: stats.confirme },
            { key: 'refuse', label: 'Refusées', count: stats.refuse }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Liste des réservations */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {activeTab === 'toutes' ? 'Aucune réservation' : `Aucune réservation ${activeTab.replace('_', ' ')}`}
              </h3>
              <p className="text-gray-600">Les nouvelles réservations apparaîtront ici</p>
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h4 className="text-lg font-bold text-gray-800">
                        {reservation.client_nom}
                      </h4>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.statut)}`}>
                        {getStatusIcon(reservation.statut)} {reservation.statut.replace('_', ' ').toUpperCase()}
                      </div>
                      
                      {reservation.devis_id && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Devis #{reservation.devis_id}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">📧 Email:</span>
                        <br />
                        {reservation.client_email}
                      </div>
                      
                      {reservation.client_telephone && (
                        <div>
                          <span className="font-medium">📞 Téléphone:</span>
                          <br />
                          {reservation.client_telephone}
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium">📅 Date événement:</span>
                        <br />
                        {new Date(reservation.date_evenement).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Prestations avec affichage propre */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-700">🛍️ Services commandés:</span>
                        <span className="text-xl font-bold text-rose-600">
                          {formaterPrix(reservation.montant)}
                        </span>
                      </div>
                      
                      {renderPrestations(reservation.prestations)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-6 flex flex-col space-y-2">
                    
                    {/* Changer statut */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'confirme')}
                        disabled={reservation.statut === 'confirme'}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
                      >
                        ✅ Confirmer
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'refuse')}
                        disabled={reservation.statut === 'refuse'}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
                      >
                        ❌ Refuser
                      </button>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => handleDelete(reservation.id)}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    >
                      🗑️ Supprimer
                    </button>

                    {/* Date de création */}
                    <div className="text-xs text-gray-500 text-center">
                      {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsView;