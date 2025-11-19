
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InterRegionalRequest {
  id: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  departureRegion: string;
  destinationRegion: string;
  destinationDepartment: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  pricing: {
    baseFee: number;
    destinationFee: number;
    total: number;
  };
  createdAt: string;
  deliveredAt?: string;
}

interface LivraisonContextType {
  interRegionalRequests: InterRegionalRequest[];
  addInterRegionalRequest: (request: Omit<InterRegionalRequest, 'id' | 'status' | 'createdAt'>) => Promise<{ success: boolean; requestId?: string }>;
  updateRequestStatus: (requestId: string, status: InterRegionalRequest['status']) => Promise<void>;
  getRequestsByPhone: (phone: string) => InterRegionalRequest[];
  getRequestById: (requestId: string) => InterRegionalRequest | undefined;
  isLoading: boolean;
}

const LivraisonContext = createContext<LivraisonContextType | undefined>(undefined);

const LIVRAISON_STORAGE_KEY = '@yombal_yoon_livraison';

export function LivraisonProvider({ children }: { children: ReactNode }) {
  const [interRegionalRequests, setInterRegionalRequests] = useState<InterRegionalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedRequests = await AsyncStorage.getItem(LIVRAISON_STORAGE_KEY);

      if (storedRequests) {
        setInterRegionalRequests(JSON.parse(storedRequests));
        console.log('Inter-regional requests loaded from storage');
      }
    } catch (error) {
      console.error('Error loading livraison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addInterRegionalRequest = async (
    requestData: Omit<InterRegionalRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; requestId?: string }> => {
    try {
      const newRequest: InterRegionalRequest = {
        ...requestData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = [...interRegionalRequests, newRequest];
      setInterRegionalRequests(updatedRequests);
      await AsyncStorage.setItem(LIVRAISON_STORAGE_KEY, JSON.stringify(updatedRequests));
      
      console.log('Inter-regional request added:', newRequest);
      return { success: true, requestId: newRequest.id };
    } catch (error) {
      console.error('Error adding inter-regional request:', error);
      return { success: false };
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: InterRegionalRequest['status']
  ) => {
    try {
      const updatedRequests = interRegionalRequests.map(request => {
        if (request.id === requestId) {
          const updated = { ...request, status };
          
          if (status === 'delivered' && !request.deliveredAt) {
            updated.deliveredAt = new Date().toISOString();
          }
          
          return updated;
        }
        return request;
      });

      setInterRegionalRequests(updatedRequests);
      await AsyncStorage.setItem(LIVRAISON_STORAGE_KEY, JSON.stringify(updatedRequests));
      
      console.log('Request status updated:', status);
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getRequestsByPhone = (phone: string): InterRegionalRequest[] => {
    return interRegionalRequests.filter(
      request => request.senderPhone === phone || request.recipientPhone === phone
    );
  };

  const getRequestById = (requestId: string): InterRegionalRequest | undefined => {
    return interRegionalRequests.find(request => request.id === requestId);
  };

  return (
    <LivraisonContext.Provider
      value={{
        interRegionalRequests,
        addInterRegionalRequest,
        updateRequestStatus,
        getRequestsByPhone,
        getRequestById,
        isLoading,
      }}
    >
      {children}
    </LivraisonContext.Provider>
  );
}

export function useLivraison() {
  const context = useContext(LivraisonContext);
  if (context === undefined) {
    throw new Error('useLivraison must be used within a LivraisonProvider');
  }
  return context;
}
