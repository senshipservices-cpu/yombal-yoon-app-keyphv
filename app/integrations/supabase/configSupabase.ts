
// app/integrations/supabase/configSupabase.ts

/**
 * Vérifie que Supabase est correctement configuré.
 * Cette fonction est utilisée dans ColisContext.tsx et d'autres modules.
 */
export function isSupabaseConfigured(): boolean {
  try {
    const url =
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";
    const anonKey =
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "";

    const ok = !!(url && anonKey);

    if (!ok) {
      console.warn(
        "[Supabase config] ⚠️ URL ou ANON KEY manquants",
        {
          hasUrl: !!url,
          hasAnonKey: !!anonKey,
        }
      );
    } else {
      console.log(
        "✅ Supabase configuré correctement (isSupabaseConfigured)",
        { url }
      );
    }

    // On retourne quand même true si les variables sont là,
    // et on laisse Supabase remonter les erreurs réseau ou autres.
    return ok;
  } catch (error) {
    console.error(
      "[Supabase config] ❌ Exception dans isSupabaseConfigured",
      error
    );
    // On ne bloque pas le flux : on laisse la requête essayer quand même.
    return true;
  }
}
