
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/integrations/supabase/client';
import type { TablesInsert } from '@/app/integrations/supabase/types';

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
  addInterRegionalRequest: (request: Omit<InterRegionalRequest, 'id' | 'status' | 'createdAt'>) => Promise<{ success: boolean; requestId?: string; error?: string }>;
  updateRequestStatus: (requestId: string, status: InterRegionalRequest['status']) => Promise<void>;
  getRequestsByPhone: (phone: string) => InterRegionalRequest[];
  getRequestById: (requestId: string) => InterRegionalRequest | undefined;
  isLoading: boolean;
  refreshRequests: () => Promise<void>;
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
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from('intercity_deliveries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading from Supabase:', error);
        // Fallback to AsyncStorage
        const storedRequests = await AsyncStorage.getItem(LIVRAISON_STORAGE_KEY);
        if (storedRequests) {
          setInterRegionalRequests(JSON.parse(storedRequests));
          console.log('Inter-regional requests loaded from local storage');
        }
      } else if (data) {
        // Map Supabase data to our format
        const mappedRequests: InterRegionalRequest[] = data.map(item => ({
          id: item.id,
          senderName: item.sender_name,
          senderPhone: item.sender_phone,
          recipientName: item.recipient_name,
          recipientPhone: item.recipient_phone,
          departureRegion: item.departure_region,
          destinationRegion: item.destination_region,
          destinationDepartment: item.destination_city || '',
          description: item.description || '',
          status: (item.status as InterRegionalRequest['status']) || 'pending',
          pricing: {
            baseFee: 1000,
            destinationFee: (item.price_fcfa || 0) - 1000,
            total: item.price_fcfa || 0,
          },
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setInterRegionalRequests(mappedRequests);
        console.log('Inter-regional requests loaded from Supabase:', mappedRequests.length);
      }
    } catch (error) {
      console.error('Error loading livraison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRequests = async () => {
    setIsLoading(true);
    await loadData();
  };

  const sendNotifications = async (requestData: Omit<InterRegionalRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      console.log('📧 Sending notifications to Yombal Yoon team...');
      
      const { data, error } = await supabase.functions.invoke('send-intercity-notifications', {
        body: {
          senderName: requestData.senderName,
          senderPhone: requestData.senderPhone,
          recipientName: requestData.recipientName,
          recipientPhone: requestData.recipientPhone,
          departureRegion: requestData.departureRegion,
          destinationRegion: requestData.destinationRegion,
          destinationDepartment: requestData.destinationDepartment,
          description: requestData.description,
          pricingTotal: requestData.pricing.total,
        },
      });

      if (error) {
        console.error('❌ Error sending notifications:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notifications sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception sending notifications:', error);
      return { success: false, error: error.message };
    }
  };

  const addInterRegionalRequest = async (
    requestData: Omit<InterRegionalRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    try {
      // Prepare data for Supabase
      const insertData: TablesInsert<'intercity_deliveries'> = {
        sender_name: requestData.senderName,
        sender_phone: requestData.senderPhone,
        recipient_name: requestData.recipientName,
        recipient_phone: requestData.recipientPhone,
        departure_region: requestData.departureRegion,
        destination_region: requestData.destinationRegion,
        destination_city: requestData.destinationDepartment || requestData.destinationRegion,
        description: requestData.description,
        status: 'pending',
        price_fcfa: requestData.pricing.total,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('intercity_deliveries')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting into Supabase:', error);
        
        // Fallback to local storage
        const newRequest: InterRegionalRequest = {
          ...requestData,
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const updatedRequests = [...interRegionalRequests, newRequest];
        setInterRegionalRequests(updatedRequests);
        await AsyncStorage.setItem(LIVRAISON_STORAGE_KEY, JSON.stringify(updatedRequests));
        
        console.log('Inter-regional request added to local storage:', newRequest);
        return { 
          success: false, 
          requestId: newRequest.id,
          error: 'Impossible d\'enregistrer la demande. Vérifiez votre connexion et réessayez.'
        };
      }

      // Success - map the response
      const newRequest: InterRegionalRequest = {
        id: data.id,
        senderName: data.sender_name,
        senderPhone: data.sender_phone,
        recipientName: data.recipient_name,
        recipientPhone: data.recipient_phone,
        departureRegion: data.departure_region,
        destinationRegion: data.destination_region,
        destinationDepartment: data.destination_city || '',
        description: data.description || '',
        status: (data.status as InterRegionalRequest['status']) || 'pending',
        pricing: requestData.pricing,
        createdAt: data.created_at || new Date().toISOString(),
      };

      const updatedRequests = [...interRegionalRequests, newRequest];
      setInterRegionalRequests(updatedRequests);
      
      // Also save to local storage as backup
      await AsyncStorage.setItem(LIVRAISON_STORAGE_KEY, JSON.stringify(updatedRequests));
      
      console.log('✅ Inter-regional request added to Supabase:', newRequest);

      // Send notifications to Yombal Yoon team (Email + WhatsApp)
      // This runs asynchronously and doesn't block the user experience
      sendNotifications(requestData).then(notificationResult => {
        if (notificationResult.success) {
          console.log('✅ Notifications sent successfully to Yombal Yoon team');
        } else {
          console.warn('⚠️ Notifications failed but request was saved:', notificationResult.error);
        }
      });

      return { success: true, requestId: newRequest.id };
    } catch (error) {
      console.error('Error adding inter-regional request:', error);
      return { 
        success: false,
        error: 'Impossible d\'enregistrer la demande. Vérifiez votre connexion et réessayez.'
      };
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: InterRegionalRequest['status']
  ) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('intercity_deliveries')
        .update({ status })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating status in Supabase:', error);
      }

      // Update local state
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
        refreshRequests,
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
