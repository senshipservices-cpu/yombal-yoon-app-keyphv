
import { createClient } from '@supabase/supabase-js';

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
 *   price_fcfa INTEGER
 * );
 * 
 * -- Create an index for faster queries by sender phone
 * CREATE INDEX idx_parcels_sender_phone ON parcels(sender_phone);
 * 
 * -- Create an index for faster queries by status
 * CREATE INDEX idx_parcels_status ON parcels(status);
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
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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
}
