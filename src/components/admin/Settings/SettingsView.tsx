import React, { useState, useEffect } from 'react';

interface ParametresCalendrier {
  majorations: {
    weekend: number;
    feries: number;
    evenements: Array<{
      date: string;
      nom: string;
      majoration: number;
    }>;
  };
  fermetures: {
    joursRecurrents: string[]; // ['dimanche', 'lundi']
    periodesVacances: Array<{
      debut: string;
      fin: string;
      motif: string;
    }>;
  };
  notifications: {
    nouveauxDevis: boolean;
    rappelsEvenements: boolean;
  };
}

const SettingsView: React.FC = () => {
  const [parametres, setParametres] = useState<ParametresCalendrier>({
    majorations: {
      weekend: 20,
      feries: 30,
      evenements: []
    },
    fermetures: {
      joursRecurrents: [],
      periodesVacances: []
    },
    notifications: {
      nouveauxDevis: true,
      rappelsEvenements: true
    }
  });

  const [nouvelEvenement, setNouvelEvenement] = useState({
    date: '',
    nom: '',
    majoration: 0
  });

  const [nouvellePeriode, setNouvellePeriode] = useState({
    debut: '',
    fin: '',
    motif: ''
  });

  const joursOptions = [
    { id: 'lundi', nom: 'Lundi' },
    { id: 'mardi', nom: 'Mardi' },
    { id: 'mercredi', nom: 'Mercredi' },
    { id: 'jeudi', nom: 'Jeudi' },
    { id: 'vendredi', nom: 'Vendredi' },
    { id: 'samedi', nom: 'Samedi' },
    { id: 'dimanche', nom: 'Dimanche' }
  ];

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const saved = localStorage.getItem('romeden_settings');
    if (saved) {
      setParametres(JSON.parse(saved));
    }
  }, []);

  const sauvegarderParametres = (nouveauxParametres: ParametresCalendrier) => {
    setParametres(nouveauxParametres);
    localStorage.setItem('romeden_settings', JSON.stringify(nouveauxParametres));
    alert('✅ Paramètres sauvegardés !');
  };

  const ajouterEvenementSpecial = () => {
    if (!nouvelEvenement.date || !nouvelEvenement.nom) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const nouveauxParametres = {
      ...parametres,
      majorations: {
        ...parametres.majorations,
        evenements: [...parametres.majorations.evenements, { ...nouvelEvenement }]
      }
    };

    sauvegarderParametres(nouveauxParametres);
    setNouvelEvenement({ date: '', nom: '', majoration: 0 });
  };

  const supprimerEvenementSpecial = (index: number) => {
    const nouveauxParametres = {
      ...parametres,
      majorations: {
        ...parametres.majorations,
        evenements: parametres.majorations.evenements.filter((_, i) => i !== index)
      }
    };
    sauvegarderParametres(nouveauxParametres);
  };

  const ajouterPeriodeVacances = () => {
    if (!nouvellePeriode.debut || !nouvellePeriode.fin || !nouvellePeriode.motif) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const nouveauxParametres = {
      ...parametres,
      fermetures: {
        ...parametres.fermetures,
        periodesVacances: [...parametres.fermetures.periodesVacances, { ...nouvellePeriode }]
      }
    };

    sauvegarderParametres(nouveauxParametres);
    setNouvellePeriode({ debut: '', fin: '', motif: '' });
  };

  const supprimerPeriodeVacances = (index: number) => {
    const nouveauxParametres = {
      ...parametres,
      fermetures: {
        ...parametres.fermetures,
        periodesVacances: parametres.fermetures.periodesVacances.filter((_, i) => i !== index)
      }
    };
    sauvegarderParametres(nouveauxParametres);
  };

  const toggleJourRecurrent = (jour: string) => {
    const nouveauxJours = parametres.fermetures.joursRecurrents.includes(jour)
      ? parametres.fermetures.joursRecurrents.filter(j => j !== jour)
      : [...parametres.fermetures.joursRecurrents, jour];

    const nouveauxParametres = {
      ...parametres,
      fermetures: {
        ...parametres.fermetures,
        joursRecurrents: nouveauxJours
      }
    };
    sauvegarderParametres(nouveauxParametres);
  };

  const updateMajoration = (type: 'weekend' | 'feries', valeur: number) => {
    const nouveauxParametres = {
      ...parametres,
      majorations: {
        ...parametres.majorations,
        [type]: valeur
      }
    };
    sauvegarderParametres(nouveauxParametres);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Paramètres</h2>
        <p className="text-gray-600">Configuration de votre calendrier et tarification</p>
      </div>

      {/* Majorations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">💰 Majorations tarifaires</h3>
        
        {/* Majorations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              📅 Majoration weekend (%)
            </label>
            <input
              type="number"
              value={parametres.majorations.weekend}
              onChange={(e) => updateMajoration('weekend', Number(e.target.value))}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              min="0"
              max="100"
            />
            <p className="text-xs text-blue-600 mt-1">Appliqué samedi et dimanche</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-purple-800 mb-2">
              🎉 Majoration jours fériés (%)
            </label>
            <input
              type="number"
              value={parametres.majorations.feries}
              onChange={(e) => updateMajoration('feries', Number(e.target.value))}
              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
              min="0"
              max="100"
            />
            <p className="text-xs text-purple-600 mt-1">Appliqué aux jours fériés français</p>
          </div>
        </div>

        {/* Événements spéciaux */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-700 mb-4">🌟 Événements spéciaux</h4>
          
          {/* Formulaire ajout */}
          <div className="bg-amber-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="date"
                value={nouvelEvenement.date}
                onChange={(e) => setNouvelEvenement({...nouvelEvenement, date: e.target.value})}
                className="px-3 py-2 border border-amber-200 rounded-lg focus:border-amber-400"
              />
              <input
                type="text"
                value={nouvelEvenement.nom}
                onChange={(e) => setNouvelEvenement({...nouvelEvenement, nom: e.target.value})}
                placeholder="Nom de l'événement"
                className="px-3 py-2 border border-amber-200 rounded-lg focus:border-amber-400"
              />
              <input
                type="number"
                value={nouvelEvenement.majoration}
                onChange={(e) => setNouvelEvenement({...nouvelEvenement, majoration: Number(e.target.value)})}
                placeholder="Majoration %"
                className="px-3 py-2 border border-amber-200 rounded-lg focus:border-amber-400"
                min="0"
                max="100"
              />
              <button
                onClick={ajouterEvenementSpecial}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Liste événements */}
          <div className="space-y-2">
            {parametres.majorations.evenements.map((evenement, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="font-medium">{evenement.nom}</span>
                  <span className="text-gray-500 ml-2">• {formatDate(evenement.date)}</span>
                  <span className="text-green-600 ml-2">• +{evenement.majoration}%</span>
                </div>
                <button
                  onClick={() => supprimerEvenementSpecial(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))}
            {parametres.majorations.evenements.length === 0 && (
              <p className="text-center text-gray-500 py-4 italic">Aucun événement spécial configuré</p>
            )}
          </div>
        </div>
      </div>

      {/* Jours de fermeture */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">🚫 Jours de fermeture</h3>
        
        {/* Jours récurrents */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-4">📅 Fermeture hebdomadaire</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {joursOptions.map(jour => (
              <button
                key={jour.id}
                onClick={() => toggleJourRecurrent(jour.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  parametres.fermetures.joursRecurrents.includes(jour.id)
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {jour.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Périodes de vacances */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-700 mb-4">🏖️ Périodes de vacances</h4>
          
          {/* Formulaire ajout */}
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="date"
                value={nouvellePeriode.debut}
                onChange={(e) => setNouvellePeriode({...nouvellePeriode, debut: e.target.value})}
                className="px-3 py-2 border border-red-200 rounded-lg focus:border-red-400"
              />
              <input
                type="date"
                value={nouvellePeriode.fin}
                onChange={(e) => setNouvellePeriode({...nouvellePeriode, fin: e.target.value})}
                className="px-3 py-2 border border-red-200 rounded-lg focus:border-red-400"
              />
              <input
                type="text"
                value={nouvellePeriode.motif}
                onChange={(e) => setNouvellePeriode({...nouvellePeriode, motif: e.target.value})}
                placeholder="Motif (vacances, congés...)"
                className="px-3 py-2 border border-red-200 rounded-lg focus:border-red-400"
              />
              <button
                onClick={ajouterPeriodeVacances}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Liste périodes */}
          <div className="space-y-2">
            {parametres.fermetures.periodesVacances.map((periode, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="font-medium">{periode.motif}</span>
                  <span className="text-gray-500 ml-2">
                    • {formatDate(periode.debut)} → {formatDate(periode.fin)}
                  </span>
                </div>
                <button
                  onClick={() => supprimerPeriodeVacances(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))}
            {parametres.fermetures.periodesVacances.length === 0 && (
              <p className="text-center text-gray-500 py-4 italic">Aucune période de vacances configurée</p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">🔔 Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-800">📧 Nouveaux devis</div>
              <div className="text-sm text-gray-600">Recevoir une alerte pour chaque nouveau devis</div>
            </div>
            <button
              onClick={() => {
                const nouveauxParametres = {
                  ...parametres,
                  notifications: {
                    ...parametres.notifications,
                    nouveauxDevis: !parametres.notifications.nouveauxDevis
                  }
                };
                sauvegarderParametres(nouveauxParametres);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                parametres.notifications.nouveauxDevis ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                parametres.notifications.nouveauxDevis ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-800">⏰ Rappels événements</div>
              <div className="text-sm text-gray-600">Rappel 24h avant chaque événement</div>
            </div>
            <button
              onClick={() => {
                const nouveauxParametres = {
                  ...parametres,
                  notifications: {
                    ...parametres.notifications,
                    rappelsEvenements: !parametres.notifications.rappelsEvenements
                  }
                };
                sauvegarderParametres(nouveauxParametres);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                parametres.notifications.rappelsEvenements ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                parametres.notifications.rappelsEvenements ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Actions globales */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🔧 Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              if (window.confirm('Êtes-vous sûre de vouloir réinitialiser tous les paramètres ?')) {
                const parametresDefaut: ParametresCalendrier = {
                  majorations: { weekend: 20, feries: 30, evenements: [] },
                  fermetures: { joursRecurrents: [], periodesVacances: [] },
                  notifications: { nouveauxDevis: true, rappelsEvenements: true }
                };
                sauvegarderParametres(parametresDefaut);
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Réinitialiser
          </button>
          
          <button
            onClick={() => {
              const dataStr = JSON.stringify(parametres, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'romeden-parametres.json';
              link.click();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            💾 Exporter config
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
