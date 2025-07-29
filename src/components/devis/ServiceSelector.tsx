import React, { useState } from 'react';
import { useDevis } from '../../hooks/useDevis';
import { usePrestations } from '../../hooks/usePrestations';
import { formaterPrix } from '../../utils/devisCalculator';

interface ServiceSelectorProps {
  className?: string;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { 
    ajouterItem, 
    supprimerItem, 
    modifierQuantite, 
    toggleOption,
    getQuantiteItem, 
    isOptionSelectionnee, 
    getSousTotalItem 
  } = useDevis();
  const { getPrestationsByCategory } = usePrestations();

  const categories = [
    { id: 'anniversaire', nom: 'Anniversaires', emoji: '🎂', color: 'from-pink-300 to-yellow-300' },
    { id: 'babyshower', nom: 'Baby Showers', emoji: '🍼', color: 'from-blue-200 to-pink-200' },
    { id: 'bapteme', nom: 'Baptêmes', emoji: '⛪', color: 'from-blue-100 to-purple-100' },
    { id: 'gender-reveal', nom: 'Gender Reveals', emoji: '🎈', color: 'from-pink-200 to-blue-200' },
    { id: 'mariage', nom: 'Mariages', emoji: '💒', color: 'from-rose-200 to-amber-200' }
  ];

  const prestationsCategory = selectedCategory ? getPrestationsByCategory(selectedCategory) : [];

  const handleQuantiteChange = (prestationId: string, delta: number) => {
    const quantiteActuelle = getQuantiteItem(prestationId);
    const nouvelleQuantite = Math.max(0, quantiteActuelle + delta);
    
    if (nouvelleQuantite === 0) {
      supprimerItem(prestationId);
    } else if (quantiteActuelle === 0) {
      ajouterItem(prestationId);
    } else {
      modifierQuantite(prestationId, nouvelleQuantite);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            ✨ Choisissez vos prestations
          </span>
        </h2>
        <p className="text-lg text-gray-600">Sélectionnez d'abord une catégorie, puis personnalisez vos services</p>
      </div>

      {/* Étape 1 : Sélection catégorie */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${category.color} border border-white/50`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{category.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{category.nom}</h3>
                <p className="text-gray-700">
                  {getPrestationsByCategory(category.id).length} service{getPrestationsByCategory(category.id).length > 1 ? 's' : ''} disponible{getPrestationsByCategory(category.id).length > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Étape 2 : Services de la catégorie sélectionnée */}
      {selectedCategory && (
        <div className="space-y-6">
          
          {/* Header catégorie + retour */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedCategory('')}
                className="p-3 rounded-2xl bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all text-gray-600 hover:text-gray-800"
              >
                ← Retour catégories
              </button>
              <div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {categories.find(c => c.id === selectedCategory)?.emoji} {categories.find(c => c.id === selectedCategory)?.nom}
                </h3>
                <p className="text-gray-600">{prestationsCategory.length} service{prestationsCategory.length > 1 ? 's' : ''} disponible{prestationsCategory.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Liste des prestations UNE SEULE COLONNE */}
          <div className="space-y-6">
            {prestationsCategory.map(prestation => {
              const quantite = getQuantiteItem(prestation.id);
              const sousTotal = getSousTotalItem(prestation.id);
              const isSelected = quantite > 0;

              return (
                <div
                  key={prestation.id}
                  className={`bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border transition-all duration-300 ${
                    isSelected 
                      ? 'border-rose-300 shadow-xl ring-4 ring-rose-200' 
                      : 'border-white/50 hover:shadow-xl'
                  }`}
                >
                  <div className="p-8">
                    
                    {/* Header prestation */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-2xl font-bold text-gray-800">{prestation.nom}</h4>
                          {isSelected && (
                            <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                              <span>✓</span>
                              <span>×{quantite}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-lg mb-4">{prestation.description}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl font-bold text-rose-600">
                            {formaterPrix(prestation.prixBase)}
                          </span>
                          <span className="text-sm bg-gradient-to-r from-rose-100 to-pink-100 px-3 py-1 rounded-full text-rose-700">
                            Prix de base
                          </span>
                        </div>
                      </div>

                      {/* Contrôles quantité */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleQuantiteChange(prestation.id, -1)}
                          disabled={quantite === 0}
                          className="w-12 h-12 rounded-2xl bg-white/80 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-bold text-rose-600 shadow-md hover:shadow-lg text-xl"
                        >
                          −
                        </button>
                        
                        <div className="text-center min-w-[100px]">
                          <div className="text-3xl font-bold text-gray-800">{quantite}</div>
                          <div className="text-sm text-gray-600">quantité</div>
                        </div>
                        
                        <button
                          onClick={() => handleQuantiteChange(prestation.id, 1)}
                          className="w-12 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white transition-all duration-200 flex items-center justify-center font-bold shadow-md hover:shadow-lg text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Options (si prestation sélectionnée) */}
                    {isSelected && prestation.options && prestation.options.length > 0 && (
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h5 className="text-xl font-bold text-gray-800 mb-4">✨ Options supplémentaires</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {prestation.options?.map(option => (
                            <div
                              key={option.id}
                              onClick={() => toggleOption(prestation.id, option.id)}
                              className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                                isOptionSelectionnee(prestation.id, option.id)
                                  ? 'bg-rose-100 border-rose-300 shadow-md' 
                                  : 'bg-white/80 border-gray-200 hover:bg-white hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                      isOptionSelectionnee(prestation.id, option.id) 
                                        ? 'bg-rose-500 border-rose-500' 
                                        : 'border-gray-300'
                                    }`}>
                                      {isOptionSelectionnee(prestation.id, option.id) && (
                                        <span className="text-white text-sm">✓</span>
                                      )}
                                    </div>
                                    <span className="font-medium text-gray-800">{option.nom}</span>
                                  </div>
                                  {option.description && (
                                    <p className="text-sm text-gray-600 mt-2 ml-8">{option.description}</p>
                                  )}
                                </div>
                                <span className="font-bold text-rose-600 ml-3">
                                  +{formaterPrix(option.prix)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sous-total (si prestation sélectionnée) */}
                    {isSelected && (
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-800">Sous-total cette prestation:</span>
                          <span className="text-3xl font-bold text-rose-600">
                            {formaterPrix(sousTotal)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {prestationsCategory.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun service disponible</h3>
                <p className="text-gray-600">Cette catégorie ne contient pas encore de services.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;
