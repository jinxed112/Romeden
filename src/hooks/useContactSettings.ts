import { useState, useEffect } from 'react';

interface ContactSettings {
  email: string;
  telephone: string;
  zoneIntervention: string;
  anneeCreation: number;
  reseauxSociaux: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}

const defaultSettings: ContactSettings = {
  email: "hello@romeden-events.fr",
  telephone: "06 XX XX XX XX", 
  zoneIntervention: "Région Parisienne et alentours",
  anneeCreation: 2025,
  reseauxSociaux: {
    instagram: "https://www.instagram.com/romeden_events/?igsh=N3lrNGxiODJvOWhw#",
    facebook: "",
    tiktok: "https://www.tiktok.com/@romeden.events?_t=ZG-8yPdr0plDlJ&_r=1"
  }
};

export const useContactSettings = (): ContactSettings => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('romeden_settings');
    if (saved) {
      try {
        const allSettings = JSON.parse(saved);
        if (allSettings.contact) {
          // ✅ MERGER avec les valeurs par défaut au cas où des propriétés manquent
          const mergedContact = {
            ...defaultSettings,
            ...allSettings.contact,
            reseauxSociaux: {
              ...defaultSettings.reseauxSociaux,
              ...(allSettings.contact.reseauxSociaux || {})
            }
          };
          setSettings(mergedContact);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des settings:', error);
      }
    }
  }, []);

  return settings;
};

export type { ContactSettings };