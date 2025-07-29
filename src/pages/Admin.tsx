import React, { useState, useMemo, useCallback } from 'react';
import { AdminSection } from '../utils/types';

// Import du nouveau hook Supabase
import { usePrestations } from '../hooks/usePrestations';
import { formaterPrix } from '../utils/devisCalculator';

// Import des nouveaux composants
import CalendarView from '../components/admin/Calendar/CalendarView';
import PlanningView from '../components/admin/Planning/PlanningView';
import ReservationsView from '../components/admin/Reservations/ReservationsView';
import SettingsView from '../components/admin/Settings/SettingsView';
import GalleryView from '../components/admin/views/GalleryView';

// ✅ SORTIR LES CONSTANTES DU COMPOSANT (TRÈS IMPORTANT POUR LE FOCUS)
const SECTIONS: AdminSection[] = [
  { id: 'prestations', nom: 'Prestations', icon: '🛍️' },
  { id: 'calendrier', nom: 'Calendrier', icon: '📅' },
  { id: 'planning', nom: 'Planning', icon: '📋' },
  { id: 'reservations', nom: 'Réservations', icon: '📝' },
  { id: 'galerie', nom: 'Galerie', icon: '📸' },
  { id: 'parametres', nom: 'Paramètres', icon: '⚙️' }
];

const CATEGORIES = [
  { id: 'anniversaire', nom: 'Anniversaires', color: 'from-pink-200 to-yellow-200' },
  { id: 'babyshower', nom: 'Baby Showers', color: 'from-blue-200 to-pink-200' },
  { id: 'bapteme', nom: 'Baptêmes', color: 'from-blue-100 to-purple-100' },
  { id: 'gender-reveal', nom: 'Gender Reveals', color: 'from-pink-200 to-blue-200' },
  { id: 'mariage', nom: 'Mariages', color: 'from-rose-200 to-amber-200' }
];

