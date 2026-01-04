
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureProfileAndWallet } from '@/utils/profileWalletUtils';
import { IS_TEST_MODE } from '@/config/testMode';

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
  loadWalletFromDatabase: () => Promise<void>;
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

// Default wallet with ZERO balances - no test data in production
const defaultWallet: WalletData = {
  balanceAvailable: 0,
  balancePending: 0,
  commissionRateCarpool: IS_TEST_MODE ? 0 : 0.12, // 12% in production, 0% in test mode
  commissionRateParcel: IS_TEST_MODE ? 0 : 0.15,  // 15% in production, 0% in test mode
  transactions: [],
  carpoolStats: {
    totalEarned: 0,
    commission: 0,
    netDriver: 0,
  },
  parcelStats: {
    totalEarned: 0,
    commission: 0,
    netDelivery: 0,
  },
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = '@yombal_yoon_profile';
const USER_ID_KEY = '@yombal_yoon_user_id';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [wallet, setWallet] = useState<WalletData>(defaultWallet);
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
   * Load wallet data from database
   * This replaces the hardcoded test data with real data from Supabase
   */
  const loadWalletFromDatabase = React.useCallback(async () => {
    try {
      const currentUserId = await getUserId();
      if (!currentUserId) {
        console.log('⚠️ No user ID available for wallet loading');
        return;
      }

      console.log('💰 Loading wallet from database for user:', currentUserId);

      // Get wallet data from Supabase
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (walletError) {
        console.error('❌ Error loading wallet:', walletError);
        return;
      }

      if (!walletData) {
        console.log('⚠️ No wallet found, using default empty wallet');
        setWallet(defaultWallet);
        return;
      }

      // Get transactions from database
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions_wallet')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('❌ Error loading transactions:', transactionsError);
      }

      // Transform transactions to match our interface
      const transactions: Transaction[] = (transactionsData || []).map((t: any) => ({
        id: t.id,
        date: t.created_at,
        description: t.description || 'Transaction',
        amount: Math.abs(t.montant),
        type: t.type === 'gain' || t.type === 'credit' ? 'credit' : 'debit',
        module: t.description?.toLowerCase().includes('colis') ? 'parcel' : 
                t.description?.toLowerCase().includes('covoiturage') ? 'carpool' : 'other',
      }));

      // Calculate stats from transactions
      const carpoolTransactions = transactions.filter(t => t.module === 'carpool' && t.type === 'credit');
      const parcelTransactions = transactions.filter(t => t.module === 'parcel' && t.type === 'credit');

      const carpoolTotal = carpoolTransactions.reduce((sum, t) => sum + t.amount, 0);
      const parcelTotal = parcelTransactions.reduce((sum, t) => sum + t.amount, 0);

      const commissionRateCarpool = IS_TEST_MODE ? 0 : 0.12;
      const commissionRateParcel = IS_TEST_MODE ? 0 : 0.15;

      const carpoolCommission = Math.round(carpoolTotal * commissionRateCarpool);
      const parcelCommission = Math.round(parcelTotal * commissionRateParcel);

      const updatedWallet: WalletData = {
        balanceAvailable: walletData.solde || 0,
        balancePending: walletData.solde_bloque || 0,
        commissionRateCarpool,
        commissionRateParcel,
        transactions,
        carpoolStats: {
          totalEarned: carpoolTotal,
          commission: carpoolCommission,
          netDriver: carpoolTotal - carpoolCommission,
        },
        parcelStats: {
          totalEarned: parcelTotal,
          commission: parcelCommission,
          netDelivery: parcelTotal - parcelCommission,
        },
      };

      setWallet(updatedWallet);
      console.log('✅ Wallet loaded from database successfully');
    } catch (error) {
      console.error('❌ Error in loadWalletFromDatabase:', error);
      setWallet(defaultWallet);
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
        
        // Load wallet data from database
        await loadWalletFromDatabase();
        
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
  }, [getUserId, getLocalProfile, loadFromLocalStorage, loadWalletFromDatabase]);

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

      // Use .update() instead of .upsert() to avoid conflicts
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', currentUserId);

      if (error) {
        console.error('❌ Error updating profile in Supabase:', error);
        
        // Check if it's a unique constraint violation on phone_number
        if (error.code === '23505' && error.message.includes('phone_number')) {
          throw new Error('Ce numéro de téléphone est déjà utilisé par un autre compte');
        }
        
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

  /**
   * Reset profile - clears all local data and resets to default state
   * This is called during logout
   */
  const resetProfile = React.useCallback(async () => {
    try {
      console.log('🔄 Resetting profile...');
      
      // Clear local storage
      await AsyncStorage.multiRemove([PROFILE_STORAGE_KEY, USER_ID_KEY]);
      console.log('✅ Local storage cleared');
      
      // Reset state to default
      setProfile(defaultProfile);
      setWallet(defaultWallet);
      setUserId(null);
      console.log('✅ Profile state reset to default');
      
      // Note: We don't delete from Supabase here because the user might want to log back in
      // The Supabase session is already cleared by supabase.auth.signOut()
      
    } catch (error) {
      console.error('❌ Error resetting profile:', error);
      // Even if there's an error, reset the state
      setProfile(defaultProfile);
      setWallet(defaultWallet);
      setUserId(null);
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        wallet,
        updateProfile,
        resetProfile,
        isLoading,
        refreshProfile,
        loadWalletFromDatabase,
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
