import React, { useState } from 'react';
import ServiceSelector from '../components/devis/ServiceSelector';
import DateSelector from '../components/devis/DateSelector';
import PDFPreview from '../components/devis/PDFPreview';
import FinalForm from '../components/devis/FinalForm';
import { useDevis } from '../hooks/useDevis';
import { formaterPrix } from '../utils/devisCalculator';

type EtapeDevis = 'selection' | 'date' | 'formulaire';

const Devis: React.FC = () => {
  const [etapeActuelle, setEtapeActuelle] = useState<EtapeDevis>('selection');
  const [selectedDate, setSelectedDate] = useState("");
  const [majoration, setMajoration] = useState(0);
  const { devis, estVide } = useDevis();

  const passerAEtapeSuivante = () => {
    if (etapeActuelle === 'selection' && !estVide) {
      setEtapeActuelle('date');
    } else if (etapeActuelle === 'date' && devis.dateEvenement) {
      setEtapeActuelle('formulaire');
    }
  };

  const retournerEtapePrecedente = () => {
    if (etapeActuelle === 'formulaire') {
      setEtapeActuelle('date');
    } else if (etapeActuelle === 'date') {
      setEtapeActuelle('selection');
    }
  };

  const finaliserDevis = () => {
    setEtapeActuelle('formulaire');
  };

  const onSuccessFormulaire = () => {
    setEtapeActuelle('selection');
  };

  if (etapeActuelle === 'formulaire') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-peach-50 py-8">
        <div className="container mx-auto px-4">
          <FinalForm
            onRetour={retournerEtapePrecedente}
            onSuccess={onSuccessFormulaire}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-peach-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors text-lg"
              >
                ← Retour
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                ✨ Simulateur de Devis
              </h1>
            </div>

            {/* Indicateur total */}
            <div className="text-right">
              <p className="text-sm text-gray-600">Total estimé</p>
              <p className="text-2xl font-bold text-rose-600">
                {estVide ? '0,00 €' : formaterPrix(devis.total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne principale - UNIQUE */}
          <div className="lg:col-span-2 space-y-8">
            {etapeActuelle === 'selection' && (
              <>
                <ServiceSelector />
                
                {!estVide && (
                  <div className="text-center">
                    <button
                      onClick={passerAEtapeSuivante}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                    >
                      Continuer → Sélection de date
                    </button>
                  </div>
                )}
              </>
            )}

            {etapeActuelle === 'date' && (
              <>
                <DateSelector
                  onDateSelect={(date, majoration) => {
                    setSelectedDate(date);
                    setMajoration(majoration);
                    // Synchroniser avec le système de devis
                    import("../hooks/useDevis").then(module => {
                      // On pourrait ajouter une fonction pour mettre à jour la date
                    });
                  }}
                  selectedDate={selectedDate}
                />
                
                <div className="flex justify-between">
                  <button
                    onClick={retournerEtapePrecedente}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    ← Retour prestations
                  </button>
                  
                  {selectedDate && (
                    <button
                      onClick={passerAEtapeSuivante}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Finaliser le devis →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar - Aperçu PDF élégant */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PDFPreview onFinaliser={finaliserDevis} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Devis;
