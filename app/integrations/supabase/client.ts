
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = "https://drxtaxepofuoelplgrei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHRheGVwb2Z1b2VscGxncmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTE4OTIsImV4cCI6MjA3OTEyNzg5Mn0.Neyu511N_7zLuFp0hywz2GBF-5TVgjLvcs70VrAj9QQ";

// Create a platform-aware storage adapter
const createPlatformStorage = () => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    return {
      getItem: async (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: async (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: async (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      },
    };
  }
  
  // Use AsyncStorage for native platforms
  return AsyncStorage;
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: createPlatformStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
