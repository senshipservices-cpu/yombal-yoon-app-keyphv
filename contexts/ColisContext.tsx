
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured, ParcelRow } from '@/config/supabase';
import { demoMode } from '@/config/demoMode';
import { calculateDistance } from '@/utils/distance';

export interface Location {
  lat: number;
  lng: number;
}

export interface ParcelRequest {
  id: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  departureAddress: string;
  departureLocation?: Location;
  arrivalAddress: string;
  arrivalLocation?: Location;
  description: string;
  status: 'pending' | 'assigned' | 'en_route_pickup' | 'picked_up' | 'en_route_delivery' | 'delivered' | 'cancelled';
  deliveryOption: 'standard' | 'express';
  pricing?: {
    distance: number;
    baseFee: number;
    kmFee: number;
    total: number;
  };
  createdAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

// Pricing constants
export const PRICING_CONFIG = {
  baseFee: 700,
  pricePerKmShort: 120, // jusqu'à 10 km
  pricePerKmLong: 100,  // au-delà de 10 km
  minPrice: 1000,
};

interface ColisContextType {
  parcelRequests: ParcelRequest[];
  addParcelRequest: (request: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>) => Promise<{ success: boolean; requestId?: string; error?: string }>;
  updateParcelStatus: (parcelId: string, status: ParcelRequest['status']) => Promise<void>;
  getParcelRequestsBySender: (senderPhone: string) => ParcelRequest[];
  getParcelById: (parcelId: string) => ParcelRequest | undefined;
  isLoading: boolean;
  refreshParcels: () => Promise<void>;
  
