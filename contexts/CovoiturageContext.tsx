
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/app/integrations/supabase/types';
import { calculateAmounts, blockCommission, getOrCreateWallet } from '@/utils/walletUtils';

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
  createdAt: string;
  departureLat?: number;
  departureLng?: number;
  arrivalLat?: number;
  arrivalLng?: number;
  distanceKm?: number;
  durationMinutes?: number;
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
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const CovoiturageContext = createContext<CovoiturageContextType | undefined>(undefined);

const RIDES_STORAGE_KEY = '@yombal_yoon_rides';
const RESERVATIONS_STORAGE_KEY = '@yombal_yoon_reservations';

export function CovoiturageProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      console.log('Loading data from Supabase...');
      
      // Fetch rides from Supabase
      const { data: supabaseRides, error: ridesError } = await supabase
        .from('carpool_rides')
        .select('*')
        .order('created_at', { ascending: false });

      if (ridesError) {
        console.error('Error fetching rides from Supabase:', ridesError);
      } else if (supabaseRides) {
        // Convert Supabase data to local format
        const convertedRides: Ride[] = supabaseRides.map(ride => {
          const departureDate = new Date(ride.departure_datetime);
          return {
            id: ride.id,
            driverId: 'driver_' + ride.id.substring(0, 8),
            driverName: ride.driver_name,
            departureCity: ride.departure_city,
            arrivalCity: ride.arrival_city,
            date: departureDate.toISOString().split('T')[0],
            time: departureDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            availableSeats: ride.seats_available,
            totalSeats: ride.seats_total,
            pricePerPassenger: ride.price_per_seat,
            vehicleType: ride.vehicle_type || undefined,
            intermediateStops: ride.stops || undefined,
            status: ride.status === 'cancelled' ? 'cancelled' : 'active',
            createdAt: ride.created_at || new Date().toISOString(),
            departureLat: ride.departure_lat || undefined,
            departureLng: ride.departure_lng || undefined,
            arrivalLat: ride.arrival_lat || undefined,
            arrivalLng: ride.arrival_lng || undefined,
            distanceKm: ride.distance_km || undefined,
            durationMinutes: ride.duration_minutes || undefined,
          };
        });

        console.log('Converted rides:', convertedRides.map(r => ({ id: r.id, status: r.status })));
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
      } else if (supabaseBookings) {
        // Convert Supabase data to local format
        const convertedReservations: Reservation[] = supabaseBookings.map(booking => ({
          id: booking.id,
          rideId: booking.ride_id,
          passengerId: 'passenger_' + booking.id.substring(0, 8),
          passengerName: booking.passenger_name,
          numberOfPassengers: booking.number_of_passengers,
          status: (booking.status as 'pending' | 'accepted' | 'refused') || 'pending',
          createdAt: booking.created_at || new Date().toISOString(),
        }));

        setReservations(convertedReservations);
        await AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(convertedReservations));
        console.log('Bookings loaded from Supabase:', convertedReservations.length);
      }
    } catch (error) {
      console.error('Error loading covoiturage data:', error);
      
      // Fallback to AsyncStorage if Supabase fails
      try {
        const [storedRides, storedReservations] = await Promise.all([
          AsyncStorage.getItem(RIDES_STORAGE_KEY),
          AsyncStorage.getItem(RESERVATIONS_STORAGE_KEY),
        ]);

        if (storedRides) {
          setRides(JSON.parse(storedRides));
          console.log('Rides loaded from AsyncStorage fallback');
        }

        if (storedReservations) {
          setReservations(JSON.parse(storedReservations));
          console.log('Reservations loaded from AsyncStorage fallback');
        }
      } catch (storageError) {
        console.error('Error loading from AsyncStorage:', storageError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    console.log('Refreshing data...');
    await loadData();
  }, [loadData]);

  const getUserId = async (): Promise<string> => {
    const USER_ID_KEY = '@yombal_yoon_user_id';
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  };

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt' | 'status'>) => {
    try {
      // Calculate total price and commission
      const totalSeats = rideData.totalSeats;
      const pricePerSeat = rideData.pricePerPassenger;
      const prixTotal = totalSeats * pricePerSeat;
      
      const { commissionYombal, prixPrestataire } = calculateAmounts(prixTotal);

      console.log('Calculated amounts:', {
        prixTotal,
        commissionYombal,
        prixPrestataire,
      });

      // Combine date and time into departure_datetime
      const departureDatetime = new Date(`${rideData.date}T${rideData.time}`).toISOString();

      // Prepare data for Supabase
      const supabaseData: TablesInsert<'carpool_rides'> = {
        driver_name: rideData.driverName,
        driver_phone: '221' + (rideData.driverId || '000000000'), // Placeholder phone
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
        // Add commission fields
        prix_total: prixTotal,
        commission_yombal: commissionYombal,
        prix_prestataire: prixPrestataire,
        statut_paiement: 'en_attente',
      };

      // Insert into Supabase
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

      // Block commission in wallet (optional)
      try {
        const userId = await getUserId();
        await blockCommission(userId, commissionYombal);
        console.log('Commission blocked in wallet');
      } catch (walletError) {
        console.error('Error blocking commission (non-critical):', walletError);
        // Don't fail the ride creation if wallet blocking fails
      }

      // Convert Supabase data to local format
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
        createdAt: data.created_at || new Date().toISOString(),
        departureLat: data.departure_lat || undefined,
        departureLng: data.departure_lng || undefined,
        arrivalLat: data.arrival_lat || undefined,
        arrivalLng: data.arrival_lng || undefined,
        distanceKm: data.distance_km || undefined,
        durationMinutes: data.duration_minutes || undefined,
      };

      // Update local state
      const updatedRides = [newRide, ...rides];
      setRides(updatedRides);
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
      console.log('Ride added to Supabase:', newRide);
    } catch (error) {
      console.error('Error adding ride:', error);
      throw error;
    }
  };

  const getRidesByDriver = useCallback((driverId: string): Ride[] => {
    return rides.filter(ride => ride.driverId === driverId);
  }, [rides]);

  const searchRides = useCallback((departureCity: string, arrivalCity: string, date: string, passengers: number): Ride[] => {
    return rides.filter(ride => {
      const matchesDeparture = ride.departureCity.toLowerCase().includes(departureCity.toLowerCase());
      const matchesArrival = ride.arrivalCity.toLowerCase().includes(arrivalCity.toLowerCase());
      const matchesDate = !date || ride.date === date;
      const hasEnoughSeats = ride.availableSeats >= passengers;
      const isActive = ride.status === 'active';

      return matchesDeparture && matchesArrival && matchesDate && hasEnoughSeats && isActive;
    });
  }, [rides]);

  const addReservation = async (
    reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>,
    onNotify?: (type: 'reservation_created', driverId: string, rideDetails: any) => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const ride = rides.find(r => r.id === reservationData.rideId);
      
      if (!ride) {
        return { success: false, message: 'Trajet introuvable' };
      }

      if (ride.status === 'cancelled') {
        return { success: false, message: 'Ce trajet a été annulé' };
      }

      // Check if enough seats are available
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

      // Update available seats (optimistically reserve)
      const updatedRides = rides.map(r => {
        if (r.id === reservationData.rideId) {
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

      // Notify driver
      if (onNotify) {
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
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding reservation:', error);
      return { success: false, message: 'Erreur lors de la réservation' };
    }
  };

  const getReservationsByPassenger = useCallback((passengerId: string): Reservation[] => {
    return reservations
      .filter(reservation => reservation.passengerId === passengerId)
      .map(reservation => ({
        ...reservation,
        ride: rides.find(ride => ride.id === reservation.rideId),
      }));
  }, [reservations, rides]);

  const getReservationsByRide = useCallback((rideId: string): Reservation[] => {
    return reservations.filter(reservation => reservation.rideId === rideId);
  }, [reservations]);

  const updateReservationStatus = async (
    reservationId: string,
    status: 'accepted' | 'refused',
    onNotify?: (type: 'reservation_accepted' | 'reservation_refused', passengerId: string, rideDetails: any) => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (!reservation) {
        return { success: false, message: 'Réservation introuvable' };
      }

      const ride = rides.find(r => r.id === reservation.rideId);
      
      if (!ride) {
        return { success: false, message: 'Trajet introuvable' };
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('carpool_bookings')
        .update({ status })
        .eq('id', reservationId);

      if (updateError) {
        console.error('Error updating booking status:', updateError);
        return { success: false, message: 'Erreur lors de la mise à jour' };
      }

      // If accepting, check if we still have enough seats
      if (status === 'accepted') {
        const acceptedReservations = reservations.filter(
          r => r.rideId === ride.id && r.status === 'accepted'
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
        if (r.id === reservationId) {
          return { ...r, status };
        }
        return r;
      });

      // If refused, restore available seats
      let updatedRides = rides;
      if (status === 'refused') {
        updatedRides = rides.map(r => {
          if (r.id === reservation.rideId) {
            return {
              ...r,
              availableSeats: r.availableSeats + reservation.numberOfPassengers,
            };
          }
          return r;
        });

        // Update seats in Supabase
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

      // Notify passenger
      if (onNotify) {
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
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating reservation status:', error);
      return { success: false, message: 'Erreur lors de la mise à jour' };
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('carpool_bookings')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (updateError) {
        console.error('Error cancelling booking:', updateError);
        throw updateError;
      }

      // Restore available seats if booking was pending
      if (reservation.status === 'pending') {
        const ride = rides.find(r => r.id === reservation.rideId);
        if (ride) {
          const newSeatsAvailable = ride.availableSeats + reservation.numberOfPassengers;
          
          await supabase
            .from('carpool_rides')
            .update({ seats_available: newSeatsAvailable })
            .eq('id', ride.id);

          const updatedRides = rides.map(r => {
            if (r.id === reservation.rideId) {
              return {
                ...r,
                availableSeats: newSeatsAvailable,
              };
            }
            return r;
          });

          setRides(updatedRides);
          await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
        }
      }

      const updatedReservations = reservations.filter(r => r.id !== reservationId);

      setReservations(updatedReservations);
      await AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));

      console.log('Reservation cancelled:', reservationId);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  };

  const cancelRide = async (
    rideId: string,
    onNotify?: (type: 'ride_cancelled', passengerIds: string[], rideDetails: any) => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('=== CANCEL RIDE START ===');
      console.log('Ride ID to cancel:', rideId);
      
      const ride = rides.find(r => r.id === rideId);
      
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

      // Update ride status in Supabase
      console.log('Updating ride status in Supabase...');
      const { data: updatedRide, error: updateError } = await supabase
        .from('carpool_rides')
        .update({ 
          status: 'cancelled',
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

      // Get all reservations for this ride
      const rideReservations = reservations.filter(r => r.rideId === rideId);
      const passengerIds = rideReservations.map(r => r.passengerId);

      console.log('Found reservations to update:', rideReservations.length);

      // Update all bookings to refused in Supabase
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
      }

      // Update ride status locally
      console.log('Updating local state...');
      const updatedRides = rides.map(r => {
        if (r.id === rideId) {
          return { ...r, status: 'cancelled' as const, availableSeats: 0 };
        }
        return r;
      });

      // Set all reservations to refused locally
      const updatedReservations = reservations.map(r => {
        if (r.rideId === rideId && r.status !== 'refused') {
          return { ...r, status: 'refused' as const };
        }
        return r;
      });

      // Update state immediately
      console.log('Setting state with updated data...');
      setRides(updatedRides);
      setReservations(updatedReservations);

      // Save to AsyncStorage
      console.log('Saving to AsyncStorage...');
      await Promise.all([
        AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides)),
        AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations)),
      ]);

      console.log('AsyncStorage updated successfully');

      // Notify all passengers
      if (onNotify && passengerIds.length > 0) {
        console.log('Sending notifications to passengers...');
        onNotify('ride_cancelled', passengerIds, {
          ride: {
            departureCity: ride.departureCity,
            arrivalCity: ride.arrivalCity,
            date: ride.date,
            time: ride.time,
          },
        });
      }

      console.log('=== CANCEL RIDE SUCCESS ===');
      return { success: true };
    } catch (error) {
      console.error('=== CANCEL RIDE ERROR ===');
      console.error('Error details:', error);
      return { success: false, message: 'Erreur lors de l\'annulation du trajet' };
    }
  };

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
        refreshData,
        isLoading,
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
