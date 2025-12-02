
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureProfileAndWallet } from '@/utils/profileWalletUtils';

export interface ProfileData {
  id: string;
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
  id: '',
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

  const getUserId = React.useCallback(async (): Promise<string> => {
    if (userId) return userId;

    let storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(USER_ID_KEY, storedUserId);
      console.log('Generated new user ID:', storedUserId);
    }

    setUserId(storedUserId);
    return storedUserId;
  }, [userId]);

  const getLocalProfile = React.useCallback(async (): Promise<Partial<ProfileData>> => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
    } catch (error) {
      console.error('Error reading local profile:', error);
    }
    return {};
  }, []);

  const loadFromLocalStorage = React.useCallback(async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        
        const migratedProfile: ProfileData = {
          id: parsedProfile.id || '',
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
        const currentUserId = await getUserId();
        const newProfile = { ...defaultProfile, id: currentUserId };
        setProfile(newProfile);
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
        console.log('New user profile created with default carpooling roles activated');
      }
    } catch (error) {
      console.error('Error loading from local storage:', error);
      const currentUserId = await getUserId();
      setProfile({ ...defaultProfile, id: currentUserId });
    }
  }, [getUserId]);

  /**
   * Initialize user: Create profile and wallet automatically if they don't exist
   * This is called on app start (BLOC 1 implementation)
   */
  const initializeUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUserId = await getUserId();

      console.log('🔄 Initializing user:', currentUserId);

      // Load from local storage first to get any existing data
      const localProfile = await getLocalProfile();

      // Use the new ensureProfileAndWallet utility function
      const result = await ensureProfileAndWallet(currentUserId, {
        phone: localProfile.phone || '',
        name: localProfile.fullName || 'Utilisateur',
        roles: localProfile.roles,
      });

      if (result && result.profile) {
        const profileData: ProfileData = {
          id: result.profile.id,
          fullName: result.profile.full_name || '',
          phone: result.profile.phone_number || '',
          avatarUrl: result.profile.avatar_url || undefined,
          isPhoneVerified: result.profile.is_phone_verified || false,
          roles: result.profile.roles || defaultProfile.roles,
        };

        setProfile(profileData);
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
        
        console.log('✅ User initialization complete');
      } else {
        // Fallback to local storage if ensureProfileAndWallet fails
        await loadFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ Error initializing user:', error);
      await loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, [getUserId, getLocalProfile, loadFromLocalStorage]);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const updateProfile = async (data: Partial<ProfileData>) => {
    try {
      console.log('📝 Updating profile with data:', data);
      
      const updatedProfile = { ...profile, ...data };
      
      if (data.roles) {
        updatedProfile.roles = {
          ...updatedProfile.roles,
          ...data.roles,
          driver: true,
          passenger: true,
        };
      }

      // Update local state and storage first
      setProfile(updatedProfile);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      console.log('✅ Profile updated in local storage');

      // Then update Supabase
      const currentUserId = await getUserId();
      
      // Prepare the update data - only include fields that exist in the database
      const updateData: any = {
        id: currentUserId,
        updated_at: new Date().toISOString(),
      };

      // Only add fields if they are provided
      if (data.phone !== undefined) {
        updateData.phone_number = updatedProfile.phone;
      }
      if (data.fullName !== undefined) {
        updateData.full_name = updatedProfile.fullName;
      }
      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = updatedProfile.avatarUrl;
      }
      if (data.isPhoneVerified !== undefined) {
        updateData.is_phone_verified = updatedProfile.isPhoneVerified;
      }
      if (data.roles !== undefined) {
        updateData.roles = updatedProfile.roles;
      }

      console.log('📤 Sending update to Supabase:', updateData);

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updateData);

      if (error) {
        console.error('❌ Error updating profile in Supabase:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      } else {
        console.log('✅ Profile updated in Supabase successfully');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error; // Re-throw to let the caller handle it
    }
  };

  const refreshProfile = React.useCallback(async () => {
    setIsLoading(true);
    await initializeUser();
  }, [initializeUser]);

  const resetProfile = React.useCallback(async () => {
    try {
      const currentUserId = await getUserId();
      setProfile({ ...defaultProfile, id: currentUserId });
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      
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
  }, [getUserId]);

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
