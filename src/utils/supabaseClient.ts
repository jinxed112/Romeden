import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types simples
export interface Prestation {
  id: string;
  nom: string;
  description: string;
  prix_base: number;
  categorie: string;
  active: boolean;
  couleur_theme: string;
  created_at: string;
}

export interface OptionPrestation {
  id: string;
  prestation_id: string;
  nom: string;
  description: string;
  prix: number;
  created_at: string;
}
