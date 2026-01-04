
import * as Location from 'expo-location';
import { supabase } from '@/app/integrations/supabase/client';

// Geofencing tolerance in meters (500m)
const GEOFENCE_RADIUS = 500;

// Minimum distance match percentage to pass verification (80%)
const MIN_DISTANCE_MATCH_PERCENTAGE = 80;

// Tracking interval in milliseconds (10 seconds)
const TRACKING_INTERVAL = 10000;

export interface TrackingPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  accuracy?: number;
}

export interface RideTrackingData {
  id: string;
  ride_id: string;
  driver_id: string;
  tracking_status: 'not_started' | 'tracking' | 'completed' | 'cancelled';
  departure_verified: boolean;
  destination_verified: boolean;
  total_distance_tracked: number;
  planned_distance: number;
  distance_match_percentage: number;
  passengers_confirmed: number;
  passengers_expected: number;
  verification_passed: boolean | null;
  tracking_points: TrackingPoint[];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if current location is within geofence radius of target location
 */
export function isWithinGeofence(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number = GEOFENCE_RADIUS
): boolean {
  const distance = calculateDistance(currentLat, currentLng, targetLat, targetLng);
  return distance <= radiusMeters;
}

/**
 * Calculate total distance from tracking points
 * Returns distance in kilometers
 */
export function calculateTotalDistance(points: TrackingPoint[]): number {
  if (points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const distance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    totalDistance += distance;
  }

  return totalDistance / 1000; // Convert to kilometers
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.error('Foreground location permission not granted');
      return false;
    }

