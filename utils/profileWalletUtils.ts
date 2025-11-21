
import { supabase } from '@/app/integrations/supabase/client';

/**
 * BLOC 1 - Ensure Profile and Wallet exist for a user
 * 
 * This function is called after login/OTP or on app start to guarantee
 * that a user always has a profile and wallet before accessing the Profile page.
 * 
 * @param userId - The user ID (text format, not UUID)
 * @param userData - Optional user data to use when creating profile
 * @returns Object containing profile and wallet data, or null if user not provided
 */
export async function ensureProfileAndWallet(
  userId: string | null,
  userData?: {
    phone?: string;
    name?: string;
    roles?: any;
  }
) {
  console.log('🔄 ensureProfileAndWallet called for user:', userId);

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
          console.log('✅ Profile found on retry');
          profile = retryProfile;
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
          console.log('✅ Wallet found on retry');
          wallet = retryWallet;
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
    throw error;
  }
}

/**
 * BLOC 2 - Load wallet for Profile page
 * 
 * This function ensures profile and wallet exist, then loads the wallet data.
 * It handles errors gracefully and provides clear error messages.
 * 
 * @param userId - The user ID (text format, not UUID)
 * @returns Wallet data or throws an error
 * @throws 'USER_NOT_AUTH' if user is not authenticated
 * @throws 'WALLET_LOAD_ERROR' if wallet cannot be loaded
 */
export async function loadWalletForProfil(userId: string | null) {
  console.log('🔄 loadWalletForProfil called for user:', userId);

  if (!userId) {
    console.error('❌ User not authenticated');
    throw new Error('USER_NOT_AUTH');
  }

  try {
    // 1) S'assurer que profil + wallet existent
    await ensureProfileAndWallet(userId);

    // 2) Charger le wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !wallet) {
      console.error('❌ Error loading wallet:', error);
      throw new Error('WALLET_LOAD_ERROR');
    }

    console.log('✅ Wallet loaded successfully');
    return wallet;
  } catch (error) {
    console.error('❌ Error in loadWalletForProfil:', error);
    throw error;
  }
}

/**
 * Refresh wallet data
 * 
 * @param userId - The user ID
 * @returns Updated wallet data
 */
export async function refreshWallet(userId: string | null) {
  if (!userId) {
    throw new Error('USER_NOT_AUTH');
  }

  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !wallet) {
    console.error('❌ Error refreshing wallet:', error);
    throw new Error('WALLET_LOAD_ERROR');
  }

  return wallet;
}
