import { supabase } from '../utils/supabaseClient';

export interface ReservationSupabase {
  id: string;
  devis_id: string;
  client_nom: string;
  client_email: string;
  client_telephone?: string; // Nullable dans ta table
  date_evenement: string; // Format YYYY-MM-DD
  prestations: any; // JSON des prestations
  montant: number;
  statut: 'en_attente' | 'confirme' | 'refuse';
  created_at: string;
}

/**
 * Charger toutes les réservations depuis Supabase
 */
export const loadReservations = async (): Promise<ReservationSupabase[]> => {
  try {
    console.log('📡 Chargement réservations depuis Supabase...');
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return [];
    }

    console.log('✅ Chargé', data?.length || 0, 'réservations');
    return data || [];

  } catch (error) {
    console.error('❌ Erreur chargement réservations:', error);
    return [];
  }
};

/**
 * Créer une nouvelle réservation
 */
export const createReservation = async (reservation: Omit<ReservationSupabase, 'id' | 'created_at'>): Promise<ReservationSupabase | null> => {
  try {
    console.log('💾 Création réservation:', reservation);

    const { data, error } = await supabase
      .from('reservations')
      .insert([reservation])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création réservation:', error);
      return null;
    }

    console.log('✅ Réservation créée:', data.id);
    return data;

  } catch (error) {
    console.error('❌ Erreur createReservation:', error);
    return null;
  }
};

/**
 * Mettre à jour une réservation
 */
export const updateReservation = async (id: string, updates: Partial<ReservationSupabase>): Promise<boolean> => {
  try {
    console.log('🔄 Mise à jour réservation:', id, updates);

    const { error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur mise à jour:', error);
      return false;
    }

    console.log('✅ Réservation mise à jour');
    return true;

  } catch (error) {
    console.error('❌ Erreur updateReservation:', error);
    return false;
  }
};

/**
 * Supprimer une réservation
 */
export const deleteReservation = async (id: string): Promise<boolean> => {
  try {
    console.log('🗑️ Suppression réservation:', id);

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur suppression:', error);
      return false;
    }

    console.log('✅ Réservation supprimée');
    return true;

  } catch (error) {
    console.error('❌ Erreur deleteReservation:', error);
    return false;
  }
};

/**
 * Changer le statut d'une réservation
 */
export const changeReservationStatus = async (id: string, statut: ReservationSupabase['statut']): Promise<boolean> => {
  return await updateReservation(id, { statut });
};

/**
 * Obtenir les réservations par mois
 */
export const getReservationsByMonth = async (year: number, month: number): Promise<ReservationSupabase[]> => {
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gte('date_evenement', startDate)
      .lte('date_evenement', endDateStr)
      .order('date_evenement');

    if (error) return [];
    return data || [];

  } catch (error) {
    return [];
  }
};

/**
 * Obtenir les statistiques
 */
export const getReservationStats = async (): Promise<{
  total: number;
  en_attente: number;
  confirme: number;
  refuse: number;
  chiffre_affaires: number;
}> => {
  try {
    const reservations = await loadReservations();
    
    return {
      total: reservations.length,
      en_attente: reservations.filter(r => r.statut === 'en_attente').length,
      confirme: reservations.filter(r => r.statut === 'confirme').length,
      refuse: reservations.filter(r => r.statut === 'refuse').length,
      chiffre_affaires: reservations
        .filter(r => r.statut === 'confirme')
        .reduce((total, r) => total + r.montant, 0)
    };

  } catch (error) {
    return {
      total: 0,
      en_attente: 0,
      confirme: 0,
      refuse: 0,
      chiffre_affaires: 0
    };
  }
};
