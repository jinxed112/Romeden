import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevis } from '../hooks/useDevis';
import { usePrestations } from '../hooks/usePrestations';
import { useReservations } from '../hooks/useReservations';
import { formaterPrix } from '../utils/devisCalculator';
import DateSelector from '../components/devis/DateSelector';

const DevisUltra: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'category' | 'services' | 'date' | 'summary'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [majorationDate, setMajorationDate] = useState<number>(0);

  // États pour le formulaire client et la soumission
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    email: '',
    telephone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    dateEvenement
  } = useDevis();

  const { getPrestationsByCategory } = usePrestations();
  const { createReservation } = useReservations();

  const categories = [
    { 
      id: 'anniversaire', 
      nom: 'Anniversaires', 
      emoji: '🎂', 
      description: 'Des décorations féériques pour faire briller les yeux de vos enfants'
    },
    { 
      id: 'babyshower', 
      nom: 'Baby Showers', 
      emoji: '👶', 
      description: 'Célébrez l\'arrivée de votre petit ange avec style et élégance'
    },
    { 
      id: 'bapteme', 
      nom: 'Baptêmes', 
      emoji: '⛪', 
      description: 'Des ambiances douces et spirituelles pour ce moment sacré'
    },
    { 
      id: 'gender-reveal', 
      nom: 'Gender Reveals', 
      emoji: '🎈', 
      description: 'Révélez le grand secret dans une atmosphère magique'
    },
    { 
      id: 'mariage', 
      nom: 'Mariages', 
      emoji: '💒', 
      description: 'Créations sur-mesure pour votre jour le plus précieux'
    }
  ];

  const prestationsCategory = selectedCategory ? getPrestationsByCategory(selectedCategory) : [];

  // Calcul du total avec majoration date
  const totalAvecMajoration = () => {
    const sousTotal = devis.total;
    const majorationMontant = (sousTotal * majorationDate) / 100;
    return sousTotal + majorationMontant;
  };

  // Fonction de finalisation avec création réservation Supabase
  const handleFinaliserDevis = async () => {
    if (!clientInfo.nom || !clientInfo.email || !dateEvenement) {
      alert('❌ Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Générer un ID de devis unique
      const devisId = `DEVIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Préparer les données de réservation
      const reservationData = {
        devis_id: devisId,
        client_nom: clientInfo.nom,
        client_email: clientInfo.email,
        client_telephone: clientInfo.telephone ? clientInfo.telephone : undefined,
        date_evenement: dateEvenement.toISOString().split('T')[0], // Format YYYY-MM-DD
        prestations: {
          items: devis.items,
          majoration_date: majorationDate,
          sous_total: devis.total,
          total_avec_majoration: totalAvecMajoration(),
          categorie: selectedCategory
        },
        montant: totalAvecMajoration(),
        statut: 'en_attente' as const
      };

      console.log('🚀 Création réservation:', reservationData);
      
      // Créer la réservation dans Supabase
      const nouvelleReservation = await createReservation(reservationData);
      
      if (nouvelleReservation) {
        // Succès !
        alert(`✅ Votre demande a été envoyée avec succès !
        
📋 Numéro de devis: ${devisId}
📧 Un email de confirmation sera envoyé à ${clientInfo.email}
⏱️ Nous vous répondrons sous 24h

Merci de votre confiance ! 🎉`);
        
        // Redirection vers la page d'accueil
        window.location.href = '/';
        
      } else {
        throw new Error('Échec création réservation');
      }
      
    } catch (error) {
      console.error('❌ Erreur finalisation:', error);
      alert('❌ Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
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
    }
  };

  const prevStep = () => {
    if (currentStep === 'summary') setCurrentStep('date');
    else if (currentStep === 'date') setCurrentStep('services');
    else if (currentStep === 'services') setCurrentStep('category');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      
      {/* Header élégant et sobre */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ← Retour
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Créateur de Devis</h1>
                <p className="text-gray-600 text-sm">Transformez vos rêves en réalité</p>
              </div>
            </div>

            {/* Indicateur de progression simple */}
            <div className="hidden md:flex items-center space-x-3">
              {['Catégorie', 'Services', 'Date', 'Résumé'].map((label, index) => {
                const steps = ['category', 'services', 'date', 'summary'];
                const isActive = currentStep === steps[index];
                const isCompleted = steps.indexOf(currentStep) > index;
                
                return (
                  <div key={label} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isActive 
                        ? 'bg-orange-400 text-white' 
                        : isCompleted
                          ? 'bg-green-400 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    {index < 3 && <div className="w-6 h-px bg-gray-200 mx-2"></div>}
                  </div>
                );
              })}
            </div>

            {/* Total sobre avec majoration */}
            <div className="text-right">
              <p className="text-sm text-gray-600">Total estimé</p>
              <p className="text-2xl font-bold text-orange-600">
                {formaterPrix(totalAvecMajoration())}
              </p>
              {majorationDate > 0 && (
                <p className="text-xs text-amber-600 font-medium">
                  +{majorationDate}% majoration date
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* Étape 1: Sélection catégorie */}
            {currentStep === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    Mes Services Premium
                  </h2>
                  <p className="text-xl text-gray-600">Des créations magiques pour célébrer vos moments les plus précieux</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {categories.map((category, index) => (
                    <motion.button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setTimeout(() => nextStep(), 200);
                      }}
                      className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 text-center"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="text-6xl mb-4">{category.emoji}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{category.nom}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                      <div className="mt-4 text-xs text-gray-500">
                        {getPrestationsByCategory(category.id).length} service{getPrestationsByCategory(category.id).length > 1 ? 's' : ''} disponible{getPrestationsByCategory(category.id).length > 1 ? 's' : ''}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Étape 2: Sélection services */}
            {currentStep === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Header avec navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    ← Changer de catégorie
                  </button>

                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {categories.find(c => c.id === selectedCategory)?.emoji} {categories.find(c => c.id === selectedCategory)?.nom}
                    </h3>
                    <p className="text-gray-600">Sélectionnez et personnalisez vos services</p>
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={estVide}
                    className="px-6 py-2 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white rounded-full transition-colors disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Continuer →
                  </button>
                </div>

                {/* Services */}
                <div className="space-y-6">
                  {prestationsCategory.map((prestation, index) => {
                    const quantite = getQuantiteItem(prestation.id);
                    const sousTotal = getSousTotalItem(prestation.id);
                    const isSelected = quantite > 0;

                    return (
                      <motion.div
                        key={prestation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
                          isSelected ? 'border-orange-200 shadow-md' : 'border-gray-100 hover:shadow-md'
                        }`}
                      >
                        <div className="p-8">
                          
                          {/* Header service */}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h4 className="text-2xl font-bold text-gray-800">{prestation.nom}</h4>
                                {isSelected && (
                                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                                    ×{quantite}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mb-4 leading-relaxed">{prestation.description}</p>
                              <div className="flex items-center space-x-3">
                                <span className="text-3xl font-bold text-orange-600">
                                  {formaterPrix(prestation.prixBase)}
                                </span>
                                <span className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                                  Prix de base
                                </span>
                              </div>
                            </div>

                            {/* Contrôles quantité épurés */}
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleQuantiteChange(prestation.id, -1)}
                                disabled={quantite === 0}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-gray-600 font-bold"
                              >
                                −
                              </button>
                              
                              <div className="text-center min-w-[60px]">
                                <div className="text-2xl font-bold text-gray-800">{quantite}</div>
                                <div className="text-xs text-gray-500">quantité</div>
                              </div>
                              
                              <button
                                onClick={() => handleQuantiteChange(prestation.id, 1)}
                                className="w-10 h-10 rounded-full bg-orange-400 hover:bg-orange-500 text-white transition-colors flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Options */}
                          {isSelected && prestation.options && prestation.options.length > 0 && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                              <h5 className="text-lg font-semibold text-gray-800 mb-4">Options supplémentaires</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {prestation.options?.map((option) => (
                                  <div
                                    key={option.id}
                                    onClick={() => toggleOption(prestation.id, option.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                                      isOptionSelectionnee(prestation.id, option.id)
                                        ? 'bg-orange-50 border-orange-200' 
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            isOptionSelectionnee(prestation.id, option.id) 
                                              ? 'bg-orange-400 border-orange-400' 
                                              : 'border-gray-300'
                                          }`}>
                                            {isOptionSelectionnee(prestation.id, option.id) && (
                                              <span className="text-white text-xs">✓</span>
                                            )}
                                          </div>
                                          <span className="font-medium text-gray-800 text-sm">{option.nom}</span>
                                        </div>
                                        {option.description && (
                                          <p className="text-xs text-gray-600 mt-1 ml-6">{option.description}</p>
                                        )}
                                      </div>
                                      <span className="font-semibold text-orange-600 ml-2 text-sm">
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
                            <div className="border-t border-gray-100 pt-4 mt-6">
                              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                                <span className="font-semibold text-gray-800">Sous-total cette prestation:</span>
                                <span className="text-2xl font-bold text-orange-600">
                                  {formaterPrix(sousTotal)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Étape 3: Sélection date avec DateSelector */}
            {currentStep === 'date' && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Choisissez votre date
                  </h2>
                  <p className="text-xl text-gray-600">Quand souhaitez-vous célébrer ce moment précieux ?</p>
                </div>

                {/* Intégration du DateSelector dans un conteneur stylé */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
                  <DateSelector
                    onDateSelect={handleDateSelect}
                    selectedDate={dateEvenement ? dateEvenement.toISOString().split('T')[0] : ''}
                  />
                </div>

                {/* Récapitulatif de la sélection */}
                {dateEvenement && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6 max-w-2xl mx-auto">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📅</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Date sélectionnée</h3>
                      <p className="text-2xl font-semibold text-orange-600 mb-3">
                        {dateEvenement.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      
                      {majorationDate > 0 && (
                        <div className="bg-amber-100 border border-amber-200 rounded-xl p-4 mt-4">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-amber-600 text-lg">⚡</span>
                            <div>
                              <p className="font-semibold text-amber-800">Majoration appliquée</p>
                              <p className="text-sm text-amber-700">
                                +{majorationDate}% • {formaterPrix((devis.total * majorationDate) / 100)} supplémentaires
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between max-w-2xl mx-auto">
                  <button
                    onClick={prevStep}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    ← Retour services
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={!dateEvenement}
                    className="px-6 py-2 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white rounded-full transition-colors disabled:cursor-not-allowed font-medium"
                  >
                    Finaliser →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Étape 4: Formulaire client et finalisation */}
            {currentStep === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Finalisez votre demande
                  </h2>
                  <p className="text-xl text-gray-600">Plus qu'une étape avant de recevoir votre devis personnalisé</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
                  
                  {/* Formulaire informations client */}
                  <div className="space-y-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Vos informations</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.nom}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, nom: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={clientInfo.telephone}
                        onChange={(e) => setClientInfo(prev => ({ ...prev, telephone: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>

                  {/* Résumé de la commande */}
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="font-bold text-gray-800 mb-3">📋 Récapitulatif</h4>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Date événement :</span>
                        <span className="font-medium">
                          {dateEvenement?.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
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

                    <div className="flex justify-between items-center text-2xl font-bold border-t border-gray-100 pt-4">
                      <span className="text-gray-800">Total :</span>
                      <span className="text-orange-600">
                        {formaterPrix(totalAvecMajoration())}
                      </span>
                    </div>
                  </div>

                  {/* Bouton finalisation avec état de chargement */}
                  <button 
                    onClick={handleFinaliserDevis}
                    disabled={isSubmitting || !clientInfo.nom || !clientInfo.email}
                    className="w-full py-4 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed mt-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>📡 Envoi en cours...</span>
                      </div>
                    ) : (
                      '🚀 Envoyer ma demande de devis'
                    )}
                  </button>

                  <div className="text-center text-xs text-gray-500 mt-4">
                    ⚠️ Devis gratuit et sans engagement • Réponse sous 24h
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm disabled:opacity-50"
                  >
                    ← Modifier la date
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DevisUltra;