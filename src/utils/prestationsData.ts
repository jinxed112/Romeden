import { Prestation, Option } from './types';

// Options spécifiques par catégorie d'événement
const optionsAnniversaire: Option[] = [
  {
    id: 'arche-ballons-anniversaire',
    nom: 'Arche de ballons thématique',
    prix: 85,
    description: 'Grande arche de ballons aux couleurs de l\'anniversaire',
    compatible: ['anniversaire']
  },
  {
    id: 'coin-photo-anniversaire',
    nom: 'Coin photo personnalisé',
    prix: 120,
    description: 'Décor photo avec accessoires et panneau personnalisé',
    compatible: ['anniversaire']
  },
  {
    id: 'animation-enfants',
    nom: 'Animation enfants (2h)',
    prix: 180,
    description: 'Animateur professionnel : jeux, maquillage, sculptures ballons',
    compatible: ['anniversaire']
  },
  {
    id: 'dj-anniversaire',
    nom: 'DJ + sono (4h)',
    prix: 250,
    description: 'DJ avec playlist adaptée + système son complet',
    compatible: ['anniversaire']
  },
  {
    id: 'gateau-numbers',
    nom: 'Chiffres géants lumineux',
    prix: 60,
    description: 'Chiffres LED de l\'âge (1m de haut)',
    compatible: ['anniversaire']
  },
  {
    id: 'candy-bar-premium',
    nom: 'Candy Bar Premium',
    prix: 95,
    description: 'Bar à bonbons avec présentoirs dorés + sachets personnalisés',
    compatible: ['anniversaire']
  },
  {
    id: 'ballons-helium-extra',
    nom: 'Ballons hélium supplémentaires (x20)',
    prix: 45,
    description: 'Lot de 20 ballons hélium assortis au thème',
    compatible: ['anniversaire']
  }
];

const optionsBapteme: Option[] = [
  {
    id: 'arche-florale-bapteme',
    nom: 'Arche florale église',
    prix: 150,
    description: 'Arche de fleurs blanches et vertes pour cérémonie',
    compatible: ['bapteme']
  },
  {
    id: 'decoration-fonts-baptismaux',
    nom: 'Décoration fonts baptismaux',
    prix: 80,
    description: 'Habillage floral des fonts baptismaux',
    compatible: ['bapteme']
  },
  {
    id: 'livre-or-bapteme',
    nom: 'Livre d\'or personnalisé',
    prix: 35,
    description: 'Livre d\'or avec gravure du prénom et date',
    compatible: ['bapteme']
  },
  {
    id: 'dragees-premium',
    nom: 'Dragées premium + contenants',
    prix: 120,
    description: 'Dragées de qualité avec boîtes personnalisées (x50)',
    compatible: ['bapteme']
  },
  {
    id: 'centres-table-bapteme',
    nom: 'Centres de table élégants (x5)',
    prix: 75,
    description: 'Compositions florales blanches avec bougies',
    compatible: ['bapteme']
  },
  {
    id: 'chemin-petales-eglise',
    nom: 'Chemin de pétales église',
    prix: 65,
    description: 'Décoration allée centrale avec pétales de roses',
    compatible: ['bapteme']
  }
];

const optionsBabyShower: Option[] = [
  {
    id: 'arche-ballons-babyshower',
    nom: 'Arche ballons pastel',
    prix: 90,
    description: 'Arche de ballons tons pastel avec nuages',
    compatible: ['babyshower']
  },
  {
    id: 'coin-cadeaux-babyshower',
    nom: 'Coin cadeaux décoré',
    prix: 55,
    description: 'Espace dédié aux cadeaux avec décoration',
    compatible: ['babyshower']
  },
  {
    id: 'jeux-babyshower',
    nom: 'Kit jeux Baby Shower',
    prix: 40,
    description: 'Jeux imprimés personnalisés + accessoires',
    compatible: ['babyshower']
  },
  {
    id: 'gateau-couches',
    nom: 'Gâteau de couches décoratif',
    prix: 85,
    description: 'Création artistique avec vraies couches + déco',
    compatible: ['babyshower']
  },
  {
    id: 'ballons-confettis-rose-bleu',
    nom: 'Ballons confettis révélation',
    prix: 35,
    description: 'Ballons transparents avec confettis roses/bleus',
    compatible: ['babyshower']
  },
  {
    id: 'photobooth-babyshower',
    nom: 'Photobooth thème bébé',
    prix: 95,
    description: 'Décor photo + accessoires bébé + cadre',
    compatible: ['babyshower']
  }
];

