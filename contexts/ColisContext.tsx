
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface ColisContextType {
  parcelRequests: ParcelRequest[];
  addParcelRequest: (request: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>) => Promise<{ success: boolean; requestId?: string }>;
  updateParcelStatus: (parcelId: string, status: ParcelRequest['status']) => Promise<void>;
  getParcelRequestsBySender: (senderPhone: string) => ParcelRequest[];
  getParcelById: (parcelId: string) => ParcelRequest | undefined;
  isLoading: boolean;
}

const ColisContext = createContext<ColisContextType | undefined>(undefined);

const PARCELS_STORAGE_KEY = '@yombal_yoon_parcels';

export function ColisProvider({ children }: { children: ReactNode }) {
  const [parcelRequests, setParcelRequests] = useState<ParcelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedParcels = await AsyncStorage.getItem(PARCELS_STORAGE_KEY);

      if (storedParcels) {
        setParcelRequests(JSON.parse(storedParcels));
        console.log('Parcel requests loaded from storage');
      }
    } catch (error) {
      console.error('Error loading parcel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addParcelRequest = async (
    requestData: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; requestId?: string }> => {
    try {
      const newRequest: ParcelRequest = {
        ...requestData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = [...parcelRequests, newRequest];
      setParcelRequests(updatedRequests);
      await AsyncStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(updatedRequests));
      
      console.log('Parcel request added:', newRequest);
      return { success: true, requestId: newRequest.id };
    } catch (error) {
      console.error('Error adding parcel request:', error);
      return { success: false };
    }
  };

  const updateParcelStatus = async (
    parcelId: string,
    status: ParcelRequest['status']
  ) => {
    try {
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
