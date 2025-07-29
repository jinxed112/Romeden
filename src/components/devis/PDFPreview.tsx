import React from 'react';
import { useDevis } from '../../hooks/useDevis';
import { formaterPrix } from '../../utils/devisCalculator';
import { getPrestationById, getOptionById } from '../../utils/prestationsData';

interface PDFPreviewProps {
  className?: string;
  onFinaliser?: () => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ className = '', onFinaliser }) => {
  const { devis, estVide } = useDevis();
  const currentDate = new Date().toLocaleDateString('fr-FR');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Résumé rapide */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-400 to-pink-400 p-6 text-white">
          <h3 className="text-xl font-bold mb-2">💰 Votre Devis</h3>
          {estVide ? (
            <p className="opacity-90 text-sm">Aucune sélection</p>
          ) : (
            <div>
              <p className="opacity-90 text-sm">{devis.items.length} prestation(s)</p>
              <p className="text-2xl font-bold mt-2">{formaterPrix(devis.total)}</p>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <button
            onClick={onFinaliser}
            disabled={!devis.dateEvenement || estVide}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {estVide 
              ? '🛒 Ajoutez des prestations'
              : !devis.dateEvenement 
                ? '📅 Sélectionnez une date'
                : '✨ Finaliser le devis'
            }
          </button>
        </div>
      </div>

      {/* Aperçu PDF élégant */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">📄 Aperçu PDF</h3>
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl text-sm transition-colors">
              💾 Télécharger
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-inner p-6 text-sm">
            
            {/* En-tête PDF */}
            <div className="border-b-2 border-rose-200 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                    RomEden Events
                  </h1>
                  <p className="text-gray-600 text-sm">Créations magiques pour moments inoubliables</p>
                </div>
                <div className="text-right">
                  <div className="bg-rose-500 text-white px-3 py-2 rounded-lg text-center">
                    <p className="font-bold">DEVIS</p>
                    <p className="text-xs">N° 2025-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Date: {currentDate}</p>
                </div>
              </div>
            </div>

            {/* Infos événement */}
            <div className="mb-6">
              <h2 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">📋 Événement</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium text-rose-600">
                    {devis.dateEvenement 
                      ? devis.dateEvenement.toLocaleDateString('fr-FR')
                      : 'À sélectionner'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Client:</span>
                  <span className="ml-2 text-gray-400 italic">À remplir</span>
                </div>
              </div>
            </div>

            {/* Prestations sélectionnées */}
            <div className="mb-6">
              <h2 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">✨ Prestations</h2>
              
              {estVide ? (
                <div className="text-center py-6 text-gray-400 italic">
                  <p className="text-xs">Aucune prestation sélectionnée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {devis.items.map((item, index) => {
                    const prestation = getPrestationById(item.prestationId);
                    if (!prestation) return null;

                    return (
                      <div key={item.prestationId} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 text-sm">
                              {index + 1}. {prestation.nom}
                            </h3>
                            <p className="text-xs text-gray-600">{prestation.description}</p>
                            <p className="text-xs text-gray-700 mt-1">
                              {formaterPrix(prestation.prixBase)} × {item.quantite}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-gray-800">
                              {formaterPrix(prestation.prixBase * item.quantite)}
                            </p>
                          </div>
                        </div>

                        {/* Options */}
                        {item.optionsSelectionnees.length > 0 && (
                          <div className="ml-3 pl-3 border-l-2 border-rose-200 bg-rose-50 p-2 rounded-r">
                            <p className="text-xs font-medium text-gray-700 mb-1">Options:</p>
                            {item.optionsSelectionnees.map((optionId) => {
                              const option = getOptionById(optionId);
                              if (!option) return null;

                              return (
                                <div key={optionId} className="flex justify-between text-xs">
                                  <span className="text-gray-600">+ {option.nom}</span>
                                  <span className="text-gray-600">
                                    {formaterPrix(option.prix * item.quantite)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Sous-total:</span>
                          <span className="font-bold text-sm text-rose-600">{formaterPrix(item.sousTotal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Totaux */}
            {!estVide && (
              <div className="border-t-2 border-gray-300 pt-4">
                <h2 className="font-bold text-gray-800 mb-3">💰 Récapitulatif</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sous-total:</span>
                    <span className="font-semibold">{formaterPrix(devis.sousTotal)}</span>
                  </div>
                  
                  {devis.majorationDate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        Majoration (+{devis.majorationDate}%):
                      </span>
                      <span className="font-semibold text-orange-600">
                        {formaterPrix(devis.majorationMontant)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">TOTAL:</span>
                      <span className="text-lg font-bold text-rose-600">
                        {formaterPrix(devis.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {devis.total > 0 && (
                  <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Acompte 30%:</strong> {formaterPrix(devis.total * 0.3)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mentions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ ESTIMATION</strong> - Activité en phase test.<br/>
                  Ce devis n'est pas contractuel.
                </p>
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-600">
                  💖 L'équipe RomEden Events<br/>
                  Créateurs de moments magiques
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
