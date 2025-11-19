
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured, ParcelRow } from '@/config/supabase';
import { demoMode } from '@/config/demoMode';
import { calculateDistance } from '@/utils/distance';
import Constants from 'expo-constants';

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

  useEffect(() => {
    loadData();
  }, []);

  // Auto-calculate distance when both coordinates are available using Google Distance Matrix API
  useEffect(() => {
    if (pickupLat !== null && pickupLng !== null && dropoffLat !== null && dropoffLng !== null) {
      calculateDistanceFromGoogleAPI(pickupLat, pickupLng, dropoffLat, dropoffLng);
    } else {
      setDistanceKmState(0);
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Auto-update price when distance changes
  useEffect(() => {
    updatePriceFromDistance(distanceKm);
  }, [distanceKm]);

  // Calculate distance using Google Distance Matrix API
  const calculateDistanceFromGoogleAPI = async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ) => {
    try {
      // Get API key from expo constants
      const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn('Google Maps API key not configured');
        // Fallback to Haversine formula if API key is not available
        const distance = calculateDistance(originLat, originLng, destLat, destLng);
        console.log('Fallback to Haversine distance:', distance, 'km');
        setDistanceKmState(distance);
        return;
      }

      // Build the Distance Matrix API URL
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&mode=driving&language=fr&key=${apiKey}`;

      console.log('Calling Google Distance Matrix API...');
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows && data.rows[0]?.elements && data.rows[0].elements[0]) {
        const element = data.rows[0].elements[0];
        
        if (element.status === 'OK' && element.distance) {
          // Distance is in meters, convert to kilometers
          const distanceMeters = element.distance.value;
          const distanceKilometers = distanceMeters / 1000;
          
          console.log('Google Distance Matrix API result:', {
            distanceMeters,
            distanceKilometers: distanceKilometers.toFixed(2),
          });
          
          setDistanceKmState(distanceKilometers);
        } else {
          console.error('Distance Matrix element status:', element.status);
          // Fallback to Haversine formula
          const distance = calculateDistance(originLat, originLng, destLat, destLng);
          console.log('Fallback to Haversine distance:', distance, 'km');
          setDistanceKmState(distance);
        }
      } else {
        console.error('Distance Matrix API status:', data.status);
        if (data.error_message) {
          console.error('API Error:', data.error_message);
        }
        // Fallback to Haversine formula
        const distance = calculateDistance(originLat, originLng, destLat, destLng);
        console.log('Fallback to Haversine distance:', distance, 'km');
        setDistanceKmState(distance);
      }
    } catch (error) {
      console.error('Error calling Google Distance Matrix API:', error);
      // Fallback to Haversine formula
      const distance = calculateDistance(originLat, originLng, destLat, destLng);
      console.log('Fallback to Haversine distance:', distance, 'km');
      setDistanceKmState(distance);
    }
  };

  const loadData = async () => {
    try {
      // If Supabase is configured and not in demo mode, load from Supabase
      if (isSupabaseConfigured() && !demoMode) {
        console.log('Loading parcels from Supabase...');
        await loadFromSupabase();
      } else {
        // Otherwise, load from AsyncStorage (local mode)
        console.log('Loading parcels from AsyncStorage (local mode)...');
        await loadFromAsyncStorage();
      }
    } catch (error) {
      console.error('Error loading parcel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading parcels:', error);
        // Fallback to AsyncStorage if Supabase fails
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
  };

  const loadFromAsyncStorage = async () => {
    try {
      const storedParcels = await AsyncStorage.getItem(PARCELS_STORAGE_KEY);

      if (storedParcels) {
        setParcelRequests(JSON.parse(storedParcels));
        console.log('Parcel requests loaded from AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading from AsyncStorage:', error);
    }
  };

  const refreshParcels = async () => {
    setIsLoading(true);
    await loadData();
  };

  // Update price based on distance
  const updatePriceFromDistance = (distance: number) => {
    console.log('Calculating price for distance:', distance);
    
    if (distance <= 0) {
      // Si la distance n'est pas connue, on met le prix minimum
      setCalculatedPrice(PRICING_CONFIG.minPrice);
      return;
    }

    let price = 0;

    if (distance <= 10) {
      // Jusqu'à 10 km : baseFee + distance * pricePerKmShort
      price = PRICING_CONFIG.baseFee + (distance * PRICING_CONFIG.pricePerKmShort);
    } else {
      // Au-delà de 10 km : baseFee + (10 * pricePerKmShort) + ((distance - 10) * pricePerKmLong)
      price = PRICING_CONFIG.baseFee + 
              (10 * PRICING_CONFIG.pricePerKmShort) + 
              ((distance - 10) * PRICING_CONFIG.pricePerKmLong);
    }

    // Appliquer le prix minimum
    const finalPrice = Math.max(price, PRICING_CONFIG.minPrice);
    setCalculatedPrice(Math.round(finalPrice));
    
    console.log('Calculated price:', finalPrice, 'FCFA');
  };

  // Set pickup coordinates
  const setPickupCoordinates = (lat: number | null, lng: number | null, placeId?: string) => {
    console.log('Setting pickup coordinates:', { lat, lng, placeId });
    setPickupLat(lat);
    setPickupLng(lng);
    if (placeId) {
      setPickupPlaceId(placeId);
    }
  };

  // Set dropoff coordinates
  const setDropoffCoordinates = (lat: number | null, lng: number | null, placeId?: string) => {
    console.log('Setting dropoff coordinates:', { lat, lng, placeId });
    setDropoffLat(lat);
    setDropoffLng(lng);
    if (placeId) {
      setDropoffPlaceId(placeId);
    }
  };

  // Set distance and trigger price update
  const setDistanceKm = (distance: number) => {
    console.log('Manually setting distance:', distance);
    setDistanceKmState(distance);
  };

  // Reset all calculations
  const resetCalculations = () => {
    console.log('Resetting calculations');
    setPickupLat(null);
    setPickupLng(null);
    setDropoffLat(null);
    setDropoffLng(null);
    setPickupPlaceId(null);
    setDropoffPlaceId(null);
    setDistanceKmState(0);
    setCalculatedPrice(0);
  };

  const addParcelRequest = async (
    requestData: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    try {
      // If Supabase is configured and not in demo mode, insert to Supabase
      if (isSupabaseConfigured() && !demoMode) {
        console.log('Inserting parcel to Supabase...');
        return await insertToSupabase(requestData);
      } else {
        // Otherwise, save to AsyncStorage (local mode)
        console.log('Saving parcel to AsyncStorage (local mode)...');
        return await saveToAsyncStorage(requestData);
      }
    } catch (error) {
      console.error('Error adding parcel request:', error);
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
      const parcelRow = {
        sender_name: requestData.senderName,
        sender_phone: requestData.senderPhone,
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

      const { data, error } = await supabase
        .from('parcels')
        .insert([parcelRow])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return { 
          success: false, 
          error: 'Impossible d\'enregistrer le colis. Vérifiez votre connexion internet et réessayez.' 
        };
      }

      if (data) {
        const newParcel = convertSupabaseRowToParcel(data as ParcelRow);
        setParcelRequests(prev => [newParcel, ...prev]);
        console.log('Parcel inserted to Supabase:', data.id);
        return { success: true, requestId: data.id };
      }

      return { success: false, error: 'Erreur inconnue' };
    } catch (error) {
      console.error('Error inserting to Supabase:', error);
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
      
      console.log('Parcel request added to AsyncStorage:', newRequest);
      return { success: true, requestId: newRequest.id };
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
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
      // If Supabase is configured and not in demo mode, update in Supabase
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

      // Update local state
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
      
      // Also update AsyncStorage for offline access
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
        // Distance and price calculation
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
