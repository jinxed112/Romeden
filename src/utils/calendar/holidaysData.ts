// Jours fériés français pour RomEden Events

export const JOURS_FERIES_2025 = [
  '2025-01-01', // Jour de l'An
  '2025-04-21', // Lundi de Pâques
  '2025-05-01', // Fête du Travail
  '2025-05-08', // Victoire 1945
  '2025-05-29', // Ascension
  '2025-06-09', // Lundi de Pentecôte
  '2025-07-14', // Fête nationale
  '2025-08-15', // Assomption
  '2025-11-01', // Toussaint
  '2025-11-11', // Armistice
  '2025-12-25', // Noël
];

export const JOURS_FERIES_2026 = [
  '2026-01-01', // Jour de l'An
  '2026-04-06', // Lundi de Pâques
  '2026-05-01', // Fête du Travail
  '2026-05-08', // Victoire 1945
  '2026-05-14', // Ascension
  '2026-05-25', // Lundi de Pentecôte
  '2026-07-14', // Fête nationale
  '2026-08-15', // Assomption
  '2026-11-01', // Toussaint
  '2026-11-11', // Armistice
  '2026-12-25', // Noël
];

export const JOURS_FERIES_2027 = [
  '2027-01-01', // Jour de l'An
  '2027-03-29', // Lundi de Pâques
  '2027-05-01', // Fête du Travail
  '2027-05-08', // Victoire 1945
  '2027-05-06', // Ascension
  '2027-05-17', // Lundi de Pentecôte
  '2027-07-14', // Fête nationale
  '2027-08-15', // Assomption
  '2027-11-01', // Toussaint
  '2027-11-11', // Armistice
  '2027-12-25', // Noël
];

/**
 * Vérifie si une date est un jour férié
 */
export const isJourFerie = (date: Date): boolean => {
  const dateString = date.toISOString().split('T')[0];
  
  return [
    ...JOURS_FERIES_2025,
    ...JOURS_FERIES_2026,
    ...JOURS_FERIES_2027
  ].includes(dateString);
};

/**
 * Obtient le nom du jour férié
 */
export const getNomJourFerie = (date: Date): string | null => {
  const dateString = date.toISOString().split('T')[0];
  
  const joursFeries: Record<string, string> = {
    // 2025
    '2025-01-01': 'Jour de l\'An',
    '2025-04-21': 'Lundi de Pâques',
    '2025-05-01': 'Fête du Travail',
    '2025-05-08': 'Victoire 1945',
    '2025-05-29': 'Ascension',
    '2025-06-09': 'Lundi de Pentecôte',
    '2025-07-14': 'Fête nationale',
    '2025-08-15': 'Assomption',
    '2025-11-01': 'Toussaint',
    '2025-11-11': 'Armistice',
    '2025-12-25': 'Noël',
    
    // 2026
    '2026-01-01': 'Jour de l\'An',
    '2026-04-06': 'Lundi de Pâques',
    '2026-05-01': 'Fête du Travail',
    '2026-05-08': 'Victoire 1945',
    '2026-05-14': 'Ascension',
    '2026-05-25': 'Lundi de Pentecôte',
    '2026-07-14': 'Fête nationale',
    '2026-08-15': 'Assomption',
    '2026-11-01': 'Toussaint',
    '2026-11-11': 'Armistice',
    '2026-12-25': 'Noël',
    
    // 2027
    '2027-01-01': 'Jour de l\'An',
    '2027-03-29': 'Lundi de Pâques',
    '2027-05-01': 'Fête du Travail',
    '2027-05-08': 'Victoire 1945',
    '2027-05-06': 'Ascension',
    '2027-05-17': 'Lundi de Pentecôte',
    '2027-07-14': 'Fête nationale',
    '2027-08-15': 'Assomption',
    '2027-11-01': 'Toussaint',
    '2027-11-11': 'Armistice',
    '2027-12-25': 'Noël'
  };
  
  return joursFeries[dateString] || null;
};

/**
 * Obtient tous les jours fériés d'une année
 */
export const getJoursFeriesAnnee = (annee: number): string[] => {
  switch (annee) {
    case 2025:
      return JOURS_FERIES_2025;
    case 2026:
      return JOURS_FERIES_2026;
    case 2027:
      return JOURS_FERIES_2027;
    default:
      return [];
  }
};
