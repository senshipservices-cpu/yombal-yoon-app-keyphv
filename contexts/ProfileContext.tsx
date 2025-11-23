
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProfileData {
  fullName: string;
  phone: string;
  avatarUrl?: string;
  isPhoneVerified: boolean;
  roles: {
    driver: boolean;
    passenger: boolean;
    delivery: boolean;
    sender: boolean;
  };
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  module: 'carpool' | 'parcel' | 'other';
}

export interface WalletData {
  balanceAvailable: number;
  balancePending: number;
  commissionRateCarpool: number;
  commissionRateParcel: number;
  transactions: Transaction[];
  carpoolStats: {
    totalEarned: number;
    commission: number;
    netDriver: number;
  };
  parcelStats: {
    totalEarned: number;
    commission: number;
    netDelivery: number;
  };
}

interface ProfileContextType {
  profile: ProfileData;
  wallet: WalletData;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  resetProfile: () => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const defaultProfile: ProfileData = {
  fullName: '',
  phone: '',
  avatarUrl: undefined,
  isPhoneVerified: false,
  roles: {
    driver: true,
    passenger: true,
    delivery: false,
    sender: false,
  },
};

const defaultWallet: WalletData = {
  balanceAvailable: 15000,
  balancePending: 5000,
  commissionRateCarpool: 0.15,
  commissionRateParcel: 0.20,
  transactions: [
    {
      id: '1',
      date: new Date(Date.now() - 86400000).toISOString(),
      description: 'Course Dakar - Thiès',
      amount: 5000,
      type: 'credit',
      module: 'carpool',
    },
    {
      id: '2',
      date: new Date(Date.now() - 172800000).toISOString(),
      description: 'Livraison Colis - Rufisque',
      amount: 3000,
      type: 'credit',
      module: 'parcel',
    },
    {
      id: '3',
      date: new Date(Date.now() - 259200000).toISOString(),
      description: 'Course Dakar - Mbour',
      amount: 7000,
      type: 'credit',
      module: 'carpool',
    },
    {
      id: '4',
      date: new Date(Date.now() - 345600000).toISOString(),
      description: 'Retrait Wave',
      amount: -10000,
      type: 'debit',
      module: 'other',
    },
    {
      id: '5',
      date: new Date(Date.now() - 432000000).toISOString(),
      description: 'Livraison Express - Pikine',
      amount: 2500,
      type: 'credit',
      module: 'parcel',
    },
  ],
  carpoolStats: {
    totalEarned: 12000,
    commission: 1800,
    netDriver: 10200,
  },
  parcelStats: {
    totalEarned: 5500,
    commission: 1100,
    netDelivery: 4400,
  },
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = '@yombal_yoon_profile';
const USER_ID_KEY = '@yombal_yoon_user_id';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [wallet] = useState<WalletData>(defaultWallet);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const getUserId = async (): Promise<string> => {
    if (userId) return userId;

    let storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, storedUserId);
      console.log('Generated new user ID:', storedUserId);
    }

    setUserId(storedUserId);
    return storedUserId;
  };

  const loadProfile = async () => {
    try {
      const currentUserId = await getUserId();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile from Supabase:', error);
        await loadFromLocalStorage();
        return;
      }

      if (data) {
        const loadedProfile: ProfileData = {
          fullName: data.full_name || '',
          phone: data.phone_number || '',
          avatarUrl: data.avatar_url || undefined,
          isPhoneVerified: data.is_phone_verified || false,
          roles: {
            driver: data.roles?.driver ?? true,
            passenger: data.roles?.passenger ?? true,
            delivery: data.roles?.delivery ?? false,
            sender: data.roles?.sender ?? false,
          },
        };
        setProfile(loadedProfile);
        console.log('Profile loaded from Supabase:', loadedProfile);
      } else {
        await loadFromLocalStorage();
        await syncToSupabase(currentUserId);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      await loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        
        const migratedProfile: ProfileData = {
          fullName: parsedProfile.fullName || '',
          phone: parsedProfile.phone || '',
          avatarUrl: parsedProfile.avatarUrl,
          isPhoneVerified: parsedProfile.isPhoneVerified ?? false,
          roles: {
            driver: parsedProfile.roles?.driver ?? true,
            passenger: parsedProfile.roles?.passenger ?? true,
            delivery: parsedProfile.roles?.delivery ?? false,
            sender: parsedProfile.roles?.sender ?? false,
          },
        };
        
        setProfile(migratedProfile);
        console.log('Profile loaded from local storage');
      } else {
        setProfile(defaultProfile);
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
        console.log('New user profile created with default carpooling roles activated');
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
      setProfile(defaultProfile);
    }
  };

  const syncToSupabase = async (currentUserId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: currentUserId,
          phone_number: profile.phone,
          full_name: profile.fullName,
          avatar_url: profile.avatarUrl,
          is_phone_verified: profile.isPhoneVerified,
          roles: profile.roles,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error syncing to Supabase:', error);
      } else {
        console.log('Profile synced to Supabase');
      }
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    try {
      const updatedProfile = { ...profile, ...data };
      
      if (data.roles) {
        updatedProfile.roles = {
          ...updatedProfile.roles,
          ...data.roles,
          driver: true,
          passenger: true,
        };
      }

      setProfile(updatedProfile);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));

      const currentUserId = await getUserId();
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: currentUserId,
          phone_number: updatedProfile.phone,
          full_name: updatedProfile.fullName,
          avatar_url: updatedProfile.avatarUrl,
          is_phone_verified: updatedProfile.isPhoneVerified,
          roles: updatedProfile.roles,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating profile in Supabase:', error);
      } else {
        console.log('Profile updated in Supabase');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    await loadProfile();
  };

  const resetProfile = async () => {
    try {
      setProfile(defaultProfile);
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      
      const currentUserId = await getUserId();
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', currentUserId);

      if (error) {
        console.error('Error deleting profile from Supabase:', error);
      }

      console.log('Profile reset');
    } catch (error) {
      console.error('Error resetting profile:', error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        wallet,
        updateProfile,
        resetProfile,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
