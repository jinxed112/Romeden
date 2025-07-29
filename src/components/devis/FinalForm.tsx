import React, { useState } from 'react';
import { useDevis } from '../../hooks/useDevis';
import { FormulaireFinal } from '../../utils/types';
import { formaterPrix } from '../../utils/devisCalculator';

interface FinalFormProps {
  className?: string;
  onRetour?: () => void;
  onSuccess?: () => void;
}

const FinalForm: React.FC<FinalFormProps> = ({ 
  className = '',
  onRetour,
  onSuccess 
}) => {
  const { devis, reinitialiserDevis } = useDevis();
  
  const [formData, setFormData] = useState<Omit<FormulaireFinal, 'devis'>>({
    nom: '',
    email: '',
    telephone: '',
    adresseEvenement: '',
    typeEvenement: '',
    nombreInvites: 10,
    theme: '',
    messagePersonnalise: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const devisComplet: FormulaireFinal = { ...formData, devis };
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('📨 Devis envoyé:', devisComplet);
      
      alert('🎉 Votre demande de devis a été envoyée avec succès!');
      reinitialiserDevis();
      onSuccess?.();
    } catch (error) {
      alert('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">✨ Finalisation du devis</h2>
              <p className="opacity-90">Quelques informations pour personnaliser votre événement</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total:</p>
              <p className="text-2xl font-bold">{formaterPrix(devis.total)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                👤 Vos informations
              </h3>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Votre nom et prénom"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                🎉 Votre événement
              </h3>

              <div>
                <label htmlFor="typeEvenement" className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'événement *
                </label>
                <select
                  id="typeEvenement"
                  value={formData.typeEvenement}
                  onChange={(e) => handleInputChange('typeEvenement', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de l'événement *
                </label>
                <textarea
                  id="adresse"
                  value={formData.adresseEvenement}
                  onChange={(e) => handleInputChange('adresseEvenement', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Adresse complète"
                  required
                />
              </div>

              <div>
                <label htmlFor="invites" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'invités *
                </label>
                <input
                  type="number"
                  id="invites"
                  min="1"
                  value={formData.nombreInvites}
                  onChange={(e) => handleInputChange('nombreInvites', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <button
              type="button"
              onClick={onRetour}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
            >
              ← Retour
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Envoi...' : '🚀 Envoyer ma demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinalForm;
