
import * as Location from 'expo-location';
import { supabase } from '@/app/integrations/supabase/client';
import * as Linking from 'expo-linking';

export interface TripShare {
  id: string;
  ride_id: string;
  booking_id: string | null;
  passenger_id: string;
  share_token: string;
  share_url: string;
  is_active: boolean;
  expires_at: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_email: string | null;
  show_passenger_name: boolean;
  show_driver_info: boolean;
  show_exact_location: boolean;
  sos_triggered: boolean;
  created_at: string;
}

export interface TripShareLocation {
  id: string;
  trip_share_id: string;
  ride_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  status: 'en_route' | 'arrived' | 'delayed' | 'emergency';
  created_at: string;
}

export interface TripShareDetails {
  share: TripShare;
  ride: any;
  driver: any;
  passenger: any;
  currentLocation: TripShareLocation | null;
  locationHistory: TripShareLocation[];
}

/**
 * Create a trip share link
 */
export async function createTripShare(
  rideId: string,
  bookingId: string | null,
  passengerId: string,
  recipientName?: string,
  recipientPhone?: string,
  recipientEmail?: string,
  expiresInHours?: number
): Promise<{ success: boolean; share?: TripShare; shareUrl?: string; error?: any }> {
  try {
    console.log('[TripSharing] Creating trip share for ride:', rideId);

    // Generate share token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_share_token');

    if (tokenError || !tokenData) {
      console.error('[TripSharing] Error generating token:', tokenError);
      return { success: false, error: tokenError };
    }

    const shareToken = tokenData as string;

    // Calculate expiration time
    const expiresAt = expiresInHours
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
      : null;

    // Generate share URL
    const baseUrl = Linking.createURL('');
    const shareUrl = `${baseUrl}trip-share/${shareToken}`;

    // Create trip share record
    const { data, error } = await supabase
      .from('trip_shares')
      .insert({
        ride_id: rideId,
        booking_id: bookingId,
        passenger_id: passengerId,
        share_token: shareToken,
        share_url: shareUrl,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('[TripSharing] Error creating trip share:', error);
      return { success: false, error };
    }

    console.log('[TripSharing] Trip share created:', data.id);

    // TODO: Backend Integration - Send notification to recipient via WhatsApp/SMS
    // Call Edge Function to send trip share link to recipient

    return { success: true, share: data as TripShare, shareUrl };
  } catch (error) {
    console.error('[TripSharing] Error in createTripShare:', error);
    return { success: false, error };
  }
}

/**
 * Get trip share by token
 */
export async function getTripShareByToken(
  shareToken: string
): Promise<{ success: boolean; details?: TripShareDetails; error?: any }> {
  try {
    console.log('[TripSharing] Fetching trip share:', shareToken);

    // Update access tracking
    await supabase
      .from('trip_shares')
      .update({
        last_accessed_at: new Date().toISOString(),
        access_count: supabase.sql`access_count + 1`,
      })
      .eq('share_token', shareToken);

    // Get trip share
    const { data: share, error: shareError } = await supabase
      .from('trip_shares')
      .select('*')
      .eq('share_token', shareToken)
      .eq('is_active', true)
      .single();

    if (shareError || !share) {
      console.error('[TripSharing] Trip share not found:', shareError);
      return { success: false, error: shareError || new Error('Trip share not found') };
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      console.error('[TripSharing] Trip share expired');
      return { success: false, error: new Error('Trip share has expired') };
    }

    // Get ride details
    const { data: ride, error: rideError } = await supabase
      .from('carpool_rides')
      .select('*')
      .eq('id', share.ride_id)
      .single();

    if (rideError || !ride) {
      console.error('[TripSharing] Ride not found:', rideError);
      return { success: false, error: rideError };
    }

    // Get driver details (if allowed)
    let driver = null;
    if (share.show_driver_info && ride.driver_id) {
      const { data: driverData } = await supabase
        .from('user_profiles')
        .select('id, full_name, phone_number')
        .eq('id', ride.driver_id)
        .single();
      driver = driverData;
    }

    // Get passenger details (if allowed)
    let passenger = null;
    if (share.show_passenger_name) {
      const { data: passengerData } = await supabase
        .from('user_profiles')
        .select('id, full_name, phone_number')
        .eq('id', share.passenger_id)
        .single();
      passenger = passengerData;
    }

    // Get current location
    const { data: currentLocation } = await supabase
      .from('trip_share_locations')
      .select('*')
      .eq('trip_share_id', share.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get location history (last 50 points)
    const { data: locationHistory } = await supabase
      .from('trip_share_locations')
      .select('*')
      .eq('trip_share_id', share.id)
      .order('created_at', { ascending: false })
      .limit(50);

    return {
      success: true,
      details: {
        share: share as TripShare,
        ride,
        driver,
        passenger,
        currentLocation: currentLocation as TripShareLocation | null,
        locationHistory: (locationHistory || []) as TripShareLocation[],
      },
    };
  } catch (error) {
    console.error('[TripSharing] Error in getTripShareByToken:', error);
    return { success: false, error };
  }
}

/**
 * Update trip share location
 */
export async function updateTripShareLocation(
  tripShareId: string,
  rideId: string,
  location: Location.LocationObject,
  status: 'en_route' | 'arrived' | 'delayed' | 'emergency' = 'en_route'
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('trip_share_locations')
      .insert({
        trip_share_id: tripShareId,
        ride_id: rideId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        altitude: location.coords.altitude,
        status,
      });

    if (error) {
      console.error('[TripSharing] Error updating location:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('[TripSharing] Error in updateTripShareLocation:', error);
    return { success: false, error };
  }
}

/**
 * Trigger SOS alert
 */
export async function triggerSOSAlert(
  tripShareId: string,
  location: Location.LocationObject
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('[TripSharing] Triggering SOS alert for:', tripShareId);

    // Update trip share with SOS status
    const { error: updateError } = await supabase
      .from('trip_shares')
      .update({
        sos_triggered: true,
        sos_triggered_at: new Date().toISOString(),
        sos_location_lat: location.coords.latitude,
        sos_location_lng: location.coords.longitude,
      })
      .eq('id', tripShareId);

    if (updateError) {
      console.error('[TripSharing] Error updating SOS status:', updateError);
      return { success: false, error: updateError };
    }

    // Update location with emergency status
    await updateTripShareLocation(tripShareId, '', location, 'emergency');

    // Create SOS notification
    const { data: share } = await supabase
      .from('trip_shares')
      .select('*')
      .eq('id', tripShareId)
      .single();

    if (share) {
      await supabase
        .from('trip_share_notifications')
        .insert({
          trip_share_id: tripShareId,
          notification_type: 'sos_alert',
          title: '🚨 ALERTE SOS',
          message: `${share.recipient_name || 'Un proche'} a déclenché une alerte SOS pendant son trajet. Position: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`,
        });

      // TODO: Backend Integration - Send emergency alert via WhatsApp/SMS
      // Call Edge Function to send SOS alert to emergency contacts
    }

    console.log('[TripSharing] SOS alert triggered successfully');
    return { success: true };
  } catch (error) {
    console.error('[TripSharing] Error in triggerSOSAlert:', error);
    return { success: false, error };
  }
}

/**
 * Deactivate trip share
 */
export async function deactivateTripShare(
  tripShareId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('trip_shares')
      .update({ is_active: false })
      .eq('id', tripShareId);

    if (error) {
      console.error('[TripSharing] Error deactivating trip share:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('[TripSharing] Error in deactivateTripShare:', error);
    return { success: false, error };
  }
}

/**
 * Get active trip shares for a passenger
 */
export async function getActiveTripShares(
  passengerId: string
): Promise<{ success: boolean; shares?: TripShare[]; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('trip_shares')
      .select('*')
      .eq('passenger_id', passengerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TripSharing] Error fetching trip shares:', error);
      return { success: false, error };
    }

    return { success: true, shares: data as TripShare[] };
  } catch (error) {
    console.error('[TripSharing] Error in getActiveTripShares:', error);
    return { success: false, error };
  }
}

/**
 * Send trip share notification
 */
export async function sendTripShareNotification(
  tripShareId: string,
  type: 'trip_started' | 'trip_ended' | 'arrived_safely',
  title: string,
  message: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('trip_share_notifications')
      .insert({
        trip_share_id: tripShareId,
        notification_type: type,
        title,
        message,
      });

    if (error) {
      console.error('[TripSharing] Error creating notification:', error);
      return { success: false, error };
    }

    // TODO: Backend Integration - Send notification via WhatsApp/SMS
    // Call Edge Function to send notification to recipient

    return { success: true };
  } catch (error) {
    console.error('[TripSharing] Error in sendTripShareNotification:', error);
    return { success: false, error };
  }
}
