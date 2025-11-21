
import { supabase } from '@/app/integrations/supabase/client';

/**
 * BLOC 1 - Ensure Profile and Wallet exist for a user
 * 
 * This function is called after login/OTP or on app start to guarantee
 * that a user always has a profile and wallet before accessing the Profile page.
 * 
 * @param userId - The user ID (text format, not UUID)
 * @param userData - Optional user data to use when creating profile
 * @param retryCount - Number of retry attempts (default: 2)
 * @returns Object containing profile and wallet data, or null if user not provided
 */
export async function ensureProfileAndWallet(
  userId: string | null,
  userData?: {
    phone?: string;
    name?: string;
    roles?: any;
  },
  retryCount: number = 2
): Promise<{ profile: any; wallet: any } | null> {
  console.log('🔄 ensureProfileAndWallet called for user:', userId, 'retry count:', retryCount);

  if (!userId) {
    console.log('⚠️ No user ID provided, skipping profile/wallet creation');
    return null;
  }

  try {
    // 1) Vérifier / créer PROFIL
    let { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error fetching profile:', profileError);
      
      // Retry if we have attempts left
      if (retryCount > 0) {
        console.log(`🔄 Retrying profile fetch... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        return ensureProfileAndWallet(userId, userData, retryCount - 1);
      }
      
      throw profileError;
    }

    // Si le profil n'existe pas, le créer
    if (!profile) {
      console.log('📝 Profile not found, creating automatically...');
      
      const { data: newProfile, error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          phone_number: userData?.phone || '',
          full_name: userData?.name || 'Utilisateur',
          is_phone_verified: false,
          roles: userData?.roles || {
            driver: true,
            passenger: true,
            delivery: false,
            sender: false,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createProfileError) {
        console.error('❌ Error creating profile:', createProfileError);
        
        // Retry fetching in case of race condition
        const { data: retryProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (retryProfile) {
          console.log('✅ Profile found on retry after creation error');
          profile = retryProfile;
        } else if (retryCount > 0) {
          console.log(`🔄 Retrying profile creation... (${retryCount} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return ensureProfileAndWallet(userId, userData, retryCount - 1);
        } else {
          throw createProfileError;
        }
      } else {
        console.log('✅ Profile created successfully');
        profile = newProfile;
      }
    } else {
      console.log('✅ Profile already exists');
    }

    // 2) Vérifier / créer WALLET
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('❌ Error fetching wallet:', walletError);
      
      // Retry if we have attempts left
      if (retryCount > 0) {
        console.log(`🔄 Retrying wallet fetch... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return ensureProfileAndWallet(userId, userData, retryCount - 1);
      }
      
      throw walletError;
    }

    // Si le wallet n'existe pas, le créer
    if (!wallet) {
      console.log('💰 Wallet not found, creating automatically...');
      
      const { data: newWallet, error: createWalletError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          solde: 0,
          solde_bloque: 0,
          total_gagne: 0,
          total_commissions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createWalletError) {
        console.error('❌ Error creating wallet:', createWalletError);
        
        // Retry fetching in case of race condition or unique constraint violation
        const { data: retryWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (retryWallet) {
          console.log('✅ Wallet found on retry after creation error');
          wallet = retryWallet;
        } else if (retryCount > 0) {
          console.log(`🔄 Retrying wallet creation... (${retryCount} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return ensureProfileAndWallet(userId, userData, retryCount - 1);
        } else {
          throw createWalletError;
        }
      } else {
        console.log('✅ Wallet created successfully');
        wallet = newWallet;
      }
    } else {
      console.log('✅ Wallet already exists');
    }

    console.log('✅ ensureProfileAndWallet completed successfully');
    return { profile, wallet };
  } catch (error) {
    console.error('❌ Error in ensureProfileAndWallet:', error);
    
    // Final retry if we have attempts left
    if (retryCount > 0) {
      console.log(`🔄 Final retry... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before final retry
      return ensureProfileAndWallet(userId, userData, retryCount - 1);
    }
    
    throw error;
  }
}

/**
 * BLOC 2 - Load wallet for Profile page
 * 
 * This function ensures profile and wallet exist, then loads the wallet data.
 * It handles errors gracefully and provides clear error messages.
 * Uses retry logic (2 attempts) before showing error.
 * 
 * @param userId - The user ID (text format, not UUID)
 * @param retryCount - Number of retry attempts (default: 2)
 * @returns Wallet data or throws an error
 * @throws 'USER_NOT_AUTH' if user is not authenticated
 * @throws 'WALLET_LOAD_ERROR' if wallet cannot be loaded after retries
 */
export async function loadWalletForProfil(
  userId: string | null,
  retryCount: number = 2
): Promise<any> {
  console.log('🔄 loadWalletForProfil called for user:', userId, 'retry count:', retryCount);

  if (!userId) {
    console.error('❌ User not authenticated');
    throw new Error('USER_NOT_AUTH');
  }

  try {
    // 1) S'assurer que profil + wallet existent (with retry logic)
    const result = await ensureProfileAndWallet(userId, undefined, retryCount);
    
    if (!result || !result.wallet) {
      throw new Error('WALLET_LOAD_ERROR');
    }

    // 2) Return the wallet directly from ensureProfileAndWallet
    console.log('✅ Wallet loaded successfully from ensureProfileAndWallet');
    return result.wallet;
  } catch (error: any) {
    console.error('❌ Error in loadWalletForProfil:', error);
    
    // Retry if we have attempts left
    if (retryCount > 0 && error.message !== 'USER_NOT_AUTH') {
      console.log(`🔄 Retrying loadWalletForProfil... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return loadWalletForProfil(userId, retryCount - 1);
    }
    
    throw error;
  }
}

/**
 * Refresh wallet data with retry logic
 * 
 * @param userId - The user ID
 * @param retryCount - Number of retry attempts (default: 2)
 * @returns Updated wallet data
 */
export async function refreshWallet(
  userId: string | null,
  retryCount: number = 2
): Promise<any> {
  if (!userId) {
    throw new Error('USER_NOT_AUTH');
  }

  try {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !wallet) {
      console.error('❌ Error refreshing wallet:', error);
      
      // Retry if we have attempts left
      if (retryCount > 0) {
        console.log(`🔄 Retrying wallet refresh... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return refreshWallet(userId, retryCount - 1);
      }
      
      throw new Error('WALLET_LOAD_ERROR');
    }

    return wallet;
  } catch (error) {
    console.error('❌ Error in refreshWallet:', error);
    
    // Final retry
    if (retryCount > 0) {
      console.log(`🔄 Final retry for wallet refresh... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return refreshWallet(userId, retryCount - 1);
    }
    
    throw error;
  }
}
