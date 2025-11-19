
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateDistance } from '@/utils/distance';
import { useNotifications } from './NotificationContext';

export interface Location {
  lat: number;
  lng: number;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: Location;
  rating: number;
  completedDeliveries: number;
  vehicleType: 'moto' | 'car' | 'bicycle';
}

export interface ParcelAssignment {
  id: string;
  parcelId: string;
  deliveryPersonId: string;
  status: 'pending' | 'accepted' | 'refused' | 'en_route_pickup' | 'picked_up' | 'en_route_delivery' | 'delivered' | 'cancelled';
  assignedAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  refusedAt?: string;
  refusalReason?: string;
}

interface DeliveryContextType {
  deliveryPersons: DeliveryPerson[];
  assignments: ParcelAssignment[];
  findNearbyDeliveryPersons: (location: Location, radiusKm: number) => DeliveryPerson[];
  assignParcelToNearbyDeliveryPersons: (parcelId: string, pickupLocation: Location, pickupAddress: string) => Promise<void>;
  acceptAssignment: (assignmentId: string, deliveryPersonId: string) => Promise<boolean>;
  refuseAssignment: (assignmentId: string, deliveryPersonId: string, reason?: string) => Promise<void>;
  updateAssignmentStatus: (assignmentId: string, status: ParcelAssignment['status']) => Promise<void>;
  updateDeliveryPersonLocation: (deliveryPersonId: string, location: Location) => Promise<void>;
  getAssignmentByParcelId: (parcelId: string) => ParcelAssignment | undefined;
  getDeliveryPersonById: (deliveryPersonId: string) => DeliveryPerson | undefined;
  getPendingAssignmentsForDeliveryPerson: (deliveryPersonId: string) => ParcelAssignment[];
  isLoading: boolean;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

const DELIVERY_PERSONS_STORAGE_KEY = '@yombal_yoon_delivery_persons';
const ASSIGNMENTS_STORAGE_KEY = '@yombal_yoon_assignments';

// Mock delivery persons in Dakar area
const mockDeliveryPersons: DeliveryPerson[] = [
  {
    id: 'dp1',
    name: 'Mamadou Diop',
    phone: '+221 77 123 45 67',
    status: 'available',
    currentLocation: { lat: 14.6937, lng: -17.4441 }, // Dakar Plateau
    rating: 4.8,
    completedDeliveries: 156,
    vehicleType: 'moto',
  },
  {
    id: 'dp2',
    name: 'Fatou Sall',
    phone: '+221 76 234 56 78',
    status: 'available',
    currentLocation: { lat: 14.7167, lng: -17.4677 }, // Medina
    rating: 4.9,
    completedDeliveries: 203,
    vehicleType: 'moto',
  },
  {
    id: 'dp3',
    name: 'Ibrahima Ndiaye',
    phone: '+221 78 345 67 89',
    status: 'available',
    currentLocation: { lat: 14.7644, lng: -17.3660 }, // Pikine
    rating: 4.7,
    completedDeliveries: 98,
    vehicleType: 'car',
  },
  {
    id: 'dp4',
    name: 'Awa Diallo',
    phone: '+221 77 456 78 90',
    status: 'available',
    currentLocation: { lat: 14.6928, lng: -17.4467 }, // Point E
    rating: 4.6,
    completedDeliveries: 134,
    vehicleType: 'moto',
  },
  {
    id: 'dp5',
    name: 'Ousmane Ba',
    phone: '+221 76 567 89 01',
    status: 'busy',
    currentLocation: { lat: 14.7392, lng: -17.4900 }, // Yoff
    rating: 4.5,
    completedDeliveries: 87,
    vehicleType: 'bicycle',
  },
  {
    id: 'dp6',
    name: 'Aminata Sy',
    phone: '+221 78 678 90 12',
    status: 'available',
    currentLocation: { lat: 14.6708, lng: -17.4261 }, // Fann
    rating: 4.9,
    completedDeliveries: 245,
    vehicleType: 'moto',
  },
];

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [assignments, setAssignments] = useState<ParcelAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sendLocalNotification } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedDeliveryPersons = await AsyncStorage.getItem(DELIVERY_PERSONS_STORAGE_KEY);
      const storedAssignments = await AsyncStorage.getItem(ASSIGNMENTS_STORAGE_KEY);

      if (storedDeliveryPersons) {
        setDeliveryPersons(JSON.parse(storedDeliveryPersons));
        console.log('Delivery persons loaded from storage');
      } else {
        // Initialize with mock data
        setDeliveryPersons(mockDeliveryPersons);
        await AsyncStorage.setItem(DELIVERY_PERSONS_STORAGE_KEY, JSON.stringify(mockDeliveryPersons));
        console.log('Initialized with mock delivery persons');
      }

      if (storedAssignments) {
        setAssignments(JSON.parse(storedAssignments));
        console.log('Assignments loaded from storage');
      }
    } catch (error) {
      console.error('Error loading delivery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findNearbyDeliveryPersons = (location: Location, radiusKm: number): DeliveryPerson[] => {
    return deliveryPersons.filter(dp => {
      if (dp.status !== 'available') return false;
      
      const distance = calculateDistance(
        location.lat,
        location.lng,
        dp.currentLocation.lat,
        dp.currentLocation.lng
      );
      
      return distance <= radiusKm;
    }).sort((a, b) => {
      // Sort by distance (closest first)
      const distA = calculateDistance(location.lat, location.lng, a.currentLocation.lat, a.currentLocation.lng);
      const distB = calculateDistance(location.lat, location.lng, b.currentLocation.lat, b.currentLocation.lng);
      return distA - distB;
    });
  };

  const assignParcelToNearbyDeliveryPersons = async (
    parcelId: string,
    pickupLocation: Location,
    pickupAddress: string
  ) => {
    try {
      // Find delivery persons within 5km
      const nearbyDeliveryPersons = findNearbyDeliveryPersons(pickupLocation, 5);
      
      if (nearbyDeliveryPersons.length === 0) {
        console.log('No available delivery persons nearby');
        return;
      }

      console.log(`Found ${nearbyDeliveryPersons.length} nearby delivery persons`);

      // Create assignment for each nearby delivery person
      const newAssignments: ParcelAssignment[] = nearbyDeliveryPersons.map(dp => ({
        id: `assignment_${parcelId}_${dp.id}_${Date.now()}`,
        parcelId,
        deliveryPersonId: dp.id,
        status: 'pending',
        assignedAt: new Date().toISOString(),
      }));

      const updatedAssignments = [...assignments, ...newAssignments];
      setAssignments(updatedAssignments);
      await AsyncStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updatedAssignments));

      // Send notifications to nearby delivery persons
      for (const dp of nearbyDeliveryPersons) {
        const distance = calculateDistance(
          pickupLocation.lat,
          pickupLocation.lng,
          dp.currentLocation.lat,
          dp.currentLocation.lng
        );
        
        await sendLocalNotification(
          'Nouvelle demande de colis',
          `Colis à récupérer à ${pickupAddress} (${distance.toFixed(1)} km)`,
          {
            type: 'parcel_assignment',
            parcelId,
            deliveryPersonId: dp.id,
          }
        );
      }

      console.log('Parcel assigned to nearby delivery persons');
    } catch (error) {
      console.error('Error assigning parcel:', error);
    }
  };

  const acceptAssignment = async (
    assignmentId: string,
    deliveryPersonId: string
  ): Promise<boolean> => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        console.log('Assignment not found');
        return false;
      }

      // Check if already accepted by someone else
      const parcelAssignments = assignments.filter(a => a.parcelId === assignment.parcelId);
      const alreadyAccepted = parcelAssignments.some(a => a.status === 'accepted' || a.status === 'en_route_pickup');
      
      if (alreadyAccepted) {
        console.log('Parcel already accepted by another delivery person');
        
        // Refuse this assignment
        await refuseAssignment(assignmentId, deliveryPersonId, 'Déjà pris par un autre livreur');
        
        // Notify this delivery person
        await sendLocalNotification(
          'Colis déjà pris',
          'Ce colis a déjà été accepté par un autre livreur',
          { type: 'parcel_already_taken' }
        );
        
        return false;
      }

      // Accept this assignment
      const updatedAssignments = assignments.map(a => {
        if (a.id === assignmentId) {
          return {
            ...a,
            status: 'accepted' as const,
            acceptedAt: new Date().toISOString(),
          };
        }
        // Refuse all other pending assignments for this parcel
        if (a.parcelId === assignment.parcelId && a.status === 'pending') {
          return {
            ...a,
            status: 'refused' as const,
            refusedAt: new Date().toISOString(),
            refusalReason: 'Accepté par un autre livreur',
          };
        }
        return a;
      });

      setAssignments(updatedAssignments);
      await AsyncStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updatedAssignments));

      // Update delivery person status
      const updatedDeliveryPersons = deliveryPersons.map(dp =>
        dp.id === deliveryPersonId ? { ...dp, status: 'busy' as const } : dp
      );
      setDeliveryPersons(updatedDeliveryPersons);
      await AsyncStorage.setItem(DELIVERY_PERSONS_STORAGE_KEY, JSON.stringify(updatedDeliveryPersons));

      // Notify other delivery persons that parcel is taken
      const otherAssignments = parcelAssignments.filter(a => a.deliveryPersonId !== deliveryPersonId);
      for (const otherAssignment of otherAssignments) {
        await sendLocalNotification(
          'Colis déjà pris',
          'Ce colis a été accepté par un autre livreur',
          { type: 'parcel_already_taken' }
        );
      }

      console.log('Assignment accepted successfully');
      return true;
    } catch (error) {
      console.error('Error accepting assignment:', error);
      return false;
    }
  };

  const refuseAssignment = async (
    assignmentId: string,
    deliveryPersonId: string,
    reason?: string
  ) => {
    try {
      const updatedAssignments = assignments.map(a =>
        a.id === assignmentId
          ? {
              ...a,
              status: 'refused' as const,
              refusedAt: new Date().toISOString(),
              refusalReason: reason,
            }
          : a
      );

      setAssignments(updatedAssignments);
      await AsyncStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updatedAssignments));

      console.log('Assignment refused');
    } catch (error) {
      console.error('Error refusing assignment:', error);
    }
  };

  const updateAssignmentStatus = async (
    assignmentId: string,
    status: ParcelAssignment['status']
  ) => {
    try {
      const updatedAssignments = assignments.map(a => {
        if (a.id === assignmentId) {
          const updated = { ...a, status };
          
          if (status === 'picked_up' && !a.pickedUpAt) {
            updated.pickedUpAt = new Date().toISOString();
          } else if (status === 'delivered' && !a.deliveredAt) {
            updated.deliveredAt = new Date().toISOString();
            
            // Set delivery person back to available
            const assignment = assignments.find(a => a.id === assignmentId);
            if (assignment) {
              const updatedDeliveryPersons = deliveryPersons.map(dp =>
                dp.id === assignment.deliveryPersonId
                  ? { ...dp, status: 'available' as const, completedDeliveries: dp.completedDeliveries + 1 }
                  : dp
              );
              setDeliveryPersons(updatedDeliveryPersons);
              AsyncStorage.setItem(DELIVERY_PERSONS_STORAGE_KEY, JSON.stringify(updatedDeliveryPersons));
            }
          }
          
          return updated;
        }
        return a;
      });

      setAssignments(updatedAssignments);
      await AsyncStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updatedAssignments));

      console.log('Assignment status updated:', status);
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const updateDeliveryPersonLocation = async (
    deliveryPersonId: string,
    location: Location
  ) => {
    try {
      const updatedDeliveryPersons = deliveryPersons.map(dp =>
        dp.id === deliveryPersonId ? { ...dp, currentLocation: location } : dp
      );

      setDeliveryPersons(updatedDeliveryPersons);
      await AsyncStorage.setItem(DELIVERY_PERSONS_STORAGE_KEY, JSON.stringify(updatedDeliveryPersons));

      console.log('Delivery person location updated');
    } catch (error) {
      console.error('Error updating delivery person location:', error);
    }
  };

  const getAssignmentByParcelId = (parcelId: string): ParcelAssignment | undefined => {
    return assignments.find(
      a => a.parcelId === parcelId && (a.status === 'accepted' || a.status === 'en_route_pickup' || a.status === 'picked_up' || a.status === 'en_route_delivery' || a.status === 'delivered')
    );
  };

  const getDeliveryPersonById = (deliveryPersonId: string): DeliveryPerson | undefined => {
    return deliveryPersons.find(dp => dp.id === deliveryPersonId);
  };

  const getPendingAssignmentsForDeliveryPerson = (deliveryPersonId: string): ParcelAssignment[] => {
    return assignments.filter(
      a => a.deliveryPersonId === deliveryPersonId && a.status === 'pending'
    );
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveryPersons,
        assignments,
        findNearbyDeliveryPersons,
        assignParcelToNearbyDeliveryPersons,
        acceptAssignment,
        refuseAssignment,
        updateAssignmentStatus,
        updateDeliveryPersonLocation,
        getAssignmentByParcelId,
        getDeliveryPersonById,
        getPendingAssignmentsForDeliveryPerson,
        isLoading,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
}
