
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * SUPABASE CONFIGURATION FOR YOMBAL YOON - PRODUCTION MODE
 * 
 * Environment variables are configured in Natively:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

// Supabase configuration from environment variables
const SUPABASE_URL = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
  'https://drxtaxepofuoelplgrei.supabase.co';

const SUPABASE_ANON_KEY = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHRheGVwb2Z1b2VscGxncmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTE4OTIsImV4cCI6MjA3OTEyNzg5Mn0.Neyu511N_7zLuFp0hywz2GBF-5TVgjLvcs70VrAj9QQ';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
};

// Database types for the parcels table
export interface ParcelRow {
  id: string;
  created_at: string;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  pickup_address: string;
  dropoff_address: string;
  description: string | null;
  status: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  distance_km: number | null;
  price_fcfa: number | null;
  assigned_driver_id: string | null;
  assigned_at: string | null;
  accepted_at: string | null;
  refused_at: string | null;
  refused_reason: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
}