    // Request background permissions for continuous tracking
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.warn('Background location permission not granted - tracking will only work in foreground');
      // Still return true as foreground is sufficient for basic tracking
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Initialize ride tracking
 */
export async function initializeRideTracking(
  rideId: string,
  driverId: string,
  plannedDistance: number,
  expectedPassengers: number
): Promise<{ success: boolean; trackingId?: string; error?: any }> {
  try {
    console.log('[RideTracking] Initializing tracking for ride:', rideId);

    // Check if tracking already exists
    const { data: existingTracking } = await supabase
      .from('ride_tracking')
      .select('id')
      .eq('ride_id', rideId)
      .single();

    if (existingTracking) {
      console.log('[RideTracking] Tracking already exists:', existingTracking.id);
      return { success: true, trackingId: existingTracking.id };
    }

    // Create new tracking record
    const { data, error } = await supabase
      .from('ride_tracking')
      .insert({
        ride_id: rideId,
        driver_id: driverId,
        tracking_status: 'not_started',
        planned_distance: plannedDistance,
        passengers_expected: expectedPassengers,
        tracking_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[RideTracking] Error creating tracking record:', error);
      return { success: false, error };
    }

    console.log('[RideTracking] Tracking initialized:', data.id);
    return { success: true, trackingId: data.id };
  } catch (error) {
    console.error('[RideTracking] Error in initializeRideTracking:', error);
    return { success: false, error };
  }
}

/**
 * Start GPS tracking for a ride
 */
export async function startRideTracking(
  trackingId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('[RideTracking] Starting tracking:', trackingId);

    // Update tracking status
    const { error } = await supabase
      .from('ride_tracking')
      .update({
        tracking_status: 'tracking',
        tracking_started_at: new Date().toISOString(),
      })
      .eq('id', trackingId);

    if (error) {
      console.error('[RideTracking] Error starting tracking:', error);
      return { success: false, error };
    }

    console.log('[RideTracking] Tracking started successfully');
    return { success: true };
  } catch (error) {
    console.error('[RideTracking] Error in startRideTracking:', error);
    return { success: false, error };
  }
}

/**
 * Add a tracking point
 */
export async function addTrackingPoint(
  trackingId: string,
  location: Location.LocationObject
): Promise<{ success: boolean; error?: any }> {
  try {
    const trackingPoint: TrackingPoint = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      timestamp: new Date().toISOString(),
      speed: location.coords.speed || undefined,
      accuracy: location.coords.accuracy || undefined,
    };

    // Get current tracking data
    const { data: tracking, error: fetchError } = await supabase
      .from('ride_tracking')
      .select('tracking_points, total_distance_tracked')
      .eq('id', trackingId)
      .single();

    if (fetchError || !tracking) {
      console.error('[RideTracking] Error fetching tracking data:', fetchError);
      return { success: false, error: fetchError };
    }

    const points: TrackingPoint[] = tracking.tracking_points || [];
    points.push(trackingPoint);

    // Calculate new total distance
    const totalDistance = calculateTotalDistance(points);

    // Update tracking record
    const { error: updateError } = await supabase
      .from('ride_tracking')
      .update({
        tracking_points: points,
        total_distance_tracked: totalDistance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trackingId);

    if (updateError) {
      console.error('[RideTracking] Error updating tracking point:', updateError);
      return { success: false, error: updateError };
    }

    return { success: true };
  } catch (error) {
    console.error('[RideTracking] Error in addTrackingPoint:', error);
    return { success: false, error };
  }
}

/**
 * Verify departure location
 */
export async function verifyDeparture(
  trackingId: string,
  currentLat: number,
  currentLng: number,
  plannedLat: number,
  plannedLng: number
): Promise<{ success: boolean; verified: boolean; distance: number; error?: any }> {
  try {
    console.log('[RideTracking] Verifying departure location');

    const distance = calculateDistance(currentLat, currentLng, plannedLat, plannedLng);
    const verified = distance <= GEOFENCE_RADIUS;

    // Update tracking record
    const { error } = await supabase
      .from('ride_tracking')
      .update({
        departure_verified: verified,
        departure_verified_at: new Date().toISOString(),
        departure_actual_lat: currentLat,
        departure_actual_lng: currentLng,
        departure_distance_from_planned: distance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trackingId);

    if (error) {
      console.error('[RideTracking] Error updating departure verification:', error);
      return { success: false, verified: false, distance, error };
    }

    console.log('[RideTracking] Departure verification:', verified ? 'PASSED' : 'FAILED', `(${Math.round(distance)}m)`);
    return { success: true, verified, distance };
  } catch (error) {
    console.error('[RideTracking] Error in verifyDeparture:', error);
    return { success: false, verified: false, distance: 0, error };
  }
}

/**
 * Verify destination location
 */
export async function verifyDestination(
  trackingId: string,
  currentLat: number,
  currentLng: number,
  plannedLat: number,
  plannedLng: number
): Promise<{ success: boolean; verified: boolean; distance: number; error?: any }> {
  try {
    console.log('[RideTracking] Verifying destination location');

    const distance = calculateDistance(currentLat, currentLng, plannedLat, plannedLng);
    const verified = distance <= GEOFENCE_RADIUS;

    // Update tracking record
    const { error } = await supabase
      .from('ride_tracking')
      .update({
        destination_verified: verified,
        destination_verified_at: new Date().toISOString(),
        destination_actual_lat: currentLat,
        destination_actual_lng: currentLng,
        destination_distance_from_planned: distance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trackingId);

    if (error) {
      console.error('[RideTracking] Error updating destination verification:', error);
      return { success: false, verified: false, distance, error };
    }

    console.log('[RideTracking] Destination verification:', verified ? 'PASSED' : 'FAILED', `(${Math.round(distance)}m)`);
    return { success: true, verified, distance };
  } catch (error) {
    console.error('[RideTracking] Error in verifyDestination:', error);
    return { success: false, verified: false, distance: 0, error };
  }
}

/**
 * Complete ride tracking and perform final verification
 */
export async function completeRideTracking(
  trackingId: string
): Promise<{ 
  success: boolean; 
  verificationPassed: boolean; 
  details?: {
    departureVerified: boolean;
    destinationVerified: boolean;
    distanceMatch: number;
    passengersConfirmed: number;
    passengersExpected: number;
  };
  error?: any 
}> {
  try {
    console.log('[RideTracking] Completing tracking:', trackingId);

    // Get tracking data
    const { data: tracking, error: fetchError } = await supabase
      .from('ride_tracking')
      .select('*')
      .eq('id', trackingId)
      .single();

    if (fetchError || !tracking) {
      console.error('[RideTracking] Error fetching tracking data:', fetchError);
      return { success: false, verificationPassed: false, error: fetchError };
    }

    // Calculate distance match percentage
    const distanceMatchPercentage = tracking.planned_distance > 0
      ? (tracking.total_distance_tracked / tracking.planned_distance) * 100
      : 0;

    // Determine if verification passed
    const verificationPassed =
      tracking.departure_verified &&
      tracking.destination_verified &&
      distanceMatchPercentage >= MIN_DISTANCE_MATCH_PERCENTAGE &&
      tracking.passengers_confirmed >= 1; // At least 1 passenger confirmed

    // Generate verification notes
    const notes: string[] = [];
    if (!tracking.departure_verified) {
      notes.push('Départ non vérifié (hors zone de géofencing)');
    }
    if (!tracking.destination_verified) {
      notes.push('Arrivée non vérifiée (hors zone de géofencing)');
    }
    if (distanceMatchPercentage < MIN_DISTANCE_MATCH_PERCENTAGE) {
      notes.push(`Distance parcourue insuffisante (${Math.round(distanceMatchPercentage)}% de la distance prévue)`);
    }
    if (tracking.passengers_confirmed < 1) {
      notes.push('Aucun passager confirmé');
    }

    // Update tracking record
    const { error: updateError } = await supabase
      .from('ride_tracking')
      .update({
        tracking_status: 'completed',
        tracking_ended_at: new Date().toISOString(),
        distance_match_percentage: distanceMatchPercentage,
        verification_passed: verificationPassed,
        verification_notes: notes.length > 0 ? notes.join('; ') : 'Vérification réussie',
        updated_at: new Date().toISOString(),
      })
      .eq('id', trackingId);

    if (updateError) {
      console.error('[RideTracking] Error completing tracking:', updateError);
      return { success: false, verificationPassed: false, error: updateError };
    }

    console.log('[RideTracking] Tracking completed. Verification:', verificationPassed ? 'PASSED' : 'FAILED');

    return {
      success: true,
      verificationPassed,
      details: {
        departureVerified: tracking.departure_verified,
        destinationVerified: tracking.destination_verified,
        distanceMatch: distanceMatchPercentage,
        passengersConfirmed: tracking.passengers_confirmed,
        passengersExpected: tracking.passengers_expected,
      },
    };
  } catch (error) {
    console.error('[RideTracking] Error in completeRideTracking:', error);
    return { success: false, verificationPassed: false, error };
  }
}

/**
 * Generate QR code for passenger confirmation
 */
export function generatePassengerQRCode(rideId: string, bookingId: string, passengerId: string): string {
  // Generate a unique QR code string
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `YOMBAL_${rideId}_${bookingId}_${passengerId}_${timestamp}_${random}`;
}

/**
 * Confirm passenger boarding
 */
export async function confirmPassengerBoarding(
  rideId: string,
  bookingId: string,
  passengerId: string,
  confirmedBy: 'driver' | 'passenger' | 'qr_code',
  qrCode?: string,
  currentLat?: number,
  currentLng?: number
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('[RideTracking] Confirming passenger boarding:', passengerId);

    // Create or update passenger confirmation
    const { data, error } = await supabase
      .from('passenger_confirmations')
      .upsert({
        ride_id: rideId,
        booking_id: bookingId,
        passenger_id: passengerId,
        confirmed: true,
        confirmed_at: new Date().toISOString(),
        confirmed_by: confirmedBy,
        qr_code: qrCode,
        qr_code_scanned: confirmedBy === 'qr_code',
        qr_code_scanned_at: confirmedBy === 'qr_code' ? new Date().toISOString() : null,
        confirmation_lat: currentLat,
        confirmation_lng: currentLng,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[RideTracking] Error confirming passenger:', error);
      return { success: false, error };
    }

    // Update tracking record with confirmed passenger count
    const { data: confirmations } = await supabase
      .from('passenger_confirmations')
      .select('id')
      .eq('ride_id', rideId)
      .eq('confirmed', true);

    const confirmedCount = confirmations?.length || 0;

    await supabase
      .from('ride_tracking')
      .update({
        passengers_confirmed: confirmedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('ride_id', rideId);

    console.log('[RideTracking] Passenger confirmed. Total confirmed:', confirmedCount);
    return { success: true };
  } catch (error) {
    console.error('[RideTracking] Error in confirmPassengerBoarding:', error);
    return { success: false, error };
  }
}

/**
 * Get tracking data for a ride
 */
export async function getRideTrackingData(
  rideId: string
): Promise<{ success: boolean; data?: RideTrackingData; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('ride_tracking')
      .select('*')
      .eq('ride_id', rideId)
      .single();

    if (error) {
      console.error('[RideTracking] Error fetching tracking data:', error);
      return { success: false, error };
    }

    return { success: true, data: data as RideTrackingData };
  } catch (error) {
    console.error('[RideTracking] Error in getRideTrackingData:', error);
    return { success: false, error };
  }
}
