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

// ✅ CONSTANTES OPTIMISÉES MOBILE
const SECTIONS: (AdminSection & { shortName: string })[] = [
  { id: 'prestations', nom: 'Prestations', icon: '🛍️', shortName: 'Services' },
  { id: 'calendrier', nom: 'Calendrier', icon: '📅', shortName: 'Agenda' },
  { id: 'planning', nom: 'Planning', icon: '📋', shortName: 'Planning' },
  { id: 'reservations', nom: 'Réservations', icon: '📝', shortName: 'Demandes' },
  { id: 'galerie', nom: 'Galerie', icon: '📸', shortName: 'Photos' },
  { id: 'parametres', nom: 'Paramètres', icon: '⚙️', shortName: 'Config' }
];

const CATEGORIES = [
  { id: 'anniversaire', nom: 'Anniversaires', color: 'from-pink-200 to-yellow-200', shortName: 'Anniv' },
  { id: 'babyshower', nom: 'Baby Showers', color: 'from-blue-200 to-pink-200', shortName: 'Baby' },
  { id: 'bapteme', nom: 'Baptêmes', color: 'from-blue-100 to-purple-100', shortName: 'Baptême' },
  { id: 'gender-reveal', nom: 'Gender Reveals', color: 'from-pink-200 to-blue-200', shortName: 'Gender' },
  { id: 'mariage', nom: 'Mariages', color: 'from-rose-200 to-amber-200', shortName: 'Mariage' }
];

