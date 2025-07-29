import React from 'react';
import { useDevis } from '../../hooks/useDevis';
import { formaterPrix } from '../../utils/devisCalculator';
import PDFPreview from './PDFPreview';

interface DevisSummaryProps {
  className?: string;
  onFinaliser?: () => void;
}

const DevisSummary: React.FC<DevisSummaryProps> = ({ 
  className = '', 
  onFinaliser 
}) => {
  const { devis, estVide } = useDevis();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Résumé rapide */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white">
          <h3 className="text-xl font-bold mb-1">💰 Résumé rapide</h3>
          {estVide ? (
            <p className="opacity-90 text-sm">Aucune sélection</p>
          ) : (
            <p className="opacity-90 text-sm">{devis.items.length} prestation(s) | Total: {formaterPrix(devis.total)}</p>
          )}
        </div>
        
        <div className="p-4">
          <button
            onClick={onFinaliser}
            disabled={!devis.dateEvenement || estVide}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
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

      {/* Aperçu PDF complet */}
      <PDFPreview />
    </div>
  );
};

export default DevisSummary;
