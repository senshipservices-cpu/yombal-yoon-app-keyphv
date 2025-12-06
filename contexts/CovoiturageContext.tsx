
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/app/integrations/supabase/types';
import { calculateAmounts, blockCommission, getOrCreateWallet } from '@/utils/walletUtils';
import {
  notifyDriverNewReservation,
  notifyPassengerReservationAccepted,
  notifyPassengerReservationRefused,
  notifyPassengersRideCancelled,
  notifyPassengersRideStarted,
  notifyPassengerLastMinuteCancellation,
  notifyDriverPassengerCancelled,
  notifyRideEnded,
  requestDriverRating,
  requestPassengerRating,
} from '@/utils/notificationSetup';

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  departureCity: string;
  arrivalCity: string;
  date: string;
  time: string;
  availableSeats: number;
  totalSeats: number;
  pricePerPassenger: number;
  vehicleType?: string;
  intermediateStops?: string;
  status: 'active' | 'cancelled';
  rideStatus?: 'pending' | 'started' | 'ended' | 'cancelled';
  createdAt: string;
  departureLat?: number;
  departureLng?: number;
  arrivalLat?: number;
  arrivalLng?: number;
  distanceKm?: number;
  durationMinutes?: number;
  startedAt?: string;
  endedAt?: string;
  durationActualMinutes?: number;
}

export interface Reservation {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  numberOfPassengers: number;
  status: 'pending' | 'accepted' | 'refused';
  createdAt: string;
  ride?: Ride;
  driverRating?: number;
  driverRatingComment?: string;
  passengerRating?: number;
  passengerRatingComment?: string;
  ratedAt?: string;
}

