import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevis } from '../hooks/useDevis';
import { usePrestations } from '../hooks/usePrestations';
import { useReservations } from '../hooks/useReservations';
import { formaterPrix } from '../utils/devisCalculator';
import DateSelector from '../components/devis/DateSelector';

// Interface pour les données du formulaire
interface FormData {
  nom: string;
  email: string;
  telephone: string;
  typeEvenement: string;
  adresse: string;
  nombreInvites: number;
  theme: string;
  message: string;
}

const DevisUltra: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'category' | 'services' | 'date' | 'summary' | 'form' | 'success'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [majorationDate, setMajorationDate] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Données du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    email: '',
    telephone: '',
    typeEvenement: '',
    adresse: '',
    nombreInvites: 1,
    theme: '',
    message: ''
  });

  const {
    devis,
    estVide,
    ajouterItem,
    supprimerItem,
    modifierQuantite,
    toggleOption,
    getQuantiteItem,
    isOptionSelectionnee,
    getSousTotalItem,
    changerDate,
    dateEvenement,
    reinitialiserDevis
  } = useDevis();

  const { getPrestationsByCategory } = usePrestations();
  const { createReservation } = useReservations();

  const categories = [
    { 
      id: 'anniversaire', 
      nom: 'Anniversaires', 
      emoji: '🎂', 
      description: 'Décorations magiques pour enfants',
      count: 0
    },
    { 
      id: 'babyshower', 
      nom: 'Baby Showers', 
      emoji: '👶', 
      description: 'Célébrer l\'arrivée de bébé',
      count: 0
    },
    { 
      id: 'bapteme', 
      nom: 'Baptêmes', 
      emoji: '⛪', 
      description: 'Ambiances douces',
      count: 0
    },
    { 
      id: 'gender-reveal', 
      nom: 'Gender Reveals', 
      emoji: '🎈', 
      description: 'Révéler avec style',
      count: 0
    },
    { 
      id: 'mariage', 
      nom: 'Mariages', 
      emoji: '💒', 
      description: 'Créations premium',
      count: 0
    }
  ].map(cat => ({
    ...cat,
    count: getPrestationsByCategory(cat.id).length
  }));

  const prestationsCategory = selectedCategory ? getPrestationsByCategory(selectedCategory) : [];

  const totalAvecMajoration = () => {
    const sousTotal = devis.total;
    const majorationMontant = (sousTotal * majorationDate) / 100;
    return sousTotal + majorationMontant;
  };

  // Mettre à jour les données du formulaire
  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Soumettre le devis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateEvenement) {
      alert('Erreur: Date d\'événement manquante');
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données de la réservation
      const prestationsData = {
        items: devis.items.map(item => {
          // Récupérer les détails de la prestation
          const prestation = prestationsCategory.find(p => p.id === item.prestationId);
          return {
            prestationId: item.prestationId,
            prestationNom: prestation?.nom || 'Service',
            quantite: item.quantite,
            sousTotal: item.sousTotal,
            options: item.optionsSelectionnees.map(optionId => {
              // Trouver l'option dans les prestations
              let optionFound = null;
              for (const prest of prestationsCategory) {
                if (prest.options) {
                  optionFound = prest.options.find((opt: any) => opt.id === optionId);
                  if (optionFound) break;
                }
              }
              return optionFound;
            }).filter(Boolean)
          };
        }),
        sous_total: devis.total,
        majoration_date: majorationDate,
        total_final: totalAvecMajoration()
      };

      // Générer un ID de devis unique
      const devisId = `DV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Test avec version simplifiée d'abord
      const reservationData = {
        client_nom: formData.nom,
        client_email: formData.email,
        client_telephone: formData.telephone || '',
        date_evenement: dateEvenement.toISOString().split('T')[0], // Format YYYY-MM-DD
        montant: Math.round(totalAvecMajoration() * 100) / 100, // Arrondir à 2 décimales
        prestations: JSON.stringify(prestationsData), // Stocker en JSON
        statut: 'en_attente' as const
      };

      console.log('🔍 DEBUG - Données simplifiées:', reservationData);
      console.log('🔍 DEBUG - Types:', {
        client_nom: typeof reservationData.client_nom,
        client_email: typeof reservationData.client_email,
        client_telephone: typeof reservationData.client_telephone,
        date_evenement: typeof reservationData.date_evenement,
        montant: typeof reservationData.montant,
        prestations: typeof reservationData.prestations,
        statut: typeof reservationData.statut
      });

      console.log('📤 Envoi réservation:', reservationData);

      const result = await createReservation(reservationData);

      if (result) {
        console.log('✅ Réservation créée avec succès:', result.id);
        setCurrentStep('success');
        
        // Optionnel: Réinitialiser le devis après succès
        setTimeout(() => {
          reinitialiserDevis();
          setFormData({
            nom: '',
            email: '',
            telephone: '',
            typeEvenement: '',
            adresse: '',
            nombreInvites: 1,
            theme: '',
            message: ''
          });
        }, 3000);
      } else {
        throw new Error('Échec de création de la réservation');
      }

    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      alert('❌ Erreur lors de l\'envoi du devis. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleDateSelect = (dateStr: string, majoration: number) => {
    changerDate(new Date(dateStr));
    setMajorationDate(majoration);
  };

  const nextStep = () => {
    if (currentStep === 'category' && selectedCategory) {
      setCurrentStep('services');
    } else if (currentStep === 'services' && !estVide) {
      setCurrentStep('date');
    } else if (currentStep === 'date' && dateEvenement) {
      setCurrentStep('summary');
    } else if (currentStep === 'summary') {
      setCurrentStep('form');
    }
  };

  const prevStep = () => {
    if (currentStep === 'form') setCurrentStep('summary');
    else if (currentStep === 'summary') setCurrentStep('date');
    else if (currentStep === 'date') setCurrentStep('services');
    else if (currentStep === 'services') setCurrentStep('category');
  };

  const getStepProgress = () => {
    const steps = ['category', 'services', 'date', 'summary', 'form'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  // Fonction pour recommencer un nouveau devis
  const startNewQuote = () => {
    reinitialiserDevis();
    setSelectedCategory('');
    setMajorationDate(0);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      typeEvenement: '',
      adresse: '',
      nombreInvites: 1,
      theme: '',
      message: ''
    });
    setCurrentStep('category');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      
      {/* Header Mobile Premium */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-orange-100/50 sticky top-0 z-50">
        <div className="px-4 py-4">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 text-center mx-4">
              <h1 className="text-lg font-bold text-gray-900">Créateur de Devis</h1>
              <p className="text-xs text-gray-500 capitalize">
                {currentStep === 'category' && 'Choisissez votre style'}
                {currentStep === 'services' && 'Sélectionnez vos services'}
                {currentStep === 'date' && 'Choisissez la date'}
                {currentStep === 'summary' && 'Résumé final'}
                {currentStep === 'form' && 'Vos informations'}
                {currentStep === 'success' && 'Demande envoyée !'}
              </p>
            </div>

            {currentStep !== 'success' && (
              <div className="text-right">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-lg font-bold text-orange-600">
                  {formaterPrix(totalAvecMajoration())}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {currentStep !== 'success' && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-rose-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          
          {/* Étape 1: Catégories - Grid Moderne */}
          {currentStep === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ✨ Nos Services Premium
                </h2>
                <p className="text-gray-600">Choisissez votre type d'événement</p>
              </div>

              <div className="space-y-3">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setTimeout(() => nextStep(), 150);
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50 hover:shadow-md transition-all duration-200 touch-manipulation"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{category.emoji}</div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-gray-900">{category.nom}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                          {category.count} service{category.count > 1 ? 's' : ''}
                        </div>
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Étape 2: Services - Cards Compactes Mobile */}
          {currentStep === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Header avec navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevStep}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Catégories</span>
                </button>

                <div className="text-center flex-1 mx-4">
                  <div className="text-2xl mb-1">
                    {categories.find(c => c.id === selectedCategory)?.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {categories.find(c => c.id === selectedCategory)?.nom}
                  </h3>
                </div>

                <button
                  onClick={nextStep}
                  disabled={estVide}
                  className="bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:cursor-not-allowed touch-manipulation"
                >
                  Suivant
                </button>
              </div>

              {/* Services Cards - Layout Mobile Premium */}
              <div className="space-y-4">
                {prestationsCategory.map((prestation, index) => {
                  const quantite = getQuantiteItem(prestation.id);
                  const sousTotal = getSousTotalItem(prestation.id);
                  const isSelected = quantite > 0;

                  return (
                    <motion.div
                      key={prestation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border transition-all duration-200 ${
                        isSelected 
                          ? 'border-orange-200 shadow-md ring-1 ring-orange-100' 
                          : 'border-white/50 hover:shadow-md'
                      }`}
                    >
                      {/* Header Service - Layout Horizontal Mobile */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-bold text-gray-900">{prestation.nom}</h4>
                              {isSelected && (
                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                  ×{quantite}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-3">{prestation.description}</p>
                            <div className="text-xl font-bold text-orange-600">
                              {formaterPrix(prestation.prixBase)}
                            </div>
                          </div>

                          {/* Contrôles Quantité - Stack Vertical Mobile */}
                          <div className="flex flex-col items-center space-y-2">
                            <button
                              onClick={() => handleQuantiteChange(prestation.id, 1)}
                              className="w-10 h-10 bg-orange-400 hover:bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-colors touch-manipulation"
                            >
                              +
                            </button>
                            
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">{quantite}</div>
                              <div className="text-xs text-gray-500">qté</div>
                            </div>
                            
                            <button
                              onClick={() => handleQuantiteChange(prestation.id, -1)}
                              disabled={quantite === 0}
                              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 rounded-full flex items-center justify-center font-bold text-lg transition-colors disabled:cursor-not-allowed touch-manipulation"
                            >
                              −
                            </button>
                          </div>
                        </div>

                        {/* Options - Accordion Style */}
                        {isSelected && prestation.options && prestation.options.length > 0 && (
                          <div className="border-t border-gray-100 pt-4 mt-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3">✨ Options supplémentaires</h5>
                            <div className="space-y-2">
                              {prestation.options?.map((option) => (
                                <div
                                  key={option.id}
                                  onClick={() => toggleOption(prestation.id, option.id)}
                                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 touch-manipulation ${
                                    isOptionSelectionnee(prestation.id, option.id)
                                      ? 'bg-orange-50 border-orange-200' 
                                      : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isOptionSelectionnee(prestation.id, option.id) 
                                          ? 'bg-orange-400 border-orange-400' 
                                          : 'border-gray-300'
                                      }`}>
                                        {isOptionSelectionnee(prestation.id, option.id) && (
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <span className="font-medium text-gray-900 text-sm">{option.nom}</span>
                                        {option.description && (
                                          <p className="text-xs text-gray-600 mt-0.5">{option.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <span className="font-bold text-orange-600 text-sm ml-2">
                                      +{formaterPrix(option.prix)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sous-total */}
                        {isSelected && (
                          <div className="border-t border-gray-100 pt-4 mt-4">
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Sous-total:</span>
                                <span className="text-xl font-bold text-orange-600">
                                  {formaterPrix(sousTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {prestationsCategory.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun service disponible</h3>
                  <p className="text-gray-600">Cette catégorie sera bientôt disponible.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Étape 3: Date */}
          {currentStep === 'date' && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📅 Choisissez votre date
                </h2>
                <p className="text-gray-600">Quand voulez-vous célébrer ?</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-4">
                <DateSelector
                  onDateSelect={handleDateSelect}
                  selectedDate={dateEvenement ? dateEvenement.toISOString().split('T')[0] : ''}
                />
              </div>

              {dateEvenement && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Date confirmée</h3>
                    <p className="text-lg font-semibold text-green-600 mb-2">
                      {dateEvenement.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    
                    {majorationDate > 0 && (
                      <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 mt-3">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-amber-600">⚡</span>
                          <div>
                            <p className="font-semibold text-amber-800 text-sm">Majoration +{majorationDate}%</p>
                            <p className="text-xs text-amber-700">
                              {formaterPrix((devis.total * majorationDate) / 100)} supplémentaires
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Services</span>
                </button>

                <button
                  onClick={nextStep}
                  disabled={!dateEvenement}
                  className="bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed touch-manipulation"
                >
                  Finaliser
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 4: Résumé */}
          {currentStep === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Votre devis est prêt !
                </h2>
                <p className="text-gray-600">Récapitulatif de votre événement</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
                <div className="space-y-4">
                  
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Sous-total services :</span>
                      <span className="font-semibold">{formaterPrix(devis.total)}</span>
                    </div>
                    
                    {majorationDate > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Majoration date (+{majorationDate}%) :</span>
                        <span className="font-semibold">
                          +{formaterPrix((devis.total * majorationDate) / 100)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold border-t border-gray-100 pt-4">
                    <span className="text-gray-900">TOTAL :</span>
                    <span className="text-orange-600">
                      {formaterPrix(totalAvecMajoration())}
                    </span>
                  </div>
                  
                  <button 
                    onClick={nextStep}
                    className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all duration-200 touch-manipulation shadow-lg"
                  >
                    📝 Remplir mes infos
                  </button>

                  <div className="text-center text-xs text-gray-500 mt-3">
                    ⚠️ Estimation gratuite • Non contractuelle
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={prevStep}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mx-auto touch-manipulation"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Modifier la date</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 5: Formulaire Final */}
          {currentStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📝</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Finalisez votre demande
                </h2>
                <p className="text-gray-600">Quelques infos pour personnaliser votre devis</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Vos informations */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    👤 Vos informations
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        placeholder="Votre nom et prénom"
                        value={formData.nom}
                        onChange={(e) => updateFormData('nom', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        placeholder="06 12 34 56 78"
                        value={formData.telephone}
                        onChange={(e) => updateFormData('telephone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Votre événement */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    🎉 Votre événement
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type d'événement *
                      </label>
                      <select 
                        value={formData.typeEvenement || selectedCategory}
                        onChange={(e) => updateFormData('typeEvenement', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation"
                        required
                      >
                        <option value="">Sélectionnez le type</option>
                        <option value="anniversaire">Anniversaire</option>
                        <option value="bapteme">Baptême</option>
                        <option value="babyshower">Baby Shower</option>
                        <option value="gender-reveal">Gender Reveal</option>
                        <option value="mariage">Mariage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse de l'événement *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Adresse complète où aura lieu l'événement"
                        value={formData.adresse}
                        onChange={(e) => updateFormData('adresse', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre d'invités *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Ex: 25"
                        value={formData.nombreInvites}
                        onChange={(e) => updateFormData('nombreInvites', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thème ou couleurs préférés
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Rose et doré, Licorne, Super-héros..."
                        value={formData.theme}
                        onChange={(e) => updateFormData('theme', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message personnel (optionnel)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Parlez-nous de vos attentes, idées spéciales, ou toute information utile..."
                        value={formData.message}
                        onChange={(e) => updateFormData('message', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors touch-manipulation resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Récapitulatif final */}
                <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl border border-orange-200 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    💰 Récapitulatif final
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Services sélectionnés:</span>
                      <span className="font-semibold">{formaterPrix(devis.total)}</span>
                    </div>
                    
                    {majorationDate > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Majoration date ({majorationDate}%):</span>
                        <span className="font-semibold">
                          +{formaterPrix((devis.total * majorationDate) / 100)}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-orange-200 pt-2 mt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>TOTAL:</span>
                        <span className="text-orange-600">
                          {formaterPrix(totalAvecMajoration())}
                        </span>
                      </div>
                    </div>
                    
                    {totalAvecMajoration() > 0 && (
                      <div className="text-xs text-blue-600 mt-2">
                        💡 Acompte 30%: {formaterPrix(totalAvecMajoration() * 0.3)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton envoi */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all duration-200 touch-manipulation shadow-lg flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Envoyer ma demande de devis</span>
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-gray-500 mt-3">
                  ⚠️ Devis gratuit et sans engagement • Réponse sous 24h
                </div>
              </form>

              <div className="text-center">
                <button
                  onClick={prevStep}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mx-auto touch-manipulation"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Retour au résumé</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 6: Succès */}
          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6 text-center"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border border-green-200 p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Demande envoyée !
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  Votre demande de devis a été transmise avec succès.<br/>
                  Nous vous recontacterons rapidement !
                </p>
                
                <div className="bg-white/80 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-green-700 mb-3">✅ Ce qui va se passer :</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span>📧</span>
                      <span>Confirmation par email sous quelques minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📞</span>
                      <span>Appel de notre équipe dans les 24h</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📋</span>
                      <span>Devis personnalisé et détaillé</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🎨</span>
                      <span>Conseils pour votre événement</span>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <button
                    onClick={startNewQuote}
                    className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 touch-manipulation shadow-lg"
                  >
                    🆕 Nouveau devis
                  </button>
                  
                  <div className="text-xs text-gray-500 mt-4">
                    Référence: DV-{new Date().getTime().toString().slice(-6)}
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📞 Contact rapide</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Une question ? Besoin d'un renseignement urgent ?
                </p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="tel:+33123456789" 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors touch-manipulation"
                  >
                    📞 Appeler
                  </a>
                  <a 
                    href="mailto:contact@example.com" 
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors touch-manipulation"
                  >
                    📧 Email
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Mobile - Fixe */}
      {currentStep !== 'form' && currentStep !== 'success' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-500">Total estimé</div>
              <div className="text-lg font-bold text-orange-600">
                {formaterPrix(totalAvecMajoration())}
              </div>
              {majorationDate > 0 && (
                <div className="text-xs text-amber-600">+{majorationDate}% majoration</div>
              )}
            </div>
            
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 'category' && !selectedCategory) ||
                (currentStep === 'services' && estVide) ||
                (currentStep === 'date' && !dateEvenement)
              }
              className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-full font-bold transition-all duration-200 disabled:cursor-not-allowed touch-manipulation shadow-lg transform hover:scale-105 disabled:scale-100"
            >
              {currentStep === 'category' && '🎯 Choisir services'}
              {currentStep === 'services' && '📅 Choisir date'}
              {currentStep === 'date' && '📋 Voir résumé'}
              {currentStep === 'summary' && '📝 Mes infos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevisUltra;