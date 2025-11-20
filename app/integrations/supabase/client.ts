
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://drxtaxepofuoelplgrei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHRheGVwb2Z1b2VscGxncmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTE4OTIsImV4cCI6MjA3OTEyNzg5Mn0.Neyu511N_7zLuFp0hywz2GBF-5TVgjLvcs70VrAj9QQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