interface CovoiturageContextType {
  rides: Ride[];
  reservations: Reservation[];
  addRide: (ride: Omit<Ride, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  getRidesByDriver: (driverId: string) => Ride[];
  searchRides: (departureCity: string, arrivalCity: string, date: string, passengers: number) => Ride[];
  addReservation: (
    reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>,
    onNotify?: (type: 'reservation_created', driverId: string, rideDetails: any) => void
  ) => Promise<{ success: boolean; message?: string }>;
  getReservationsByPassenger: (passengerId: string) => Reservation[];
  getReservationsByRide: (rideId: string) => Reservation[];
  updateReservationStatus: (
    reservationId: string,
    status: 'accepted' | 'refused',
    onNotify?: (type: 'reservation_accepted' | 'reservation_refused', passengerId: string, rideDetails: any) => void
  ) => Promise<{ success: boolean; message?: string }>;
  cancelReservation: (reservationId: string) => Promise<void>;
  cancelRide: (
    rideId: string,
    onNotify?: (type: 'ride_cancelled', passengerIds: string[], rideDetails: any) => void
  ) => Promise<{ success: boolean; message?: string }>;
  markDriverArrived: (rideId: string) => Promise<{ success: boolean; message?: string }>;
  startRide: (rideId: string) => Promise<{ success: boolean; message?: string }>;
  endRide: (rideId: string) => Promise<{ success: boolean; message?: string }>;
  submitRating: (
    reservationId: string,
    rating: number,
    comment: string,
    isDriverRating: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CovoiturageContext = createContext<CovoiturageContextType | undefined>(undefined);

const RIDES_STORAGE_KEY = '@yombal_yoon_rides';
const RESERVATIONS_STORAGE_KEY = '@yombal_yoon_reservations';

export function CovoiturageProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      console.log('Loading covoiturage data from Supabase...');
      setError(null);
      
      // Fetch rides from Supabase
      const { data: supabaseRides, error: ridesError } = await supabase
        .from('carpool_rides')
        .select('*')
        .order('created_at', { ascending: false });

      if (ridesError) {
        console.error('Error fetching rides from Supabase:', ridesError);
        setError('Erreur lors du chargement des trajets');
      } else if (supabaseRides) {
        // Convert Supabase data to local format
        const convertedRides: Ride[] = supabaseRides.map(ride => {
          try {
            const departureDate = new Date(ride.departure_datetime);
            return {
              id: ride.id,
              driverId: 'driver_' + ride.id.substring(0, 8),
              driverName: ride.driver_name || 'N/A',
              departureCity: ride.departure_city || 'N/A',
              arrivalCity: ride.arrival_city || 'N/A',
              date: departureDate.toISOString().split('T')[0],
              time: departureDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              availableSeats: ride.seats_available || 0,
              totalSeats: ride.seats_total || 0,
              pricePerPassenger: ride.price_per_seat || 0,
              vehicleType: ride.vehicle_type || undefined,
              intermediateStops: ride.stops || undefined,
              status: ride.status === 'cancelled' ? 'cancelled' : 'active',
              rideStatus: (ride as any).ride_status || 'pending',
              createdAt: ride.created_at || new Date().toISOString(),
              departureLat: ride.departure_lat || undefined,
              departureLng: ride.departure_lng || undefined,
              arrivalLat: ride.arrival_lat || undefined,
              arrivalLng: ride.arrival_lng || undefined,
              distanceKm: ride.distance_km || undefined,
              durationMinutes: ride.duration_minutes || undefined,
              startedAt: (ride as any).started_at || undefined,
              endedAt: (ride as any).ended_at || undefined,
              durationActualMinutes: (ride as any).duration_actual_minutes || undefined,
            };
          } catch (conversionError) {
            console.error('Error converting ride:', ride.id, conversionError);
            return null;
          }
        }).filter((ride): ride is Ride => ride !== null);

        console.log('Converted rides:', convertedRides.length);
        setRides(convertedRides);
        await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(convertedRides));
        console.log('Rides loaded from Supabase:', convertedRides.length);
      }

      // Fetch bookings from Supabase
      const { data: supabaseBookings, error: bookingsError } = await supabase
        .from('carpool_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings from Supabase:', bookingsError);
        setError('Erreur lors du chargement des réservations');
      } else if (supabaseBookings) {
        // Convert Supabase data to local format
        const convertedReservations: Reservation[] = supabaseBookings.map(booking => {
          try {
            return {
              id: booking.id,
              rideId: booking.ride_id,
              passengerId: 'passenger_' + booking.id.substring(0, 8),
              passengerName: booking.passenger_name || 'N/A',
              numberOfPassengers: booking.number_of_passengers || 1,
              status: (booking.status as 'pending' | 'accepted' | 'refused') || 'pending',
              createdAt: booking.created_at || new Date().toISOString(),
              driverRating: (booking as any).driver_rating || undefined,
              driverRatingComment: (booking as any).driver_rating_comment || undefined,
              passengerRating: (booking as any).passenger_rating || undefined,
              passengerRatingComment: (booking as any).passenger_rating_comment || undefined,
              ratedAt: (booking as any).rated_at || undefined,
            };
          } catch (conversionError) {
            console.error('Error converting booking:', booking.id, conversionError);
            return null;
          }
        }).filter((reservation): reservation is Reservation => reservation !== null);

        setReservations(convertedReservations);
        await AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(convertedReservations));
        console.log('Bookings loaded from Supabase:', convertedReservations.length);
      }
    } catch (error) {
      console.error('Error loading covoiturage data:', error);
      setError('Erreur de connexion');
      
      // Fallback to AsyncStorage if Supabase fails
      try {
        const [storedRides, storedReservations] = await Promise.all([
          AsyncStorage.getItem(RIDES_STORAGE_KEY),
          AsyncStorage.getItem(RESERVATIONS_STORAGE_KEY),
        ]);

        if (storedRides) {
          const parsedRides = JSON.parse(storedRides);
          setRides(Array.isArray(parsedRides) ? parsedRides : []);
          console.log('Rides loaded from AsyncStorage fallback');
        }

        if (storedReservations) {
          const parsedReservations = JSON.parse(storedReservations);
          setReservations(Array.isArray(parsedReservations) ? parsedReservations : []);
          console.log('Reservations loaded from AsyncStorage fallback');
        }
      } catch (storageError) {
        console.error('Error loading from AsyncStorage:', storageError);
        setRides([]);
        setReservations([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    console.log('Refreshing covoiturage data...');
    setIsLoading(true);
    await loadData();
  }, [loadData]);

  const getUserId = useCallback(async (): Promise<string> => {
    const USER_ID_KEY = '@yombal_yoon_user_id';
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  }, []);

  const addRide = useCallback(async (rideData: Omit<Ride, 'id' | 'createdAt' | 'status'>) => {
    try {
      const totalSeats = rideData.totalSeats;
      const pricePerSeat = rideData.pricePerPassenger;
      const prixTotal = totalSeats * pricePerSeat;
      
      const { commissionYombal, prixPrestataire } = calculateAmounts(prixTotal);

      console.log('Calculated amounts:', {
        prixTotal,
        commissionYombal,
        prixPrestataire,
      });

      const departureDatetime = new Date(`${rideData.date}T${rideData.time}`).toISOString();

      const supabaseData: TablesInsert<'carpool_rides'> = {
        driver_name: rideData.driverName,
        driver_phone: '221' + (rideData.driverId || '000000000'),
        departure_city: rideData.departureCity,
        arrival_city: rideData.arrivalCity,
        departure_datetime: departureDatetime,
        seats_total: rideData.totalSeats,
        seats_available: rideData.availableSeats,
        price_per_seat: rideData.pricePerPassenger,
        vehicle_type: rideData.vehicleType || null,
        stops: rideData.intermediateStops || null,
        status: 'open',
        departure_lat: rideData.departureLat || null,
        departure_lng: rideData.departureLng || null,
        arrival_lat: rideData.arrivalLat || null,
        arrival_lng: rideData.arrivalLng || null,
        distance_km: rideData.distanceKm || null,
        duration_minutes: rideData.durationMinutes || null,
        prix_total: prixTotal,
        commission_yombal: commissionYombal,
        prix_prestataire: prixPrestataire,
        statut_paiement: 'en_attente',
      };

      const { data, error } = await supabase
        .from('carpool_rides')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Erreur lors de la publication du trajet.');
      }

      console.log('Ride created in Supabase:', data);

      try {
        const userId = await getUserId();
        await blockCommission(userId, commissionYombal);
        console.log('Commission blocked in wallet');
      } catch (walletError) {
        console.error('Error blocking commission (non-critical):', walletError);
      }

      const newRide: Ride = {
        id: data.id,
        driverId: rideData.driverId,
        driverName: data.driver_name,
        departureCity: data.departure_city,
        arrivalCity: data.arrival_city,
        date: rideData.date,
        time: rideData.time,
        availableSeats: data.seats_available,
        totalSeats: data.seats_total,
        pricePerPassenger: data.price_per_seat,
        vehicleType: data.vehicle_type || undefined,
        intermediateStops: data.stops || undefined,
        status: 'active',
        rideStatus: 'pending',
        createdAt: data.created_at || new Date().toISOString(),
        departureLat: data.departure_lat || undefined,
        departureLng: data.departure_lng || undefined,
        arrivalLat: data.arrival_lat || undefined,
        arrivalLng: data.arrival_lng || undefined,
        distanceKm: data.distance_km || undefined,
        durationMinutes: data.duration_minutes || undefined,
      };

      const updatedRides = [newRide, ...rides];
      setRides(updatedRides);
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
      console.log('Ride added to Supabase:', newRide);

      // Call Edge Function to match ride with alerts and send notifications
      try {
        console.log('🔔 Calling match-ride-alerts Edge Function...');
        const { data: matchResult, error: matchError } = await supabase.functions.invoke('match-ride-alerts', {
          body: {
            id: data.id,
            driver_name: data.driver_name,
            driver_phone: data.driver_phone,
            departure_city: data.departure_city,
            arrival_city: data.arrival_city,
            departure_datetime: data.departure_datetime,
            seats_available: data.seats_available,
            price_per_seat: data.price_per_seat,
            vehicle_type: data.vehicle_type,
          },
        });

        if (matchError) {
          console.error('❌ Error calling match-ride-alerts:', matchError);
        } else {
          console.log('✅ Match-ride-alerts result:', matchResult);
        }
      } catch (matchErr) {
        console.error('❌ Exception calling match-ride-alerts:', matchErr);
        // Non-critical error - don't throw
      }
    } catch (error) {
      console.error('Error adding ride:', error);
      throw error;
    }
  }, [rides, getUserId]);

  const getRidesByDriver = useCallback((driverId: string): Ride[] => {
    try {
      if (!Array.isArray(rides)) {
        console.warn('Rides is not an array:', rides);
        return [];
      }
      return rides.filter(ride => ride && ride.driverId === driverId);
    } catch (error) {
      console.error('Error in getRidesByDriver:', error);
      return [];
    }
  }, [rides]);

  const searchRides = useCallback((departureCity: string, arrivalCity: string, date: string, passengers: number): Ride[] => {
    try {
      if (!Array.isArray(rides)) {
        console.warn('Rides is not an array:', rides);
        return [];
      }
      return rides.filter(ride => {
        if (!ride) return false;
        const matchesDeparture = ride.departureCity?.toLowerCase().includes(departureCity.toLowerCase());
        const matchesArrival = ride.arrivalCity?.toLowerCase().includes(arrivalCity.toLowerCase());
        const matchesDate = !date || ride.date === date;
        const hasEnoughSeats = ride.availableSeats >= passengers;
        const isActive = ride.status === 'active';

        return matchesDeparture && matchesArrival && matchesDate && hasEnoughSeats && isActive;
      });
    } catch (error) {
      console.error('Error in searchRides:', error);
      return [];
    }
  }, [rides]);

  const addReservation = useCallback(async (
    reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>,
    onNotify?: (type: 'reservation_created', driverId: string, rideDetails: any) => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const ride = rides.find(r => r && r.id === reservationData.rideId);
      
      if (!ride) {
        return { success: false, message: 'Trajet introuvable' };
      }

      if (ride.status === 'cancelled') {
        return { success: false, message: 'Ce trajet a été annulé' };
      }

      if (ride.availableSeats < reservationData.numberOfPassengers) {
        return { 
          success: false, 
          message: `Seulement ${ride.availableSeats} place(s) disponible(s)` 
        };
      }

      const newReservation: Reservation = {
        ...reservationData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updatedRides = rides.map(r => {
        if (r && r.id === reservationData.rideId) {
          return {
            ...r,
            availableSeats: r.availableSeats - reservationData.numberOfPassengers,
          };
        }
        return r;
      });

      const updatedReservations = [...reservations, newReservation];
      setRides(updatedRides);
      setReservations(updatedReservations);

      await Promise.all([
        AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides)),
        AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations)),
      ]);

      console.log('Reservation added:', newReservation);

      // Send push notification to driver
      try {
        await notifyDriverNewReservation(
          ride.driverName,
          reservationData.passengerName,
          reservationData.numberOfPassengers,
          {
            from: ride.departureCity,
            to: ride.arrivalCity,
            date: new Date(ride.date).toLocaleDateString('fr-FR'),
            time: ride.time,
          },
          newReservation.id,
          ride.id
        );
      } catch (notifyError) {
        console.error('Error sending notification (non-critical):', notifyError);
      }

      // Also call the legacy callback if provided
      if (onNotify) {
        try {
          onNotify('reservation_created', ride.driverId, {
            reservationId: newReservation.id,
            passengerName: reservationData.passengerName,
            numberOfPassengers: reservationData.numberOfPassengers,
            ride: {
              departureCity: ride.departureCity,
              arrivalCity: ride.arrivalCity,
              date: ride.date,
              time: ride.time,
            },
          });
        } catch (callbackError) {
          console.error('Error in notification callback (non-critical):', callbackError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding reservation:', error);
      return { success: false, message: 'Erreur lors de la réservation' };
    }
  }, [rides, reservations]);

  const getReservationsByPassenger = useCallback((passengerId: string): Reservation[] => {
    try {
      if (!Array.isArray(reservations)) {
        console.warn('Reservations is not an array:', reservations);
        return [];
      }
      return reservations
        .filter(reservation => reservation && reservation.passengerId === passengerId)
        .map(reservation => ({
          ...reservation,
          ride: rides.find(ride => ride && ride.id === reservation.rideId),
        }));
    } catch (error) {
      console.error('Error in getReservationsByPassenger:', error);
      return [];
    }
  }, [reservations, rides]);

  const getReservationsByRide = useCallback((rideId: string): Reservation[] => {
    try {
      if (!Array.isArray(reservations)) {
        console.warn('Reservations is not an array:', reservations);
        return [];
      }
      return reservations.filter(reservation => reservation && reservation.rideId === rideId);
    } catch (error) {
      console.error('Error in getReservationsByRide:', error);
      return [];
    }
  }, [reservations]);

  const updateReservationStatus = useCallback(async (
    reservationId: string,
    status: 'accepted' | 'refused',
    onNotify?: (type: 'reservation_accepted' | 'reservation_refused', passengerId: string, rideDetails: any) => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const reservation = reservations.find(r => r && r.id === reservationId);
      
      if (!reservation) {
        return { success: false, message: 'Réservation introuvable' };
      }

      const ride = rides.find(r => r && r.id === reservation.rideId);
      
      if (!ride) {
        return { success: false, message: 'Trajet introuvable' };
      }

      const { error: updateError } = await supabase
        .from('carpool_bookings')
        .update({ status })
        .eq('id', reservationId);

      if (updateError) {
        console.error('Error updating booking status:', updateError);
        return { success: false, message: 'Erreur lors de la mise à jour' };
      }

      if (status === 'accepted') {
        const acceptedReservations = reservations.filter(
          r => r && r.rideId === ride.id && r.status === 'accepted'
        );
        const totalAcceptedSeats = acceptedReservations.reduce(
          (sum, r) => sum + r.numberOfPassengers,
          0
        );

        if (totalAcceptedSeats + reservation.numberOfPassengers > ride.totalSeats) {
          return { 
            success: false, 
            message: 'Pas assez de places disponibles pour accepter cette réservation' 
          };
        }
      }

      const updatedReservations = reservations.map(r => {
        if (r && r.id === reservationId) {
          return { ...r, status };
        }
        return r;
      });

      let updatedRides = rides;
      if (status === 'refused') {
        updatedRides = rides.map(r => {
          if (r && r.id === reservation.rideId) {
            return {
              ...r,
              availableSeats: r.availableSeats + reservation.numberOfPassengers,
            };
          }
          return r;
        });

        const newSeatsAvailable = ride.availableSeats + reservation.numberOfPassengers;
        await supabase
          .from('carpool_rides')
          .update({ seats_available: newSeatsAvailable })
          .eq('id', ride.id);

        setRides(updatedRides);
        await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
      }

      setReservations(updatedReservations);
      await AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      
      console.log('Reservation status updated:', reservationId, status);

      // Send push notification to passenger
      try {
        if (status === 'accepted') {
          await notifyPassengerReservationAccepted(
            reservation.passengerName,
            ride.driverName,
            {
              from: ride.departureCity,
              to: ride.arrivalCity,
              date: new Date(ride.date).toLocaleDateString('fr-FR'),
              time: ride.time,
            },
            reservation.id,
            ride.id
          );
        } else {
          await notifyPassengerReservationRefused(
            reservation.passengerName,
            ride.driverName,
            {
              from: ride.departureCity,
              to: ride.arrivalCity,
              date: new Date(ride.date).toLocaleDateString('fr-FR'),
              time: ride.time,
            },
            reservation.id,
            ride.id
          );
        }
      } catch (notifyError) {
        console.error('Error sending notification (non-critical):', notifyError);
      }

      // Also call the legacy callback if provided
      if (onNotify) {
        try {
          const notificationType = status === 'accepted' ? 'reservation_accepted' : 'reservation_refused';
          onNotify(notificationType, reservation.passengerId, {
            reservationId: reservation.id,
            ride: {
              departureCity: ride.departureCity,
              arrivalCity: ride.arrivalCity,
              date: ride.date,
              time: ride.time,
            },
          });
        } catch (callbackError) {
          console.error('Error in notification callback (non-critical):', callbackError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating reservation status:', error);
      return { success: false, message: 'Erreur lors de la mise à jour' };
    }
  }, [reservations, rides]);

  const cancelReservation = useCallback(async (reservationId: string) => {
    try {
      const reservation = reservations.find(r => r && r.id === reservationId);
      if (!reservation) return;

      const { error: updateError } = await supabase
        .from('carpool_bookings')
        .update({ status: 'cancelled_by_passenger' })
        .eq('id', reservationId);

      if (updateError) {
        console.error('Error cancelling booking:', updateError);
        throw updateError;
      }

      if (reservation.status === 'pending' || reservation.status === 'accepted') {
        const ride = rides.find(r => r && r.id === reservation.rideId);
        if (ride) {
          const newSeatsAvailable = ride.availableSeats + reservation.numberOfPassengers;
          
          await supabase
            .from('carpool_rides')
            .update({ seats_available: newSeatsAvailable })
            .eq('id', ride.id);

          const updatedRides = rides.map(r => {
            if (r && r.id === reservation.rideId) {
              return {
                ...r,
                availableSeats: newSeatsAvailable,
              };
            }
            return r;
          });

          setRides(updatedRides);
          await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));

          // Call Edge Function to notify driver
          try {
            const { error: efError } = await supabase.functions.invoke('on-ride-status-changed', {
              body: {
                rideId: ride.id,
                status: 'cancelled',
                driverId: ride.driverId,
                driverName: ride.driverName,
                origin: ride.departureCity,
                destination: ride.arrivalCity,
                dateDeparture: ride.date,
                timeDeparture: ride.time,
                cancelledBy: 'passenger',
                cancelledPassengerId: reservation.passengerId,
                cancelledPassengerName: reservation.passengerName,
              },
            });

            if (efError) {
              console.error('Error calling on-ride-status-changed:', efError);
            }
          } catch (efErr) {
            console.error('Exception calling on-ride-status-changed:', efErr);
          }
        }
      }

      const updatedReservations = reservations.filter(r => r && r.id !== reservationId);

      setReservations(updatedReservations);
      await AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));

      console.log('Reservation cancelled:', reservationId);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  }, [reservations, rides]);

  const cancelRide = useCallback(async (
    rideId: string,
    onNotify?: (type: 'ride_cancelled', passengerIds: string[], rideDetails: any) => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('=== CANCEL RIDE START ===');
      console.log('Ride ID to cancel:', rideId);
      
      const ride = rides.find(r => r && r.id === rideId);
      
      if (!ride) {
        console.log('ERROR: Ride not found in local state:', rideId);
        return { success: false, message: 'Trajet introuvable' };
      }

      console.log('Found ride to cancel:', {
        id: ride.id,
        departureCity: ride.departureCity,
        arrivalCity: ride.arrivalCity,
        currentStatus: ride.status,
      });

      // Check if it's a last-minute cancellation (less than X hours before departure)
      const departureTime = new Date(`${ride.date}T${ride.time}`);
      const now = new Date();
      const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isLastMinute = hoursUntilDeparture < 24; // Less than 24 hours

      console.log('Updating ride status in Supabase...');
      const { data: updatedRide, error: updateError } = await supabase
        .from('carpool_rides')
        .update({ 
          status: 'cancelled',
          ride_status: 'cancelled',
          seats_available: 0 
        })
        .eq('id', rideId)
        .select()
        .single();

      if (updateError) {
        console.error('ERROR: Supabase update failed:', updateError);
        return { success: false, message: 'Erreur lors de l\'annulation du trajet dans la base de données' };
      }

      console.log('Supabase update successful:', updatedRide);

      const rideReservations = reservations.filter(r => r && r.rideId === rideId);
      const passengerIds = rideReservations.map(r => r.passengerId);

      console.log('Found reservations to update:', rideReservations.length);

      if (rideReservations.length > 0) {
        const bookingIds = rideReservations.map(r => r.id);
        console.log('Updating bookings in Supabase:', bookingIds);
        
        const { error: bookingsError } = await supabase
          .from('carpool_bookings')
          .update({ status: 'refused' })
          .in('id', bookingIds);

        if (bookingsError) {
          console.error('ERROR: Failed to update bookings:', bookingsError);
        } else {
          console.log('Bookings updated successfully in Supabase');
        }

        // Send notifications to all passengers
        for (const reservation of rideReservations) {
          try {
            if (isLastMinute) {
              // Last-minute cancellation: send push + WhatsApp
              await notifyPassengerLastMinuteCancellation(
                reservation.passengerName,
                ride.driverName,
                {
                  from: ride.departureCity,
                  to: ride.arrivalCity,
                  date: new Date(ride.date).toLocaleDateString('fr-FR'),
                  time: ride.time,
                },
                ride.id
              );
            } else {
              // Regular cancellation: send push only
              await notifyPassengersRideCancelled(
                reservation.passengerName,
                ride.driverName,
                {
                  from: ride.departureCity,
                  to: ride.arrivalCity,
                  date: new Date(ride.date).toLocaleDateString('fr-FR'),
                  time: ride.time,
                },
                ride.id
              );
            }
          } catch (notifyError) {
            console.error('Error sending notification (non-critical):', notifyError);
          }
        }
      }

      // Call Edge Function to notify passengers
      try {
        const { error: efError } = await supabase.functions.invoke('on-ride-status-changed', {
          body: {
            rideId: rideId,
            status: 'cancelled',
            driverId: ride.driverId,
            driverName: ride.driverName,
            origin: ride.departureCity,
            destination: ride.arrivalCity,
            dateDeparture: ride.date,
            timeDeparture: ride.time,
            cancelledBy: 'driver',
          },
        });

        if (efError) {
          console.error('Error calling on-ride-status-changed:', efError);
        }
      } catch (efErr) {
        console.error('Exception calling on-ride-status-changed:', efErr);
      }

      console.log('Updating local state...');
      const updatedRides = rides.map(r => {
        if (r && r.id === rideId) {
          return { ...r, status: 'cancelled' as const, rideStatus: 'cancelled' as const, availableSeats: 0 };
        }
        return r;
      });

      const updatedReservations = reservations.map(r => {
        if (r && r.rideId === rideId && r.status !== 'refused') {
          return { ...r, status: 'refused' as const };
        }
        return r;
      });

      console.log('Setting state with updated data...');
      setRides(updatedRides);
      setReservations(updatedReservations);

      console.log('Saving to AsyncStorage...');
      await Promise.all([
        AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides)),
        AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations)),
      ]);

      console.log('AsyncStorage updated successfully');

      // Also call the legacy callback if provided
      if (onNotify && passengerIds.length > 0) {
        try {
          console.log('Calling legacy notification callback...');
          onNotify('ride_cancelled', passengerIds, {
            ride: {
              departureCity: ride.departureCity,
              arrivalCity: ride.arrivalCity,
              date: ride.date,
              time: ride.time,
            },
          });
        } catch (callbackError) {
          console.error('Error in notification callback (non-critical):', callbackError);
        }
      }

      console.log('=== CANCEL RIDE SUCCESS ===');
      return { success: true };
    } catch (error) {
      console.error('=== CANCEL RIDE ERROR ===');
      console.error('Error details:', error);
      return { success: false, message: 'Erreur lors de l\'annulation du trajet' };
    }
  }, [rides, reservations]);

  const markDriverArrived = useCallback(async (rideId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('=== MARK DRIVER ARRIVED ===');
      console.log('Ride ID:', rideId);

      const ride = rides.find(r => r && r.id === rideId);
      
      if (!ride) {
        return { success: false, message: 'Trajet introuvable' };
      }

      // Get ride details from Supabase
      const { data: rideData, error: rideError } = await supabase
        .from('carpool_rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (rideError || !rideData) {
        console.error('Error fetching ride:', rideError);
        return { success: false, message: 'Erreur lors de la récupération du trajet' };
      }

      // Call Edge Function to notify passengers
      const { data: result, error: efError } = await supabase.functions.invoke('on-driver-arrived', {
        body: {
          rideId: rideId,
          driverId: ride.driverId,
          driverName: ride.driverName,
          meetingPoint: rideData.meeting_point || `${ride.departureCity}`,
        },
      });

      if (efError) {
        console.error('Error calling on-driver-arrived:', efError);
        return { success: false, message: 'Erreur lors de la notification des passagers' };
      }

      console.log('✅ Driver arrival notifications sent:', result);
      return { success: true };
    } catch (error) {
      console.error('Error marking driver arrived:', error);
      return { success: false, message: 'Erreur lors de la notification' };
    }
  }, [rides]);

  const startRide = useCallback(async (rideId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('=== START RIDE ===');
      console.log('Ride ID:', rideId);

      const ride = rides.find(r => r && r.id === rideId);
      
      if (!ride) {
        return { success: false, message: 'Trajet introuvable' };
      }

      const startedAt = new Date().toISOString();

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('carpool_rides')
        .update({ 
          ride_status: 'started',
          started_at: startedAt
        })
        .eq('id', rideId);

      if (updateError) {
        console.error('Error starting ride:', updateError);
        return { success: false, message: 'Erreur lors du démarrage du trajet' };
      }

      // Update local state
      const updatedRides = rides.map(r => {
        if (r && r.id === rideId) {
          return { ...r, rideStatus: 'started' as const, startedAt };
        }
        return r;
      });

      setRides(updatedRides);
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));

      // Call Edge Function to notify passengers
      try {
        const { error: efError } = await supabase.functions.invoke('on-ride-status-changed', {
          body: {
            rideId: rideId,
            status: 'started',
            driverId: ride.driverId,
            driverName: ride.driverName,
            origin: ride.departureCity,
            destination: ride.arrivalCity,
            dateDeparture: ride.date,
            timeDeparture: ride.time,
          },
        });

        if (efError) {
          console.error('Error calling on-ride-status-changed:', efError);
        }
      } catch (efErr) {
        console.error('Exception calling on-ride-status-changed:', efErr);
      }

      console.log('✅ Ride started successfully');
      return { success: true };
    } catch (error) {
      console.error('Error starting ride:', error);
      return { success: false, message: 'Erreur lors du démarrage du trajet' };
    }
  }, [rides, reservations]);

  const endRide = useCallback(async (rideId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('=== END RIDE ===');
      console.log('Ride ID:', rideId);

      const ride = rides.find(r => r && r.id === rideId);
      
      if (!ride) {
        return { success: false, message: 'Trajet introuvable' };
      }

      const endedAt = new Date().toISOString();
      let durationActualMinutes = 0;

      if (ride.startedAt) {
        const startTime = new Date(ride.startedAt);
        const endTime = new Date(endedAt);
        durationActualMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('carpool_rides')
        .update({ 
          ride_status: 'ended',
          ended_at: endedAt,
          duration_actual_minutes: durationActualMinutes,
          rating_requested_at: endedAt
        })
        .eq('id', rideId);

      if (updateError) {
        console.error('Error ending ride:', updateError);
        return { success: false, message: 'Erreur lors de la fin du trajet' };
      }

      // Update local state
      const updatedRides = rides.map(r => {
        if (r && r.id === rideId) {
          return { 
            ...r, 
            rideStatus: 'ended' as const, 
            endedAt,
            durationActualMinutes
          };
        }
        return r;
      });

      setRides(updatedRides);
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));

      // Call Edge Function to handle ride completion
      try {
        const { error: efError } = await supabase.functions.invoke('on-ride-status-changed', {
          body: {
            rideId: rideId,
            status: 'ended',
            driverId: ride.driverId,
            driverName: ride.driverName,
            origin: ride.departureCity,
            destination: ride.arrivalCity,
            dateDeparture: ride.date,
            timeDeparture: ride.time,
          },
        });

        if (efError) {
          console.error('Error calling on-ride-status-changed:', efError);
        }
      } catch (efErr) {
        console.error('Exception calling on-ride-status-changed:', efErr);
      }

      console.log('✅ Ride ended successfully');
      return { success: true };
    } catch (error) {
      console.error('Error ending ride:', error);
      return { success: false, message: 'Erreur lors de la fin du trajet' };
    }
  }, [rides, reservations]);

  const submitRating = useCallback(async (
    reservationId: string,
    rating: number,
    comment: string,
    isDriverRating: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('=== SUBMIT RATING ===');
      console.log('Reservation ID:', reservationId);
      console.log('Rating:', rating);
      console.log('Is Driver Rating:', isDriverRating);

      const updateData = isDriverRating
        ? {
            driver_rating: rating,
            driver_rating_comment: comment,
            rated_at: new Date().toISOString()
          }
        : {
            passenger_rating: rating,
            passenger_rating_comment: comment,
            rated_at: new Date().toISOString()
          };

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('carpool_bookings')
        .update(updateData)
        .eq('id', reservationId);

      if (updateError) {
        console.error('Error submitting rating:', updateError);
        return { success: false, message: 'Erreur lors de l\'envoi de la notation' };
      }

      // Update local state
      const updatedReservations = reservations.map(r => {
        if (r && r.id === reservationId) {
          return { 
            ...r, 
            ...(isDriverRating 
              ? { driverRating: rating, driverRatingComment: comment }
              : { passengerRating: rating, passengerRatingComment: comment }
            ),
            ratedAt: new Date().toISOString()
          };
        }
        return r;
      });

      setReservations(updatedReservations);
      await AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));

      console.log('✅ Rating submitted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error submitting rating:', error);
      return { success: false, message: 'Erreur lors de l\'envoi de la notation' };
    }
  }, [reservations]);

  return (
    <CovoiturageContext.Provider
      value={{
        rides,
        reservations,
        addRide,
        getRidesByDriver,
        searchRides,
        addReservation,
        getReservationsByPassenger,
        getReservationsByRide,
        updateReservationStatus,
        cancelReservation,
        cancelRide,
        markDriverArrived,
        startRide,
        endRide,
        submitRating,
        refreshData,
        isLoading,
        error,
      }}
    >
      {children}
    </CovoiturageContext.Provider>
  );
}

export function useCovoiturage() {
  const context = useContext(CovoiturageContext);
  if (context === undefined) {
    throw new Error('useCovoiturage must be used within a CovoiturageProvider');
  }
  return context;
}
