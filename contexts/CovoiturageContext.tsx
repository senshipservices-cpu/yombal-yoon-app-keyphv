
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const [storedRides, storedReservations] = await Promise.all([
        AsyncStorage.getItem(RIDES_STORAGE_KEY),
        AsyncStorage.getItem(RESERVATIONS_STORAGE_KEY),
      ]);

      if (storedRides) {
        setRides(JSON.parse(storedRides));
        console.log('Rides loaded from storage');
      }

      if (storedReservations) {
        setReservations(JSON.parse(storedReservations));
        console.log('Reservations loaded from storage');
      }
    } catch (error) {
      console.error('Error loading covoiturage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt' | 'status'>) => {
    try {
      const newRide: Ride = {
        ...rideData,
        id: Date.now().toString(),
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const updatedRides = [...rides, newRide];
      setRides(updatedRides);
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
      console.log('Ride added:', newRide);
    } catch (error) {
      console.error('Error adding ride:', error);
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

      // Update ride status to cancelled
      const updatedRides = rides.map(r => {
        if (r.id === rideId) {
          return { ...r, status: 'cancelled' as const };
        }
        return r;
      });

      // Get all reservations for this ride
      const rideReservations = reservations.filter(r => r.rideId === rideId);
      const passengerIds = rideReservations.map(r => r.passengerId);

      // Set all reservations to refused
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

      console.log('Ride cancelled:', rideId);

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
