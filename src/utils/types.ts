// Types pour le système de devis RomEden Events

export interface Option {
  id: string;
  nom: string;
  prix: number;
  description?: string;
  compatible: string[]; // IDs prestations compatibles
}

export interface Prestation {
  id: string;
  nom: string;
  description: string;
  prixBase: number;
  categorie: 'anniversaire' | 'bapteme' | 'babyshower' | 'gender-reveal' | 'mariage';
  active: boolean; // Pour système admin
  image: string;
  options: Option[];
  couleurTheme: string; // Couleur de la card
}

export interface DevisItem {
  prestationId: string;
  quantite: number;
  optionsSelectionnees: string[]; // IDs des options choisies
  sousTotal: number;
}

export interface Devis {
  items: DevisItem[];
  dateEvenement: Date | null;
  majorationDate: number; // Pourcentage (0, 20, 30)
  sousTotal: number;
  majorationMontant: number;
  total: number;
}

export interface FormulaireFinal {
  // Infos client
  nom: string;
  email: string;
  telephone: string;
  adresseEvenement: string;
  
  // Détails événement
  typeEvenement: string;
  nombreInvites: number;
  theme?: string;
  messagePersonnalise?: string;
  
  // Data devis
  devis: Devis;
}

export interface CalendrierDisponibilite {
  date: string; // Format YYYY-MM-DD
  statut: 'disponible' | 'indisponible' | 'reserve';
  majoration: number; // Pourcentage supplémentaire
}

// ===== EXTENSIONS CALENDRIER ADMIN =====

export interface DisponibiliteJour {
  date: string; // Format YYYY-MM-DD
  statut: 'disponible' | 'indisponible' | 'reserve' | 'bloque';
  majoration: number; // Pourcentage personnalisé (surcharge les règles par défaut)
  motif?: string; // Congés, férié, événement spécial
  evenement?: EvenementCalendrier;
}

export interface EvenementCalendrier {
  id: string;
  titre: string;
  client: string;
  email?: string;
  telephone?: string;
  prestations: string[]; // IDs prestations
  statut: 'devis' | 'confirme' | 'termine' | 'annule';
  montant: number;
  notes?: string;
  dateCreation: string;
  dateEvenement: string;
}

export interface ParametresCalendrier {
  joursFerrmeture: number[]; // 0=dimanche, 1=lundi, etc.
  majorationWeekend: number; // 20 par défaut
  majorationFerie: number; // 30 par défaut
  delaiReservationMin: number; // Jours minimum avant événement
  notificationsEmail: boolean;
  heuresOuverture: {
    debut: string; // "09:00"
    fin: string; // "18:00"
  };
}

export interface PlanningStats {
  moisEnCours: {
    evenementsConfirmes: number;
    chiffreAffaires: number;
    joursOccupes: number;
    tauxOccupation: number; // Pourcentage
  };
  alertes: AlertePlanning[];
}

export interface AlertePlanning {
  id: string;
  type: 'conflit' | 'oubli' | 'rappel' | 'nouveau_devis';
  message: string;
  date: string;
  priorite: 'haute' | 'normale' | 'basse';
  action?: string; // Action suggérée
}

export interface CalendarViewMode {
  type: 'mois' | 'semaine' | 'planning';
  dateActive: Date;
}

export interface AdminSection {
  id: 'dashboard' | 'prestations' | 'calendrier' | 'planning' | 'reservations' | 'galerie' | 'parametres';
  nom: string;
  icon: string;
  badge?: number; // Nombre pour notifications
}

// ===== TYPES GALERIE ADMIN =====

export interface GalleryStats {
  totalImages: number;
  imagesParCategorie: Record<string, number>;
  derniereModification: string;
}