const optionsGenderReveal: Option[] = [
  {
    id: 'ballon-geant-revelation',
    nom: 'Ballon géant révélation',
    prix: 75,
    description: 'Ballon noir géant avec confettis roses/bleus à l\'intérieur',
    compatible: ['gender-reveal']
  },
  {
    id: 'canon-confettis',
    nom: 'Canon à confettis',
    prix: 45,
    description: 'Canon à confettis colorés pour le moment révélation',
    compatible: ['gender-reveal']
  },
  {
    id: 'gateau-surprise-genre',
    nom: 'Gâteau surprise révélation',
    prix: 110,
    description: 'Gâteau neutre avec intérieur coloré rose/bleu',
    compatible: ['gender-reveal']
  },
  {
    id: 'fumigenes-colores',
    nom: 'Fumigènes colorés',
    prix: 55,
    description: 'Fumigènes roses/bleus pour photos spectaculaires',
    compatible: ['gender-reveal']
  },
  {
    id: 'boite-ballons-revelation',
    nom: 'Boîte à ballons surprise',
    prix: 65,
    description: 'Grande boîte qui libère des ballons colorés',
    compatible: ['gender-reveal']
  },
  {
    id: 'banderole-question',
    nom: 'Banderole "Boy or Girl?"',
    prix: 25,
    description: 'Banderole personnalisée pour l\'événement',
    compatible: ['gender-reveal']
  }
];

const optionsMariage: Option[] = [
  {
    id: 'arche-ceremonie-mariage',
    nom: 'Arche de cérémonie florale',
    prix: 300,
    description: 'Grande arche florale pour cérémonie laïque/religieuse',
    compatible: ['mariage']
  },
  {
    id: 'chemin-petales-mariage',
    nom: 'Chemin de pétales allée',
    prix: 120,
    description: 'Décoration allée cérémonie avec pétales frais',
    compatible: ['mariage']
  },
  {
    id: 'decoration-chaises-ceremonie',
    nom: 'Décoration chaises cérémonie (x50)',
    prix: 180,
    description: 'Nœuds et compositions florales pour chaises',
    compatible: ['mariage']
  },
  {
    id: 'centres-table-mariage',
    nom: 'Centres de table réception (x10)',
    prix: 250,
    description: 'Compositions florales hautes avec bougies',
    compatible: ['mariage']
  },
  {
    id: 'eclairage-ambiance',
    nom: 'Éclairage d\'ambiance',
    prix: 200,
    description: 'Guirlandes lumineuses + spots colorés',
    compatible: ['mariage']
  },
  {
    id: 'photobooth-mariage',
    nom: 'Photobooth mariage',
    prix: 150,
    description: 'Décor photo élégant + accessoires + livre photo',
    compatible: ['mariage']
  },
  {
    id: 'vin-honneur-decoration',
    nom: 'Décoration vin d\'honneur',
    prix: 180,
    description: 'Habillage espace cocktail avec haute tables décorées',
    compatible: ['mariage']
  },
  {
    id: 'coordinateur-jour-j',
    nom: 'Coordinateur jour J',
    prix: 400,
    description: 'Coordinateur professionnel présent le jour J',
    compatible: ['mariage']
  }
];

export const prestationsData: Prestation[] = [
  {
    id: 'anniversaire',
    nom: 'Anniversaire Enfant',
    description: 'Décoration complète anniversaire : ballons, déco table, animation de base',
    prixBase: 150,
    categorie: 'anniversaire',
    active: true,
    image: '/images/anniversaire.jpg',
    couleurTheme: 'from-pink-300 to-yellow-300',
    options: optionsAnniversaire
  },
  {
    id: 'babyshower',
    nom: 'Baby Shower',
    description: 'Ambiance douce : ballons pastel, petite décoration table',
    prixBase: 180,
    categorie: 'babyshower',
    active: true,
    image: '/images/babyshower.jpg',
    couleurTheme: 'from-blue-200 to-pink-200',
    options: optionsBabyShower
  },
  {
    id: 'bapteme',
    nom: 'Baptême',
    description: 'Décoration élégante de base : quelques fleurs, dragées simples',
    prixBase: 200,
    categorie: 'bapteme',
    active: true,
    image: '/images/bapteme.jpg',
    couleurTheme: 'from-blue-100 to-white',
    options: optionsBapteme
  },
  {
    id: 'gender-reveal',
    nom: 'Gender Reveal',
    description: 'Décoration mystère de base : ballons neutres, petite mise en scène',
    prixBase: 160,
    categorie: 'gender-reveal',
    active: true,
    image: '/images/gender-reveal.jpg',
    couleurTheme: 'from-pink-200 to-blue-200',
    options: optionsGenderReveal
  },
  {
    id: 'mariage',
    nom: 'Mariage',
    description: 'Prestation de base : décoration simple cérémonie OU réception',
    prixBase: 500,
    categorie: 'mariage',
    active: true,
    image: '/images/mariage.jpg',
    couleurTheme: 'from-rose-300 to-amber-200',
    options: optionsMariage
  }
];

// Fonctions utilitaires (inchangées)
export const getPrestationsActives = (): Prestation[] => {
  return prestationsData.filter(prestation => prestation.active);
};

export const getPrestationById = (id: string): Prestation | undefined => {
  return prestationsData.find(prestation => prestation.id === id);
};

export const getOptionById = (optionId: string): Option | undefined => {
  const allOptions = prestationsData.flatMap(prestation => prestation.options);
  return allOptions.find(option => option.id === optionId);
};
