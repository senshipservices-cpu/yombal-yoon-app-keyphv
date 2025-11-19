
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
  addRide: (ride: Omit<Ride, 'id' | 'createdAt'>) => Promise<void>;
  getRidesByDriver: (driverId: string) => Ride[];
  searchRides: (departureCity: string, arrivalCity: string, date: string, passengers: number) => Ride[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  getReservationsByPassenger: (passengerId: string) => Reservation[];
  getReservationsByRide: (rideId: string) => Reservation[];
  updateReservationStatus: (reservationId: string, status: 'accepted' | 'refused') => Promise<void>;
  cancelReservation: (reservationId: string) => Promise<void>;
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

  const addRide = async (rideData: Omit<Ride, 'id' | 'createdAt'>) => {
    try {
      const newRide: Ride = {
        ...rideData,
        id: Date.now().toString(),
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

      return matchesDeparture && matchesArrival && matchesDate && hasEnoughSeats;
    });
  };

  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    try {
      const newReservation: Reservation = {
        ...reservationData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Update available seats
      const updatedRides = rides.map(ride => {
        if (ride.id === reservationData.rideId) {
          return {
            ...ride,
            availableSeats: ride.availableSeats - reservationData.numberOfPassengers,
          };
        }
        return ride;
      });

      const updatedReservations = [...reservations, newReservation];
      setRides(updatedRides);
      setReservations(updatedReservations);

      await Promise.all([
        AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides)),
        AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations)),
      ]);

      console.log('Reservation added:', newReservation);
    } catch (error) {
      console.error('Error adding reservation:', error);
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

  const updateReservationStatus = async (reservationId: string, status: 'accepted' | 'refused') => {
    try {
      const updatedReservations = reservations.map(reservation => {
        if (reservation.id === reservationId) {
          return { ...reservation, status };
        }
        return reservation;
      });

      // If refused, restore available seats
      if (status === 'refused') {
        const reservation = reservations.find(r => r.id === reservationId);
        if (reservation) {
          const updatedRides = rides.map(ride => {
            if (ride.id === reservation.rideId) {
              return {
                ...ride,
                availableSeats: ride.availableSeats + reservation.numberOfPassengers,
              };
            }
            return ride;
          });
          setRides(updatedRides);
          await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(updatedRides));
        }
      }

      setReservations(updatedReservations);
      await AsyncStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      console.log('Reservation status updated:', reservationId, status);
    } catch (error) {
      console.error('Error updating reservation status:', error);
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
