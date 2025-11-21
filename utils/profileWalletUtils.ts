
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
    console.log('📋 Step 1: Checking if profile exists for user_id:', userId);
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
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        return ensureProfileAndWallet(userId, userData, retryCount - 1);
      }
      
      throw profileError;
    }

    // Si le profil n'existe pas, vérifier d'abord si un profil existe avec ce numéro de téléphone
    if (!profile && userData?.phone) {
      console.log('📞 Checking if profile exists with phone number:', userData.phone);
      
      const { data: existingProfileByPhone } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone_number', userData.phone)
        .maybeSingle();

      if (existingProfileByPhone) {
        console.log('⚠️ Profile already exists with this phone number, using existing profile');
        profile = existingProfileByPhone;
        
        // Update the userId in AsyncStorage to match the existing profile
        // This prevents duplicate profiles with the same phone number
        console.log('🔄 Updating local userId to match existing profile:', existingProfileByPhone.id);
      }
    }

    // Si le profil n'existe toujours pas, le créer
    if (!profile) {
      console.log('📝 Profile not found, creating automatically...');
      
      // Only include phone_number if it's not empty
      const profileData: any = {
        id: userId,
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
      };

      // Only add phone_number if it's provided and not empty
      if (userData?.phone && userData.phone.trim() !== '') {
        profileData.phone_number = userData.phone;
      }

      const { data: newProfile, error: createProfileError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .maybeSingle();

      if (createProfileError) {
        console.error('❌ Error creating profile:', createProfileError);
        
        // Check if it's a duplicate phone number error
        if (createProfileError.code === '23505' && createProfileError.message?.includes('phone_number')) {
          console.log('⚠️ Duplicate phone number detected, fetching existing profile...');
          
          // Try to fetch the existing profile by phone number
          if (userData?.phone) {
            const { data: existingProfile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('phone_number', userData.phone)
              .maybeSingle();
            
            if (existingProfile) {
              console.log('✅ Found existing profile with phone number, using it');
              profile = existingProfile;
            }
          }
        }
        
        // If we still don't have a profile, retry fetching by ID
        if (!profile) {
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            return ensureProfileAndWallet(userId, userData, retryCount - 1);
          } else {
            throw createProfileError;
          }
        }
      } else {
        console.log('✅ Profile created successfully');
        profile = newProfile;
      }
    } else {
      console.log('✅ Profile already exists');
    }

    // 2) Vérifier / créer WALLET
    console.log('💰 Step 2: Checking if wallet exists for user_id:', profile.id);
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('❌ Error fetching wallet:', walletError);
      
      // Retry if we have attempts left
      if (retryCount > 0) {
        console.log(`🔄 Retrying wallet fetch... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return ensureProfileAndWallet(userId, userData, retryCount - 1);
      }
      
      throw walletError;
    }

    // Si le wallet n'existe pas, le créer
    if (!wallet) {
      console.log('💰 Wallet not found, creating automatically...');
      console.log('   → INSERT INTO wallets {');
      console.log('        user_id:', profile.id);
      console.log('        solde: 0,');
      console.log('        solde_bloque: 0,');
      console.log('        total_gagne: 0,');
      console.log('        total_commissions: 0');
      console.log('     }');
      
      const { data: newWallet, error: createWalletError } = await supabase
        .from('wallets')
        .insert({
          user_id: profile.id,
          solde: 0,
          solde_bloque: 0,
          total_gagne: 0,
          total_commissions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (createWalletError) {
        console.error('❌ Error creating wallet:', createWalletError);
        
        // Retry fetching in case of race condition or unique constraint violation
        const { data: retryWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();
        
        if (retryWallet) {
          console.log('✅ Wallet found on retry after creation error');
          wallet = retryWallet;
        } else if (retryCount > 0) {
          console.log(`🔄 Retrying wallet creation... (${retryCount} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
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
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s before final retry
      return ensureProfileAndWallet(userId, userData, retryCount - 1);
    }
    
    throw error;
  }
}

/**
 * BLOC 2 - Load wallet for Profile page
 * 
 * À coller dans l'action d'ouverture de l'écran "Profil" :
 * 1. Récupérer l'utilisateur connecté (auth)
 * 2. Requête Supabase : SELECT * FROM wallets WHERE user_id = auth.user.id
 * 3. Si aucun wallet retourné :
 *    → INSERT INTO wallets {
 *         user_id: auth.user.id,
 *         solde: 0,
 *         solde_bloque: 0,
 *         total_gagne: 0,
 *         total_commissions: 0
 *      }
 * 4. Recharger la section Wallet
 * 
 * This function ensures profile and wallet exist, then loads the wallet data.
 * It handles errors gracefully and provides clear error messages.
 * Uses retry logic (2 attempts) before showing error.
 * 
 * @param userId - The user ID (text format, not UUID) - corresponds to auth.user.id
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
  console.log('📋 Implementation of user requirements:');
  console.log('   1. ✅ Récupérer l\'utilisateur connecté (userId provided)');
  console.log('   2. 🔄 Requête Supabase: SELECT * FROM wallets WHERE user_id = userId');
  console.log('   3. 🔄 Si aucun wallet: INSERT INTO wallets with default values');
  console.log('   4. 🔄 Recharger la section Wallet');

  // 1. Récupérer l'utilisateur connecté (auth)
  if (!userId) {
    console.error('❌ User not authenticated (no userId provided)');
    throw new Error('USER_NOT_AUTH');
  }

  try {
    // First, ensure profile and wallet exist
    console.log('🔄 Ensuring profile and wallet exist before loading...');
    const result = await ensureProfileAndWallet(userId, undefined, 1); // Use 1 retry for faster response

    if (!result || !result.wallet) {
      console.error('❌ Failed to ensure wallet exists');
      throw new Error('WALLET_LOAD_ERROR');
    }

    // Use the profile ID from the result (in case it was different due to phone number match)
    const profileId = result.profile.id;

    // 2. Requête Supabase : SELECT * FROM wallets WHERE user_id = profile.id
    console.log('🔍 Step 2: Querying wallet for user_id:', profileId);
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', profileId)
      .maybeSingle();

    if (walletError) {
      console.error('❌ Error fetching wallet:', walletError);
      
      // Retry if we have attempts left
      if (retryCount > 0) {
        console.log(`🔄 Retrying wallet fetch... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadWalletForProfil(userId, retryCount - 1);
      }
      
      throw new Error('WALLET_LOAD_ERROR');
    }

    // 3. Si aucun wallet retourné : INSERT INTO wallets
    if (!wallet) {
      console.log('💰 Step 3: No wallet found after ensure, creating with default values...');
      console.log('   → INSERT INTO wallets {');
      console.log('        user_id:', profileId);
      console.log('        solde: 0,');
      console.log('        solde_bloque: 0,');
      console.log('        total_gagne: 0,');
      console.log('        total_commissions: 0');
      console.log('     }');
      
      const { data: newWallet, error: createWalletError } = await supabase
        .from('wallets')
        .insert({
          user_id: profileId,
          solde: 0,
          solde_bloque: 0,
          total_gagne: 0,
          total_commissions: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (createWalletError) {
        console.error('❌ Error creating wallet:', createWalletError);
        
        // Retry fetching in case of race condition
        const { data: retryWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', profileId)
          .maybeSingle();
        
        if (retryWallet) {
          console.log('✅ Wallet found on retry after creation error');
          // 4. Recharger la section Wallet (return wallet data)
          console.log('✅ Step 4: Wallet section reloaded with data:', {
            solde: retryWallet.solde,
            solde_bloque: retryWallet.solde_bloque,
            total_gagne: retryWallet.total_gagne,
            total_commissions: retryWallet.total_commissions
          });
          return retryWallet;
        } else if (retryCount > 0) {
          console.log(`🔄 Retrying wallet creation... (${retryCount} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadWalletForProfil(userId, retryCount - 1);
        } else {
          throw new Error('WALLET_LOAD_ERROR');
        }
      } else {
        console.log('✅ Wallet created successfully');
        // 4. Recharger la section Wallet (return wallet data)
        console.log('✅ Step 4: Wallet section reloaded with data:', {
          solde: newWallet?.solde || 0,
          solde_bloque: newWallet?.solde_bloque || 0,
          total_gagne: newWallet?.total_gagne || 0,
          total_commissions: newWallet?.total_commissions || 0
        });
        return newWallet;
      }
    } else {
      console.log('✅ Wallet already exists, no creation needed');
      // 4. Recharger la section Wallet (return wallet data)
      console.log('✅ Step 4: Wallet section reloaded with data:', {
        solde: wallet.solde,
        solde_bloque: wallet.solde_bloque,
        total_gagne: wallet.total_gagne,
        total_commissions: wallet.total_commissions
      });
      return wallet;
    }
  } catch (error: any) {
    console.error('❌ Error in loadWalletForProfil:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    // Retry if we have attempts left
    if (retryCount > 0 && error.message !== 'USER_NOT_AUTH') {
      console.log(`🔄 Retrying loadWalletForProfil... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1500));
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
      .maybeSingle();

    if (error) {
      console.error('❌ Error refreshing wallet:', error);
      
      // Retry if we have attempts left
      if (retryCount > 0) {
        console.log(`🔄 Retrying wallet refresh... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return refreshWallet(userId, retryCount - 1);
      }
      
      throw new Error('WALLET_LOAD_ERROR');
    }

    if (!wallet) {
      console.log('⚠️ No wallet found during refresh, creating one...');
      // Create wallet if it doesn't exist
      const result = await ensureProfileAndWallet(userId);
      return result?.wallet || null;
    }

    return wallet;
  } catch (error) {
    console.error('❌ Error in refreshWallet:', error);
    
    // Final retry
    if (retryCount > 0) {
      console.log(`🔄 Final retry for wallet refresh... (${retryCount} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return refreshWallet(userId, retryCount - 1);
    }
    
    throw error;
  }
}
