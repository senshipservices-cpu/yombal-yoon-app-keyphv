
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProfileData {
  fullName: string;
  phone: string;
  roles: {
    driver: boolean;
    passenger: boolean;
    delivery: boolean;
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
}

const defaultProfile: ProfileData = {
  fullName: '',
  phone: '',
  roles: {
    driver: false,
    passenger: false,
    delivery: false,
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

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [wallet] = useState<WalletData>(defaultWallet);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
        console.log('Profile loaded from storage');
      } else {
        console.log('No stored profile found, using default');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    try {
      const updatedProfile = { ...profile, ...data };
      setProfile(updatedProfile);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      console.log('Profile updated and saved');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const resetProfile = async () => {
    try {
      setProfile(defaultProfile);
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
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