  // Distance and price calculation
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  pickupPlaceId: string | null;
  dropoffPlaceId: string | null;
  distanceKm: number;
  calculatedPrice: number;
  setPickupCoordinates: (lat: number | null, lng: number | null, placeId?: string) => void;
  setDropoffCoordinates: (lat: number | null, lng: number | null, placeId?: string) => void;
  setDistanceKm: (distance: number) => void;
  updatePriceFromDistance: (distance: number) => void;
  resetCalculations: () => void;
}

const ColisContext = createContext<ColisContextType | undefined>(undefined);

const PARCELS_STORAGE_KEY = '@yombal_yoon_parcels';

// Helper function to convert Supabase row to ParcelRequest
const convertSupabaseRowToParcel = (row: ParcelRow): ParcelRequest => {
  return {
    id: row.id,
    senderName: row.sender_name,
    senderPhone: row.sender_phone,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    departureAddress: row.pickup_address,
    departureLocation: row.pickup_lat && row.pickup_lng ? {
      lat: row.pickup_lat,
      lng: row.pickup_lng,
    } : undefined,
    arrivalAddress: row.dropoff_address,
    arrivalLocation: row.dropoff_lat && row.dropoff_lng ? {
      lat: row.dropoff_lat,
      lng: row.dropoff_lng,
    } : undefined,
    description: row.description || '',
    status: row.status as ParcelRequest['status'],
    deliveryOption: 'standard',
    pricing: row.distance_km && row.price_fcfa ? {
      distance: row.distance_km,
      baseFee: 1000,
      kmFee: row.price_fcfa - 1000,
      total: row.price_fcfa,
    } : undefined,
    createdAt: row.created_at,
  };
};

export function ColisProvider({ children }: { children: ReactNode }) {
  const [parcelRequests, setParcelRequests] = useState<ParcelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Distance and price calculation state
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);
  const [pickupPlaceId, setPickupPlaceId] = useState<string | null>(null);
  const [dropoffPlaceId, setDropoffPlaceId] = useState<string | null>(null);
  const [distanceKm, setDistanceKmState] = useState<number>(0);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // CALCUL DE DISTANCE ET DURÉE (Google Distance Matrix API)
  const calculateDistanceFromGoogleAPI = useCallback(async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ) => {
    try {
      console.log('🔍 Calling Google Distance Matrix API...');
      console.log('📍 Origin:', { lat: originLat, lng: originLng });
      console.log('📍 Destination:', { lat: destLat, lng: destLng });

      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'distance_matrix',
          origins: `${originLat},${originLng}`,
          destinations: `${destLat},${destLng}`,
          mode: 'driving',
          language: 'fr',
        },
      });

      if (error) {
        console.error('❌ Error calling Distance Matrix API:', error);
        // Fallback to Haversine formula
        const distance = calculateDistance(originLat, originLng, destLat, destLng);
        console.log('⚠️ Fallback to Haversine distance:', distance, 'km');
        setDistanceKmState(distance);
        return;
      }

      if (data.status === 'OK' && data.rows && data.rows[0]?.elements && data.rows[0].elements[0]) {
        const element = data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          // Distance en mètres, convertir en kilomètres
          const distanceMeters = element.distance?.value || 0;
          const distanceKilometers = distanceMeters / 1000;
          
          // Durée en secondes (optionnel)
          const durationSeconds = element.duration?.value || 0;
          const durationMinutes = Math.round(durationSeconds / 60);
          
          console.log('✅ Distance Matrix API result:');
          console.log('   - Distance:', distanceKilometers.toFixed(2), 'km');
          console.log('   - Durée:', durationMinutes, 'minutes');
          
          setDistanceKmState(distanceKilometers);
        } else {
          console.error('❌ Distance Matrix element status:', element.status);
          // Fallback to Haversine formula
          const distance = calculateDistance(originLat, originLng, destLat, destLng);
          console.log('⚠️ Fallback to Haversine distance:', distance, 'km');
          setDistanceKmState(distance);
        }
      } else {
        console.error('❌ Distance Matrix API status:', data.status);
        if (data.error_message) {
          console.error('API Error:', data.error_message);
        }
        // Fallback to Haversine formula
        const distance = calculateDistance(originLat, originLng, destLat, destLng);
        console.log('⚠️ Fallback to Haversine distance:', distance, 'km');
        setDistanceKmState(distance);
      }
    } catch (error) {
      console.error('❌ Error calling Google Distance Matrix API:', error);
      // Fallback to Haversine formula
      const distance = calculateDistance(originLat, originLng, destLat, destLng);
      console.log('⚠️ Fallback to Haversine distance:', distance, 'km');
      setDistanceKmState(distance);
    }
  }, []);

  const loadFromAsyncStorage = useCallback(async () => {
    try {
      const storedParcels = await AsyncStorage.getItem(PARCELS_STORAGE_KEY);

      if (storedParcels) {
        setParcelRequests(JSON.parse(storedParcels));
        console.log('Parcel requests loaded from AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading from AsyncStorage:', error);
    }
  }, []);

  const loadFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading parcels:', error);
        await loadFromAsyncStorage();
        return;
      }

      if (data) {
        const parcels = data.map(convertSupabaseRowToParcel);
        setParcelRequests(parcels);
        console.log(`Loaded ${parcels.length} parcels from Supabase`);
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      await loadFromAsyncStorage();
    }
  }, [loadFromAsyncStorage]);

  const loadData = useCallback(async () => {
    try {
      if (isSupabaseConfigured() && !demoMode) {
        console.log('Loading parcels from Supabase...');
        await loadFromSupabase();
      } else {
        console.log('Loading parcels from AsyncStorage (local mode)...');
        await loadFromAsyncStorage();
      }
    } catch (error) {
      console.error('Error loading parcel data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromSupabase, loadFromAsyncStorage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // AUTO-CALCUL DE DISTANCE QUAND LES 4 COORDONNÉES SONT DISPONIBLES
  useEffect(() => {
    if (pickupLat !== null && pickupLng !== null && dropoffLat !== null && dropoffLng !== null) {
      console.log('✅ All coordinates available, calculating distance...');
      calculateDistanceFromGoogleAPI(pickupLat, pickupLng, dropoffLat, dropoffLng);
    } else {
      setDistanceKmState(0);
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, calculateDistanceFromGoogleAPI]);

  // MISE À JOUR DU PRIX AUTOMATIQUE
  const updatePriceFromDistance = useCallback((distance: number) => {
    console.log('💰 Calculating price for distance:', distance, 'km');
    
    if (distance <= 0) {
      setCalculatedPrice(PRICING_CONFIG.minPrice);
      console.log('   → Minimum price:', PRICING_CONFIG.minPrice, 'FCFA');
      return;
    }

    let price = 0;

    if (distance <= 10) {
      price = PRICING_CONFIG.baseFee + (distance * PRICING_CONFIG.pricePerKmShort);
      console.log('   → Short distance pricing:');
      console.log('     - Base fee:', PRICING_CONFIG.baseFee, 'FCFA');
      console.log('     - Distance fee:', distance * PRICING_CONFIG.pricePerKmShort, 'FCFA');
    } else {
      price = PRICING_CONFIG.baseFee + 
              (10 * PRICING_CONFIG.pricePerKmShort) + 
              ((distance - 10) * PRICING_CONFIG.pricePerKmLong);
      console.log('   → Long distance pricing:');
      console.log('     - Base fee:', PRICING_CONFIG.baseFee, 'FCFA');
      console.log('     - First 10 km:', 10 * PRICING_CONFIG.pricePerKmShort, 'FCFA');
      console.log('     - Additional km:', (distance - 10) * PRICING_CONFIG.pricePerKmLong, 'FCFA');
    }

    const finalPrice = Math.max(price, PRICING_CONFIG.minPrice);
    setCalculatedPrice(Math.round(finalPrice));
    
    console.log('✅ Final calculated price:', Math.round(finalPrice), 'FCFA');
  }, []);

  // AUTO-UPDATE PRICE WHEN DISTANCE CHANGES
  useEffect(() => {
    updatePriceFromDistance(distanceKm);
  }, [distanceKm, updatePriceFromDistance]);

  const refreshParcels = async () => {
    setIsLoading(true);
    await loadData();
  };

  const setPickupCoordinates = (lat: number | null, lng: number | null, placeId?: string) => {
    console.log('📍 Setting pickup coordinates:', { lat, lng, placeId });
    setPickupLat(lat);
    setPickupLng(lng);
    if (placeId) {
      setPickupPlaceId(placeId);
    }
  };

  const setDropoffCoordinates = (lat: number | null, lng: number | null, placeId?: string) => {
    console.log('📍 Setting dropoff coordinates:', { lat, lng, placeId });
    setDropoffLat(lat);
    setDropoffLng(lng);
    if (placeId) {
      setDropoffPlaceId(placeId);
    }
  };

  const setDistanceKm = (distance: number) => {
    console.log('📏 Manually setting distance:', distance, 'km');
    setDistanceKmState(distance);
  };

  const resetCalculations = () => {
    console.log('🔄 Resetting calculations');
    setPickupLat(null);
    setPickupLng(null);
    setDropoffLat(null);
    setDropoffLng(null);
    setPickupPlaceId(null);
    setDropoffPlaceId(null);
    setDistanceKmState(0);
    setCalculatedPrice(0);
  };

  // Helper function to create internal log
  const createInternalLog = async (parcelId: string, requestData: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      console.log('📝 Creating internal log for parcel:', parcelId);
      
      const logData = {
        parcel_id: parcelId,
        user_id: 'current_user',
        sender_phone: requestData.senderPhone,
        recipient_phone: requestData.recipientPhone,
        pickup_lat: requestData.departureLocation?.lat || null,
        pickup_lng: requestData.departureLocation?.lng || null,
        dropoff_lat: requestData.arrivalLocation?.lat || null,
        dropoff_lng: requestData.arrivalLocation?.lng || null,
        pickup_address: requestData.departureAddress,
        dropoff_address: requestData.arrivalAddress,
        distance_km: requestData.pricing?.distance || null,
        price_fcfa: requestData.pricing?.total || null,
        status: 'pending',
      };

      const { error } = await supabase
        .from('parcel_logs')
        .insert([logData]);

      if (error) {
        console.error('❌ Error creating internal log:', error);
      } else {
        console.log('✅ Internal log created successfully');
      }
    } catch (error) {
      console.error('❌ Error creating internal log:', error);
    }
  };

  const addParcelRequest = async (
    requestData: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('📦 ADDING PARCEL REQUEST - START');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 Request Data:');
      console.log('   - Sender Name:', requestData.senderName);
      console.log('   - Sender Phone:', requestData.senderPhone);
      console.log('   - Recipient Name:', requestData.recipientName);
      console.log('   - Recipient Phone:', requestData.recipientPhone);
      console.log('   - Departure Address:', requestData.departureAddress);
      console.log('   - Arrival Address:', requestData.arrivalAddress);
      console.log('   - Description:', requestData.description);
      console.log('   - Has Departure Location:', !!requestData.departureLocation);
      console.log('   - Has Arrival Location:', !!requestData.arrivalLocation);
      
      if (requestData.departureLocation) {
        console.log('   - Departure Coordinates:', requestData.departureLocation);
      }
      if (requestData.arrivalLocation) {
        console.log('   - Arrival Coordinates:', requestData.arrivalLocation);
      }
      if (requestData.pricing) {
        console.log('   - Pricing:', requestData.pricing);
      }
      
      // ✅ VALIDATION STRICTE - PARTIE 2
      // Vérifier que tous les champs obligatoires sont remplis
      console.log('🔍 VALIDATION STEP 1: Checking required fields...');
      if (!requestData.senderName || !requestData.senderPhone || 
          !requestData.recipientName || !requestData.recipientPhone ||
          !requestData.departureAddress || !requestData.arrivalAddress ||
          !requestData.description) {
        console.error('❌ VALIDATION FAILED: Missing required fields');
        console.error('   - Sender Name:', !!requestData.senderName);
        console.error('   - Sender Phone:', !!requestData.senderPhone);
        console.error('   - Recipient Name:', !!requestData.recipientName);
        console.error('   - Recipient Phone:', !!requestData.recipientPhone);
        console.error('   - Departure Address:', !!requestData.departureAddress);
        console.error('   - Arrival Address:', !!requestData.arrivalAddress);
        console.error('   - Description:', !!requestData.description);
        return { 
          success: false, 
          error: 'Veuillez remplir tous les champs obligatoires' 
        };
      }
      console.log('✅ VALIDATION STEP 1: All required fields present');

      // ✅ VALIDATION STRICTE DES COORDONNÉES
      // Vérifier que les adresses ont été sélectionnées dans l'autocomplétion (avec lat/lng)
      console.log('🔍 VALIDATION STEP 2: Checking departure coordinates...');
      if (!requestData.departureLocation || 
          !requestData.departureLocation.lat || 
          !requestData.departureLocation.lng) {
        console.error('❌ VALIDATION FAILED: Missing departure coordinates');
        console.error('   - Departure Location:', requestData.departureLocation);
        return { 
          success: false, 
          error: 'Veuillez sélectionner l\'adresse de départ dans la liste d\'autocomplétion.' 
        };
      }
      console.log('✅ VALIDATION STEP 2: Departure coordinates valid');

      console.log('🔍 VALIDATION STEP 3: Checking arrival coordinates...');
      if (!requestData.arrivalLocation || 
          !requestData.arrivalLocation.lat || 
          !requestData.arrivalLocation.lng) {
        console.error('❌ VALIDATION FAILED: Missing arrival coordinates');
        console.error('   - Arrival Location:', requestData.arrivalLocation);
        return { 
          success: false, 
          error: 'Veuillez sélectionner l\'adresse d\'arrivée dans la liste d\'autocomplétion.' 
        };
      }
      console.log('✅ VALIDATION STEP 3: Arrival coordinates valid');

      console.log('✅ ALL VALIDATIONS PASSED - Proceeding with submission');

      // If Supabase is configured and not in demo mode, insert to Supabase
      if (isSupabaseConfigured() && !demoMode) {
        console.log('🔄 Inserting parcel to Supabase...');
        const result = await insertToSupabase(requestData);
        
        // Create internal log if successful
        if (result.success && result.requestId) {
          await createInternalLog(result.requestId, requestData);
        }
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📦 ADDING PARCEL REQUEST - END');
        console.log('   Result:', result.success ? 'SUCCESS' : 'FAILED');
        if (result.error) {
          console.log('   Error:', result.error);
        }
        console.log('═══════════════════════════════════════════════════════');
        
        return result;
      } else {
        // Otherwise, save to AsyncStorage (local mode)
        console.log('💾 Saving parcel to AsyncStorage (local mode)...');
        const result = await saveToAsyncStorage(requestData);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📦 ADDING PARCEL REQUEST - END');
        console.log('   Result:', result.success ? 'SUCCESS' : 'FAILED');
        console.log('═══════════════════════════════════════════════════════');
        
        return result;
      }
    } catch (error) {
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ EXCEPTION IN addParcelRequest');
      console.error('   Error:', error);
      console.error('   Stack:', error.stack);
      console.error('═══════════════════════════════════════════════════════');
      return { 
        success: false, 
        error: 'Une erreur est survenue lors de l\'enregistrement du colis' 
      };
    }
  };

  const insertToSupabase = async (
    requestData: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    try {
      // 🔍 PARTIE 1 - ACTION 1: Prepare payload
      const parcelRow = {
        sender_name: requestData.senderName,
        sender_phone: requestData.senderPhone,
        sender_id: requestData.senderPhone,
        recipient_name: requestData.recipientName,
        recipient_phone: requestData.recipientPhone,
        pickup_address: requestData.departureAddress,
        dropoff_address: requestData.arrivalAddress,
        description: requestData.description || null,
        status: 'pending',
        pickup_lat: requestData.departureLocation?.lat || null,
        pickup_lng: requestData.departureLocation?.lng || null,
        dropoff_lat: requestData.arrivalLocation?.lat || null,
        dropoff_lng: requestData.arrivalLocation?.lng || null,
        distance_km: requestData.pricing?.distance || null,
        price_fcfa: requestData.pricing?.total || null,
      };

      console.log('═══════════════════════════════════════════════════════');
      console.log('📤 ADD_PARCEL_REQUEST_PAYLOAD');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 Payload to be sent to Supabase:');
      console.log(JSON.stringify(parcelRow, null, 2));
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔍 Field-by-field validation:');
      console.log('   - sender_name:', typeof parcelRow.sender_name, '→', parcelRow.sender_name);
      console.log('   - sender_phone:', typeof parcelRow.sender_phone, '→', parcelRow.sender_phone);
      console.log('   - sender_id:', typeof parcelRow.sender_id, '→', parcelRow.sender_id);
      console.log('   - recipient_name:', typeof parcelRow.recipient_name, '→', parcelRow.recipient_name);
      console.log('   - recipient_phone:', typeof parcelRow.recipient_phone, '→', parcelRow.recipient_phone);
      console.log('   - pickup_address:', typeof parcelRow.pickup_address, '→', parcelRow.pickup_address);
      console.log('   - dropoff_address:', typeof parcelRow.dropoff_address, '→', parcelRow.dropoff_address);
      console.log('   - description:', typeof parcelRow.description, '→', parcelRow.description);
      console.log('   - status:', typeof parcelRow.status, '→', parcelRow.status);
      console.log('   - pickup_lat:', typeof parcelRow.pickup_lat, '→', parcelRow.pickup_lat);
      console.log('   - pickup_lng:', typeof parcelRow.pickup_lng, '→', parcelRow.pickup_lng);
      console.log('   - dropoff_lat:', typeof parcelRow.dropoff_lat, '→', parcelRow.dropoff_lat);
      console.log('   - dropoff_lng:', typeof parcelRow.dropoff_lng, '→', parcelRow.dropoff_lng);
      console.log('   - distance_km:', typeof parcelRow.distance_km, '→', parcelRow.distance_km);
      console.log('   - price_fcfa:', typeof parcelRow.price_fcfa, '→', parcelRow.price_fcfa);
      console.log('═══════════════════════════════════════════════════════');

      // 🔍 PARTIE 1 - ACTION 2: Verify table structure expectations
      console.log('📊 Expected table structure (parcels):');
      console.log('   Required columns (NOT NULL):');
      console.log('   - sender_name: text');
      console.log('   - sender_phone: text');
      console.log('   - recipient_name: text');
      console.log('   - recipient_phone: text');
      console.log('   - pickup_address: text');
      console.log('   - dropoff_address: text');
      console.log('   Optional columns (nullable):');
      console.log('   - sender_id: text');
      console.log('   - description: text');
      console.log('   - status: text (default: pending)');
      console.log('   - pickup_lat: double precision');
      console.log('   - pickup_lng: double precision');
      console.log('   - dropoff_lat: double precision');
      console.log('   - dropoff_lng: double precision');
      console.log('   - distance_km: double precision');
      console.log('   - price_fcfa: integer');
      console.log('═══════════════════════════════════════════════════════');

      console.log('🚀 Calling Supabase insert...');
      const { data, error } = await supabase
        .from('parcels')
        .insert([parcelRow])
        .select()
        .single();

      // 🔍 PARTIE 1 - ACTION 1: Log complete result
      console.log('═══════════════════════════════════════════════════════');
      console.log('📬 ADD_PARCEL_REQUEST_RESULT');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📊 Supabase Response:');
      console.log('   - data:', data ? JSON.stringify(data, null, 2) : 'null');
      console.log('   - error:', error ? JSON.stringify(error, null, 2) : 'null');
      console.log('═══════════════════════════════════════════════════════');

      if (error) {
        console.error('═══════════════════════════════════════════════════════');
        console.error('❌ SUPABASE INSERT ERROR - DETAILED ANALYSIS');
        console.error('═══════════════════════════════════════════════════════');
        console.error('📋 Error Details:');
        console.error('   - Code:', error.code);
        console.error('   - Message:', error.message);
        console.error('   - Details:', error.details);
        console.error('   - Hint:', error.hint);
        console.error('   - Full Error Object:', JSON.stringify(error, null, 2));
        console.error('═══════════════════════════════════════════════════════');
        console.error('🔍 Error Analysis:');
        
        // Provide more specific error messages based on error code
        let userMessage = 'Impossible d\'enregistrer le colis. Vérifiez votre connexion internet et réessayez.';
        
        if (error.code === '23502') {
          // NOT NULL violation
          console.error('⚠️ ERROR TYPE: NOT NULL VIOLATION');
          console.error('   A required field is missing or null');
          console.error('   Check which field is mentioned in error.details or error.message');
          userMessage = 'Certaines informations obligatoires sont manquantes. Veuillez vérifier tous les champs.';
        } else if (error.code === '23503') {
          // Foreign key violation
          console.error('⚠️ ERROR TYPE: FOREIGN KEY VIOLATION');
          console.error('   A referenced record does not exist');
          userMessage = 'Erreur de référence dans la base de données. Veuillez contacter le support.';
        } else if (error.code === '23505') {
          // Unique violation
          console.error('⚠️ ERROR TYPE: UNIQUE VIOLATION');
          console.error('   A unique constraint is violated');
          userMessage = 'Ce colis existe déjà dans le système.';
        } else if (error.code === '42501') {
          // Insufficient privilege
          console.error('⚠️ ERROR TYPE: PERMISSION DENIED (RLS)');
          console.error('   Row Level Security policy is blocking the insert');
          console.error('   Check RLS policies on the parcels table');
          userMessage = 'Vous n\'avez pas les permissions nécessaires pour créer un colis.';
        } else if (error.code === '42703') {
          // Undefined column
          console.error('⚠️ ERROR TYPE: UNDEFINED COLUMN');
          console.error('   A column name in the payload does not exist in the table');
          console.error('   Check for typos in column names');
          userMessage = 'Erreur de configuration de la base de données. Veuillez contacter le support.';
        } else if (error.code === '22P02') {
          // Invalid text representation
          console.error('⚠️ ERROR TYPE: INVALID DATA TYPE');
          console.error('   A value has the wrong data type');
          console.error('   Check that numbers are numbers, strings are strings, etc.');
          userMessage = 'Format de données invalide. Veuillez vérifier vos informations.';
        } else {
          console.error('⚠️ ERROR TYPE: UNKNOWN ERROR CODE:', error.code);
          console.error('   This is an unexpected error');
        }
        
        console.error('═══════════════════════════════════════════════════════');
        console.error('🔧 DIAGNOSTIC RECOMMENDATIONS:');
        console.error('   1. Check the error.message for specific field names');
        console.error('   2. Verify all NOT NULL columns are provided');
        console.error('   3. Check data types match the table schema');
        console.error('   4. Verify RLS policies allow insert for anonymous users');
        console.error('   5. Check for typos in column names');
        console.error('═══════════════════════════════════════════════════════');
        
        return { 
          success: false, 
          error: userMessage
        };
      }

      if (data) {
        const newParcel = convertSupabaseRowToParcel(data as ParcelRow);
        setParcelRequests(prev => [newParcel, ...prev]);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ SUPABASE INSERT SUCCESS');
        console.log('═══════════════════════════════════════════════════════');
        console.log('   - Parcel ID:', data.id);
        console.log('   - Status:', data.status);
        console.log('   - Created At:', data.created_at);
        console.log('   - Full Data:', JSON.stringify(data, null, 2));
        console.log('═══════════════════════════════════════════════════════');
        
        return { success: true, requestId: data.id };
      }

      console.error('❌ SUPABASE INSERT: No data returned (unexpected)');
      return { success: false, error: 'Erreur inconnue' };
    } catch (error) {
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ EXCEPTION IN insertToSupabase');
      console.error('═══════════════════════════════════════════════════════');
      console.error('   Error:', error);
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      console.error('   Error Type:', error.constructor.name);
      console.error('   Full Error Object:', JSON.stringify(error, null, 2));
      console.error('═══════════════════════════════════════════════════════');
      return { 
        success: false, 
        error: 'Impossible d\'enregistrer le colis. Vérifiez votre connexion internet et réessayez.' 
      };
    }
  };

  const saveToAsyncStorage = async (
    requestData: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    try {
      const newRequest: ParcelRequest = {
        ...requestData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = [newRequest, ...parcelRequests];
      setParcelRequests(updatedRequests);
      await AsyncStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(updatedRequests));
      
      console.log('✅ Parcel request added to AsyncStorage:', newRequest.id);
      return { success: true, requestId: newRequest.id };
    } catch (error) {
      console.error('❌ Error saving to AsyncStorage:', error);
      return { 
        success: false, 
        error: 'Une erreur est survenue lors de l\'enregistrement' 
      };
    }
  };

  const updateParcelStatus = async (
    parcelId: string,
    status: ParcelRequest['status']
  ) => {
    try {
      if (isSupabaseConfigured() && !demoMode) {
        const { error } = await supabase
          .from('parcels')
          .update({ status })
          .eq('id', parcelId);

        if (error) {
          console.error('Supabase update error:', error);
          return;
        }
      }

      const updatedRequests = parcelRequests.map(request => {
        if (request.id === parcelId) {
          const updated = { ...request, status };
          
          if (status === 'assigned' && !request.assignedAt) {
            updated.assignedAt = new Date().toISOString();
          } else if (status === 'picked_up' && !request.pickedUpAt) {
            updated.pickedUpAt = new Date().toISOString();
          } else if (status === 'delivered' && !request.deliveredAt) {
            updated.deliveredAt = new Date().toISOString();
          }
          
          return updated;
        }
        return request;
      });

      setParcelRequests(updatedRequests);
      await AsyncStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(updatedRequests));
      
      console.log('Parcel status updated:', status);
    } catch (error) {
      console.error('Error updating parcel status:', error);
    }
  };

  const getParcelRequestsBySender = (senderPhone: string): ParcelRequest[] => {
    return parcelRequests.filter(request => request.senderPhone === senderPhone);
  };

  const getParcelById = (parcelId: string): ParcelRequest | undefined => {
    return parcelRequests.find(request => request.id === parcelId);
  };

  return (
    <ColisContext.Provider
      value={{
        parcelRequests,
        addParcelRequest,
        updateParcelStatus,
        getParcelRequestsBySender,
        getParcelById,
        isLoading,
        refreshParcels,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        pickupPlaceId,
        dropoffPlaceId,
        distanceKm,
        calculatedPrice,
        setPickupCoordinates,
        setDropoffCoordinates,
        setDistanceKm,
        updatePriceFromDistance,
        resetCalculations,
      }}
    >
      {children}
    </ColisContext.Provider>
  );
}

export function useColis() {
  const context = useContext(ColisContext);
  if (context === undefined) {
    throw new Error('useColis must be used within a ColisProvider');
  }
  return context;
}
