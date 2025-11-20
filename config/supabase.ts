
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * SUPABASE CONFIGURATION FOR YOMBAL YOON
 * 
 * To enable Supabase integration:
 * 1. Click the Supabase button in Natively
 * 2. Connect to your Supabase project (or create one at https://supabase.com)
 * 3. The EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY will be automatically configured
 * 
 * Required Supabase Table: parcels
 * 
 * Create this table in your Supabase project with the following SQL:
 * 
 * CREATE TABLE parcels (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
 *   sender_name TEXT NOT NULL,
 *   sender_phone TEXT NOT NULL,
 *   recipient_name TEXT NOT NULL,
 *   recipient_phone TEXT NOT NULL,
 *   pickup_address TEXT NOT NULL,
 *   dropoff_address TEXT NOT NULL,
 *   description TEXT,
 *   status TEXT DEFAULT 'pending',
 *   pickup_lat DOUBLE PRECISION,
 *   pickup_lng DOUBLE PRECISION,
 *   dropoff_lat DOUBLE PRECISION,
 *   dropoff_lng DOUBLE PRECISION,
 *   distance_km DOUBLE PRECISION,
 *   price_fcfa INTEGER,
 *   assigned_driver_id TEXT,
 *   assigned_at TIMESTAMP WITH TIME ZONE,
 *   accepted_at TIMESTAMP WITH TIME ZONE,
 *   refused_at TIMESTAMP WITH TIME ZONE,
 *   refused_reason TEXT,
 *   picked_up_at TIMESTAMP WITH TIME ZONE,
 *   delivered_at TIMESTAMP WITH TIME ZONE
 * );
 * 
 * -- Create an index for faster queries by sender phone
 * CREATE INDEX idx_parcels_sender_phone ON parcels(sender_phone);
 * 
 * -- Create an index for faster queries by status
 * CREATE INDEX idx_parcels_status ON parcels(status);
 * 
 * -- Create an index for faster queries by assigned driver
 * CREATE INDEX idx_parcels_assigned_driver ON parcels(assigned_driver_id);
 * 
 * -- Enable Row Level Security (RLS) - Optional but recommended
 * ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
 * 
 * -- Allow anyone to insert parcels (for now - adjust based on your auth strategy)
 * CREATE POLICY "Allow public insert" ON parcels FOR INSERT WITH CHECK (true);
 * 
 * -- Allow anyone to read parcels (for now - adjust based on your auth strategy)
 * CREATE POLICY "Allow public read" ON parcels FOR SELECT USING (true);
 * 
 * -- Allow anyone to update parcels (for now - adjust based on your auth strategy)
 * CREATE POLICY "Allow public update" ON parcels FOR UPDATE USING (true);
 */

// Supabase configuration
// These values will be automatically populated when you connect Supabase in Natively
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