const Admin: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection['id']>('prestations');
  
  // ✅ NOUVEAU: Utilisation du hook Supabase
  const { 
    prestations, 
    loading, 
    error,
    addPrestation, 
    addOption,
    deleteOption,
    toggleActive,
    deletePrestation
  } = usePrestations();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddingPrestation, setIsAddingPrestation] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState<string | null>(null);

  const [newPrestation, setNewPrestation] = useState({
    nom: '',
    description: '',
    prixBase: 0,
    categorie: 'anniversaire' as const
  });

  const [newOption, setNewOption] = useState({
    nom: '',
    description: '',
    prix: 0
  });

  // ✅ MEMOISER les prestations filtrées pour éviter les re-renders
  const filteredPrestations = useMemo(() => {
    return selectedCategory 
      ? prestations.filter(p => p.categorie === selectedCategory)
      : prestations;
  }, [prestations, selectedCategory]);

  // ✅ HANDLERS STABLES avec useCallback
  const handleAddPrestation = useCallback(async () => {
    if (!newPrestation.nom.trim()) return;

    const prestationData = {
      nom: newPrestation.nom,
      description: newPrestation.description,
      prixBase: newPrestation.prixBase,
      categorie: newPrestation.categorie,
      active: true,
      image: "",
      couleurTheme: CATEGORIES.find(c => c.id === newPrestation.categorie)?.color || "from-rose-200 to-pink-200"
    };

    const result = await addPrestation(prestationData);
    if (result) {
      setNewPrestation({ nom: '', description: '', prixBase: 0, categorie: 'anniversaire' });
      setIsAddingPrestation(false);
    }
  }, [newPrestation, addPrestation]);

  const handleAddOption = useCallback(async (prestationId: string) => {
    if (!newOption.nom.trim()) return;

    const result = await addOption(prestationId, newOption);
    if (result) {
      setNewOption({ nom: '', description: '', prix: 0 });
      setIsAddingOption(null);
    }
  }, [newOption, addOption]);

  const handleDeleteOption = useCallback(async (prestationId: string, optionId: string) => {
    if (window.confirm('Supprimer cette option ?')) {
      await deleteOption(prestationId, optionId);
    }
  }, [deleteOption]);

  const handleToggleActive = useCallback(async (id: string) => {
    await toggleActive(id);
  }, [toggleActive]);

  const handleDeletePrestation = useCallback(async (id: string) => {
    if (window.confirm('Supprimer cette prestation ?')) {
      await deletePrestation(id);
    }
  }, [deletePrestation]);

  // ✅ FONCTIONS DE RENDU STABLES
  const renderPrestationsContent = useCallback(() => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar catégories */}
      <div className="lg:col-span-1">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-rose-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">📂 Catégories</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                selectedCategory === '' 
                  ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg' 
                  : 'bg-white/80 hover:bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <div className="font-medium">Toutes les catégories</div>
              <div className="text-sm opacity-80">{prestations.length} prestations</div>
            </button>

            {CATEGORIES.map(category => {
              const count = prestations.filter(p => p.categorie === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${
                    selectedCategory === category.id 
                      ? `bg-gradient-to-r ${category.color} shadow-lg transform scale-105` 
                      : 'bg-white/80 hover:bg-white text-gray-700 hover:shadow-md'
                  }`}
                >
                  <div className="font-medium">{category.nom}</div>
                  <div className="text-sm opacity-80">{count} prestation{count > 1 ? 's' : ''}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsAddingPrestation(true)}
            className="w-full mt-6 p-4 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-2xl font-medium hover:from-amber-500 hover:to-yellow-500 transition-all transform hover:scale-105 shadow-lg"
          >
            ✨ Nouvelle prestation
          </button>
        </div>
      </div>

      {/* Zone principale prestations */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* ✅ Affichage du loading et erreurs */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Chargement des prestations...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        {/* Formulaire nouvelle prestation */}
        {isAddingPrestation && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-rose-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">✨ Nouvelle prestation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la prestation</label>
                <input
                  type="text"
                  value={newPrestation.nom}
                  onChange={(e) => setNewPrestation(prev => ({...prev, nom: e.target.value}))}
                  className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  placeholder="Ex: Anniversaire Licorne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix de base (€)</label>
                <input
                  type="number"
                  value={newPrestation.prixBase}
                  onChange={(e) => setNewPrestation(prev => ({...prev, prixBase: Number(e.target.value)}))}
                  className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newPrestation.description}
                onChange={(e) => setNewPrestation(prev => ({...prev, description: e.target.value}))}
                className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all h-24"
                placeholder="Décrivez la prestation..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={newPrestation.categorie}
                onChange={(e) => setNewPrestation(prev => ({...prev, categorie: e.target.value as any}))}
                className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleAddPrestation}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-2xl font-medium hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Ajouter
              </button>
              <button
                onClick={() => setIsAddingPrestation(false)}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ✅ Formulaire nouvelle option */}
        {isAddingOption && (
          <div className="bg-blue-50 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Nouveau service</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du service</label>
                <input
                  type="text"
                  value={newOption.nom}
                  onChange={(e) => setNewOption(prev => ({...prev, nom: e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Ex: Arche de ballons"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                <input
                  type="number"
                  value={newOption.prix}
                  onChange={(e) => setNewOption(prev => ({...prev, prix: Number(e.target.value)}))}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newOption.description}
                onChange={(e) => setNewOption(prev => ({...prev, description: e.target.value}))}
                className="w-full px-3 py-2 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all h-20"
                placeholder="Décrivez le service..."
              />
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleAddOption(isAddingOption)}
                disabled={loading}
                className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50"
              >
                💾 Ajouter
              </button>
              <button
                onClick={() => setIsAddingOption(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des prestations */}
        <div className="space-y-6">
          {filteredPrestations.map(prestation => (
            <div key={prestation.id} className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-rose-100 overflow-hidden">
              
              {/* Header prestation */}
              <div className={`p-6 bg-gradient-to-r ${prestation.couleurTheme}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{prestation.nom}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        prestation.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {prestation.active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{prestation.description}</p>
                    <p className="text-2xl font-bold text-rose-700">{formaterPrix(prestation.prixBase)}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleActive(prestation.id)}
                      className="p-2 bg-white/80 rounded-xl hover:bg-white transition-all"
                      title={prestation.active ? 'Désactiver' : 'Activer'}
                      disabled={loading}
                    >
                      {prestation.active ? '🔘' : '⭕'}
                    </button>
                    <button
                      onClick={() => handleDeletePrestation(prestation.id)}
                      className="p-2 bg-white/80 rounded-xl hover:bg-white transition-all text-red-600"
                      title="Supprimer"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* ✅ Options avec fonctionnalités complètes */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-gray-800">🛠️ Options ({prestation.options.length})</h4>
                  <button
                    onClick={() => setIsAddingOption(prestation.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    ➕ Ajouter un service
                  </button>
                </div>

                {prestation.options.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 italic">Aucune option disponible</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prestation.options.map(option => (
                      <div key={option.id} className="bg-gray-50 rounded-xl p-4 border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800">{option.nom}</h5>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            <p className="text-lg font-bold text-blue-600 mt-2">{formaterPrix(option.prix)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteOption(prestation.id, option.id)}
                            className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
                            title="Supprimer cette option"
                            disabled={loading}
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredPrestations.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune prestation trouvée</h3>
              <p className="text-gray-600">
                {selectedCategory 
                  ? `Aucune prestation dans la catégorie "${CATEGORIES.find(c => c.id === selectedCategory)?.nom}"`
                  : "Aucune prestation disponible"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  ), [prestations, selectedCategory, filteredPrestations, loading, error, isAddingPrestation, isAddingOption, newPrestation, newOption, handleAddPrestation, handleAddOption, handleDeleteOption, handleToggleActive, handleDeletePrestation]);

  // Fonction pour afficher le contenu selon la section active
  const renderContent = useCallback(() => {
    switch (activeSection) {
      case 'prestations':
        return renderPrestationsContent();
      case 'calendrier':
        return <CalendarView />;
      case 'planning':
        return <PlanningView />;
      case 'reservations':
        return <ReservationsView />;
      case 'galerie':
        return <GalleryView />;
      case 'parametres':
        return <SettingsView />;
      default:
        return renderPrestationsContent();
    }
  }, [activeSection, renderPrestationsContent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-peach-50">
      {/* Header élégant */}
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
                {SECTIONS.find(s => s.id === activeSection)?.nom}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Sidebar navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-rose-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">📂 Navigation</h2>
              
              <div className="space-y-3">
                {SECTIONS.map(section => (
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

              {/* Raccourcis rapides */}
              <div className="mt-8 pt-6 border-t border-rose-200">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Raccourcis</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveSection('calendrier')}
                    className="w-full p-2 text-sm bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors"
                  >
                    📅 Voir calendrier
                  </button>
                  <button 
                    onClick={() => setActiveSection('planning')}
                    className="w-full p-2 text-sm bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    📋 Voir planning
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Zone principale */}
          <div className="lg:col-span-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
