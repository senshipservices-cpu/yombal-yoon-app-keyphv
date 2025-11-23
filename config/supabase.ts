
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Récupération des variables d'environnement depuis app.json
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || 'https://drxtaxepofuoelplgrei.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHRheGVwb2Z1b2VscGxncmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTE4OTIsImV4cCI6MjA3OTEyNzg5Mn0.Neyu511N_7zLuFp0hywz2GBF-5TVgjLvcs70VrAj9QQ';

// Vérification des clés au démarrage
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERREUR: Les clés Supabase ne sont pas configurées correctement');
  console.error('SUPABASE_URL:', supabaseUrl ? '✅ Configuré' : '❌ Manquant');
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configuré' : '❌ Manquant');
} else {
  console.log('✅ Supabase configuré correctement');
  console.log('URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Export des clés pour utilisation dans d'autres parties de l'app
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || 'AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ';
export const NOTIFICATIONS_KEY = Constants.expoConfig?.extra?.NOTIFICATIONS_KEY || 'production';

// Log des variables d'environnement (sans exposer les clés complètes)
console.log('🔑 Variables d\'environnement chargées:');
console.log('- SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
console.log('- SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅' : '❌');
console.log('- GOOGLE_MAPS_API_KEY:', GOOGLE_MAPS_API_KEY ? '✅' : '❌');
console.log('- NOTIFICATIONS_KEY:', NOTIFICATIONS_KEY);