const Admin: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection['id']>('prestations');
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  // ✅ Hook Supabase
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

  // ✅ MEMOISER les prestations filtrées
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

  // Fermer nav mobile quand on change de section
  const handleSectionChange = (sectionId: AdminSection['id']) => {
    setActiveSection(sectionId);
    setShowMobileNav(false);
  };

  // ✅ RENDERING PRESTATIONS MOBILE-FIRST
  const renderPrestationsContent = useCallback(() => (
    <div className="space-y-6">
      
      {/* ✅ Mobile: Categories Pills Compact */}
      <div className="md:hidden">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === '' 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({prestations.length})
            </button>

            {CATEGORIES.map(category => {
              const count = prestations.filter(p => p.categorie === category.id).length;
              const emoji = {
                'anniversaire': '🎂',
                'babyshower': '👶', 
                'bapteme': '⛪',
                'gender-reveal': '🎈',
                'mariage': '💒'
              }[category.id] || '🎯';
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1 ${
                    selectedCategory === category.id 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{category.shortName} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ Desktop: Sidebar + Content Grid */}
      <div className="hidden md:grid md:grid-cols-4 gap-6">
        {/* Sidebar catégories Desktop */}
        <div className="md:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-rose-100 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">📂 Catégories</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full p-4 rounded-xl text-left transition-all ${
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
                    className={`w-full p-4 rounded-xl text-left transition-all ${
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
              className="w-full mt-6 p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg touch-manipulation"
            >
              + Nouveau service
            </button>
          </div>
        </div>

        {/* Zone principale prestations Desktop */}
        <div className="md:col-span-3">
          {renderPrestationsList()}
        </div>
      </div>

      {/* ✅ Mobile: Prestations directement */}
      <div className="md:hidden">
        {renderPrestationsList()}
      </div>

      {/* ✅ BOUTON + FLOTTANT MOBILE pour prestations seulement */}
      {activeSection === 'prestations' && (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <button
            onClick={() => setIsAddingPrestation(true)}
            className="w-14 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center text-2xl font-bold touch-manipulation"
          >
            +
          </button>
        </div>
      )}
    </div>
  ), [prestations, selectedCategory, filteredPrestations, loading, error, isAddingPrestation, isAddingOption, newPrestation, newOption]);

  // ✅ RENDER PRESTATIONS LIST (MOBILE-FIRST)
  const renderPrestationsList = () => (
    <div className="space-y-4">
      
      {/* ✅ Loading et erreurs */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-gray-600">Chargement des prestations...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* Formulaire nouvelle prestation - MOBILE OPTIMIZED */}
      {isAddingPrestation && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-rose-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">✨ Nouvelle prestation</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la prestation</label>
              <input
                type="text"
                value={newPrestation.nom}
                onChange={(e) => setNewPrestation(prev => ({...prev, nom: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all touch-manipulation"
                placeholder="Ex: Anniversaire Licorne"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix de base (€)</label>
                <input
                  type="number"
                  value={newPrestation.prixBase}
                  onChange={(e) => setNewPrestation(prev => ({...prev, prixBase: Number(e.target.value)}))}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  value={newPrestation.categorie}
                  onChange={(e) => setNewPrestation(prev => ({...prev, categorie: e.target.value as any}))}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all touch-manipulation"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newPrestation.description}
                onChange={(e) => setNewPrestation(prev => ({...prev, description: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all h-20 resize-none touch-manipulation"
                placeholder="Décrivez la prestation..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleAddPrestation}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-medium hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                💾 Ajouter
              </button>
              <button
                onClick={() => setIsAddingPrestation(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all touch-manipulation"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Formulaire nouvelle option - MOBILE */}
      {isAddingOption && (
        <div className="bg-blue-50 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">➕ Nouveau service</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du service</label>
              <input
                type="text"
                value={newOption.nom}
                onChange={(e) => setNewOption(prev => ({...prev, nom: e.target.value}))}
                className="w-full px-3 py-3 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all touch-manipulation"
                placeholder="Ex: Arche de ballons"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                <input
                  type="number"
                  value={newOption.prix}
                  onChange={(e) => setNewOption(prev => ({...prev, prix: Number(e.target.value)}))}
                  className="w-full px-3 py-3 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all touch-manipulation"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newOption.description}
                  onChange={(e) => setNewOption(prev => ({...prev, description: e.target.value}))}
                  className="w-full px-3 py-3 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all touch-manipulation"
                  placeholder="Décrizez le service..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAddOption(isAddingOption)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50 touch-manipulation"
              >
                💾 Ajouter
              </button>
              <button
                onClick={() => setIsAddingOption(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all touch-manipulation"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des prestations - MOBILE OPTIMIZED */}
      <div className="space-y-4">
        {filteredPrestations.map(prestation => (
          <div key={prestation.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
            
            {/* Header prestation - MOBILE LAYOUT */}
            <div className={`p-4 sm:p-6 bg-gradient-to-r ${prestation.couleurTheme}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">{prestation.nom}</h3>
                    <span className={`self-start px-3 py-1 rounded-full text-xs font-medium ${
                      prestation.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {prestation.active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">{prestation.description}</p>
                  <p className="text-xl sm:text-2xl font-bold text-rose-700">{formaterPrix(prestation.prixBase)}</p>
                </div>
                
                {/* Actions Mobile Stack */}
                <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                  <button
                    onClick={() => handleToggleActive(prestation.id)}
                    className="p-2 bg-white/80 rounded-xl hover:bg-white transition-all touch-manipulation"
                    title={prestation.active ? 'Désactiver' : 'Activer'}
                    disabled={loading}
                  >
                    {prestation.active ? '🔘' : '⭕'}
                  </button>
                  <button
                    onClick={() => handleDeletePrestation(prestation.id)}
                    className="p-2 bg-white/80 rounded-xl hover:bg-white transition-all text-red-600 touch-manipulation"
                    title="Supprimer"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ Options - MOBILE LAYOUT */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h4 className="text-base sm:text-lg font-bold text-gray-800">
                  Options ({prestation.options.length})
                </h4>
                <button
                  onClick={() => setIsAddingOption(prestation.id)}
                  className="self-start px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium touch-manipulation"
                >
                  + Ajouter service
                </button>
              </div>

              {prestation.options.length === 0 ? (
                <p className="text-center text-gray-500 py-4 italic text-sm">Aucune option disponible</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prestation.options.map(option => (
                    <div key={option.id} className="bg-gray-50 rounded-xl p-3 sm:p-4 border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <h5 className="font-semibold text-gray-800 text-sm sm:text-base">{option.nom}</h5>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">{option.description}</p>
                          <p className="text-base sm:text-lg font-bold text-blue-600 mt-2">{formaterPrix(option.prix)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteOption(prestation.id, option.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors touch-manipulation"
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
            <div className="text-4xl sm:text-6xl mb-4">📋</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Aucune prestation trouvée</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {selectedCategory 
                ? `Aucune prestation dans la catégorie "${CATEGORIES.find(c => c.id === selectedCategory)?.nom}"`
                : "Aucune prestation disponible"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );

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

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-peach-50 pb-20 sm:pb-8">
      
      {/* ✅ HEADER MOBILE-FIRST - REMIS PARTOUT */}
      <div className="bg-white shadow-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between sm:hidden">
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="p-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors touch-manipulation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-bold text-gray-900">Admin RomEden</h1>
              <p className="text-xs text-gray-600">{currentSection?.nom}</p>
            </div>

            <div className="p-2">
              <span className="text-2xl">{currentSection?.icon}</span>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900">
                Administration RomEden
              </h1>
              <p className="text-gray-600 text-base lg:text-lg">Gérez votre activité RomEden Events</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Section active</p>
              <p className="text-xl lg:text-2xl font-bold text-rose-600">
                {currentSection?.nom}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MOBILE NAVIGATION OVERLAY */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800">Navigation</h2>
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {SECTIONS.map(section => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all touch-manipulation ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{section.icon}</span>
                      <div>
                        <div className="font-medium">{section.nom}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 sm:px-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* ✅ DESKTOP: Sidebar + Content */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-8">
            
            {/* Sidebar navigation Desktop */}
            <div className="lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-rose-100 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Navigation</h2>
                
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
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Zone principale Desktop */}
            <div className="lg:col-span-4">
              {renderContent()}
            </div>
          </div>

          {/* ✅ MOBILE: Content Full Width */}
          <div className="lg:hidden">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* ✅ BOTTOM TAB BAR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 px-2 py-2 z-40 sm:hidden">
        <div className="flex justify-around">
          {SECTIONS.slice(0, 5).map(section => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all touch-manipulation ${
                activeSection === section.id
                  ? 'bg-rose-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span className="text-xs font-medium">{section.shortName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;