
// Edge Function: on-ride-reminders
// Scheduled cron job for ride reminders
// Tasks:
// - J-1 reminder (24h before)
// - H-1 reminder (1h before)
// - Send push to driver + passengers
// - Send WhatsApp for H-1 reminders

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📥 on-ride-reminders: Starting scheduled job');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    
    // Calculate time windows
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const in59Minutes = new Date(now.getTime() + 59 * 60 * 1000);

    let jMinus1Count = 0;
    let hMinus1Count = 0;

    // ================================================
    // J-1 REMINDERS (24h before)
    // ================================================
    
    const { data: ridesJMinus1 } = await supabase
      .from('carpool_rides')
      .select('*, user_profiles!carpool_rides_driver_id_fkey(full_name, phone_number)')
      .gte('departure_datetime', in23Hours.toISOString())
      .lte('departure_datetime', in24Hours.toISOString())
      .in('ride_status', ['pending', 'started'])
      .not('status', 'eq', 'cancelled');

    if (ridesJMinus1 && ridesJMinus1.length > 0) {
      console.log(`📅 Found ${ridesJMinus1.length} rides for J-1 reminders`);

      for (const ride of ridesJMinus1) {
        const driver = ride.user_profiles;
        
        // Notify driver
        await supabase.functions.invoke('send-notification-unified', {
          body: {
            type: 'reminder_j_minus_1',
            userId: ride.driver_id,
            title: '📅 Rappel : Trajet demain',
            message: `Tu conduis demain ${ride.departure_city || ride.origin} → ${ride.arrival_city || ride.destination} à ${ride.time_departure || new Date(ride.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            metadata: {
              rideId: ride.id,
              origin: ride.departure_city || ride.origin,
              destination: ride.arrival_city || ride.destination,
              dateDeparture: ride.date_departure || new Date(ride.departure_datetime).toISOString().split('T')[0],
              timeDeparture: ride.time_departure || new Date(ride.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            },
            channels: ['in_app', 'push'],
            phoneNumber: driver?.phone_number,
          },
        });

        // Get confirmed passengers
        const { data: bookings } = await supabase
          .from('carpool_bookings')
          .select('*, user_profiles!carpool_bookings_passenger_id_fkey(full_name, phone_number)')
          .eq('ride_id', ride.id)
          .eq('status', 'accepted');

        if (bookings && bookings.length > 0) {
          for (const booking of bookings) {
            const passenger = booking.user_profiles;
            
            await supabase.functions.invoke('send-notification-unified', {
              body: {
                type: 'reminder_j_minus_1',
                userId: booking.passenger_id,
                title: '📅 Rappel : Trajet demain',
                message: `Rappel : Trajet demain ${ride.departure_city || ride.origin} → ${ride.arrival_city || ride.destination} à ${ride.time_departure || new Date(ride.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                metadata: {
                  rideId: ride.id,
                  reservationId: booking.id,
                  origin: ride.departure_city || ride.origin,
                  destination: ride.arrival_city || ride.destination,
                  dateDeparture: ride.date_departure || new Date(ride.departure_datetime).toISOString().split('T')[0],
                  timeDeparture: ride.time_departure || new Date(ride.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                },
                channels: ['in_app', 'push'],
                phoneNumber: passenger?.phone_number,
              },
            });
          }
        }

        jMinus1Count++;
      }
    }

    // ================================================
    // H-1 REMINDERS (1h before)
    // ================================================
    
    const { data: ridesHMinus1 } = await supabase
      .from('carpool_rides')
      .select('*, user_profiles!carpool_rides_driver_id_fkey(full_name, phone_number)')
      .gte('departure_datetime', in59Minutes.toISOString())
      .lte('departure_datetime', in1Hour.toISOString())
      .in('ride_status', ['pending', 'started'])
      .not('status', 'eq', 'cancelled');

    if (ridesHMinus1 && ridesHMinus1.length > 0) {
      console.log(`⏰ Found ${ridesHMinus1.length} rides for H-1 reminders`);

      for (const ride of ridesHMinus1) {
        const driver = ride.user_profiles;
        
        // Notify driver (with WhatsApp)
        await supabase.functions.invoke('send-notification-unified', {
          body: {
            type: 'reminder_h_minus_1',
            userId: ride.driver_id,
            title: '⏰ Trajet dans 1 heure',
            message: 'Ton trajet démarre dans 1h',
            metadata: {
              rideId: ride.id,
              origin: ride.departure_city || ride.origin,
              destination: ride.arrival_city || ride.destination,
              dateDeparture: ride.date_departure || new Date(ride.departure_datetime).toISOString().split('T')[0],
              timeDeparture: ride.time_departure || new Date(ride.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            },
            channels: ['in_app', 'push', 'whatsapp'],
            phoneNumber: driver?.phone_number,
          },
        });

        // Get confirmed passengers
        const { data: bookings } = await supabase
          .from('carpool_bookings')
          .select('*, user_profiles!carpool_bookings_passenger_id_fkey(full_name, phone_number)')
          .eq('ride_id', ride.id)
          .eq('status', 'accepted');

        if (bookings && bookings.length > 0) {
          for (const booking of bookings) {
            const passenger = booking.user_profiles;
            
            await supabase.functions.invoke('send-notification-unified', {
              body: {
                type: 'reminder_h_minus_1',
                userId: booking.passenger_id,
                title: '⏰ Trajet dans 1 heure',
                message: 'Ton trajet démarre dans 1h. Sois à l\'heure 📍',
                metadata: {
                  rideId: ride.id,
                  reservationId: booking.id,
                  origin: ride.departure_city || ride.origin,
                  destination: ride.arrival_city || ride.destination,
                  dateDeparture: ride.date_departure || new Date(ride.departure_datetime).toISOString().split('T')[0],
                  timeDeparture: ride.time_departure || new Date(ride.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                },
                channels: ['in_app', 'push', 'whatsapp'],
                phoneNumber: passenger?.phone_number,
              },
            });
          }
        }

        hMinus1Count++;
      }
    }

    console.log(`✅ Reminders sent: J-1=${jMinus1Count}, H-1=${hMinus1Count}`);

    return new Response(
      JSON.stringify({
        success: true,
        jMinus1Reminders: jMinus1Count,
        hMinus1Reminders: hMinus1Count,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in on-ride-reminders:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
