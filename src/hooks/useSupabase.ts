// HOOK DÉSACTIVÉ TEMPORAIREMENT
export const useSupabase = () => {
  console.log('useSupabase DÉSACTIVÉ');
  return {
    data: [],
    loading: false,
    error: null,
    fetchAll: async () => {},
    create: async () => null,
    update: async () => null,
    remove: async () => false
  };
};
