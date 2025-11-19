
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/app/integrations/supabase/types';

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
  ) => Promise<void>;
  isLoading: boolean;
}

const CovoiturageContext = createContext<CovoiturageContextType | undefined>(undefined);

const RIDES_STORAGE_KEY = '@yombal_yoon_rides';
const RESERVATIONS_STORAGE_KEY = '@yombal_yoon_reservations';

export function CovoiturageProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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
          };
        });

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
  };

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt' | 'status'>) => {
    try {
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
      };

      // Update local state
      const updatedRides = [...rides, newRide];
      setRides(updatedRides);
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
      console.log('Ride added to Supabase:', newRide);
    } catch (error) {
      console.error('Error adding ride:', error);
      throw error;
    }
  };

  const getRidesByDriver = (driverId: string): Ride[] => {
    return rides.filter(ride => ride.driverId === driverId);
  };

  const searchRides = (departureCity: string, arrivalCity: string, date: string, passengers: number): Ride[] => {
    return rides.filter(ride => {
      const matchesDeparture = ride.departureCity.toLowerCase().includes(departureCity.toLowerCase());
      const matchesArrival = ride.arrivalCity.toLowerCase().includes(arrivalCity.toLowerCase());
      const matchesDate = !date || ride.date === date;
      const hasEnoughSeats = ride.availableSeats >= passengers;
      const isActive = ride.status === 'active';

      return matchesDeparture && matchesArrival && matchesDate && hasEnoughSeats && isActive;
    });
  };

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

  const getReservationsByPassenger = (passengerId: string): Reservation[] => {
    return reservations
      .filter(reservation => reservation.passengerId === passengerId)
      .map(reservation => ({
        ...reservation,
        ride: rides.find(ride => ride.id === reservation.rideId),
      }));
  };

  const getReservationsByRide = (rideId: string): Reservation[] => {
    return reservations.filter(reservation => reservation.rideId === rideId);
  };

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

      // Restore available seats
      const updatedRides = rides.map(ride => {
        if (ride.id === reservation.rideId) {
          return {
            ...ride,
            availableSeats: ride.availableSeats + reservation.numberOfPassengers,
          };
        }
        return ride;
      });

      const updatedReservations = reservations.filter(r => r.id !== reservationId);

      setRides(updatedRides);
      setReservations(updatedReservations);

      await Promise.all([
        AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides)),
        AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations)),
      ]);

      console.log('Reservation cancelled:', reservationId);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };

  const cancelRide = async (
    rideId: string,
    onNotify?: (type: 'ride_cancelled', passengerIds: string[], rideDetails: any) => void
  ) => {
    try {
      const ride = rides.find(r => r.id === rideId);
      
      if (!ride) {
        console.log('Ride not found');
        return;
      }

      // Update ride status in Supabase
      const { error: updateError } = await supabase
        .from('carpool_rides')
        .update({ 
          status: 'cancelled',
          seats_available: 0 
        })
        .eq('id', rideId);

      if (updateError) {
        console.error('Error updating ride in Supabase:', updateError);
        throw updateError;
      }

      // Update ride status locally
      const updatedRides = rides.map(r => {
        if (r.id === rideId) {
          return { ...r, status: 'cancelled' as const, availableSeats: 0 };
        }
        return r;
      });

      // Get all reservations for this ride
      const rideReservations = reservations.filter(r => r.rideId === rideId);
      const passengerIds = rideReservations.map(r => r.passengerId);

      // Update all bookings to refused in Supabase
      if (rideReservations.length > 0) {
        const bookingIds = rideReservations.map(r => r.id);
        const { error: bookingsError } = await supabase
          .from('carpool_bookings')
          .update({ status: 'refused' })
          .in('id', bookingIds);

        if (bookingsError) {
          console.error('Error updating bookings in Supabase:', bookingsError);
        }
      }

      // Set all reservations to refused locally
      const updatedReservations = reservations.map(r => {
        if (r.rideId === rideId && r.status !== 'refused') {
          return { ...r, status: 'refused' as const };
        }
        return r;
      });

      setRides(updatedRides);
      setReservations(updatedReservations);

      await Promise.all([
        AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides)),
        AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations)),
      ]);

      console.log('Ride cancelled in Supabase:', rideId);

      // Notify all passengers
      if (onNotify && passengerIds.length > 0) {
        onNotify('ride_cancelled', passengerIds, {
          ride: {
            departureCity: ride.departureCity,
            arrivalCity: ride.arrivalCity,
            date: ride.date,
            time: ride.time,
          },
        });
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
      throw error;
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
