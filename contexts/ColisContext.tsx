
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
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryOption: 'standard' | 'express';
  pricing?: {
    distance: number;
    baseFee: number;
    kmFee: number;
    total: number;
  };
  createdAt: string;
}

interface ColisContextType {
  parcelRequests: ParcelRequest[];
  addParcelRequest: (request: Omit<ParcelRequest, 'id' | 'status' | 'createdAt'>) => Promise<{ success: boolean; requestId?: string }>;
  getParcelRequestsBySender: (senderPhone: string) => ParcelRequest[];
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

  const getParcelRequestsBySender = (senderPhone: string): ParcelRequest[] => {
    return parcelRequests.filter(request => request.senderPhone === senderPhone);
  };

  return (
    <ColisContext.Provider
      value={{
        parcelRequests,
        addParcelRequest,
        getParcelRequestsBySender,
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
