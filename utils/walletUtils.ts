
import { supabase } from '@/app/integrations/supabase/client';
import { IS_TEST_MODE } from '@/config/testMode';

// Commission rate (12%) - Only used in production mode
export const COMMISSION_RATE = 0.12;

// Debt threshold (-10000 FCFA)
export const DEBT_THRESHOLD = -10000;

/**
 * Calculate commission and provider amounts from total price
 */
export function calculateAmounts(prixTotal: number) {
  // In test mode, commission is 0
  const commissionRate = IS_TEST_MODE ? 0 : COMMISSION_RATE;
  const commissionYombal = Math.round(prixTotal * commissionRate);
  const prixPrestataire = prixTotal - commissionYombal;
  
  return {
    prixTotal,
    commissionYombal,
    prixPrestataire,
  };
}

/**
 * Get or create wallet for a user
 */
export async function getOrCreateWallet(userId: string) {
  try {
    // Try to get existing wallet
    const { data: existingWallet, error: fetchError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingWallet) {
      return { wallet: existingWallet, error: null };
    }

    // Create new wallet if it doesn't exist
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          solde: 0,
          solde_bloque: 0,
          total_gagne: 0,
          total_commissions: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return { wallet: null, error: createError };
      }

      return { wallet: newWallet, error: null };
    }

    console.error('Error fetching wallet:', fetchError);
    return { wallet: null, error: fetchError };
  } catch (error) {
    console.error('Error in getOrCreateWallet:', error);
    return { wallet: null, error };
  }
}

/**
 * Check if user has too much debt
 */
export async function checkDebtStatus(userId: string): Promise<{
  isBlocked: boolean;
  currentBalance: number;
  debtAmount: number;
}> {
  try {
    const { wallet, error } = await getOrCreateWallet(userId);

    if (error || !wallet) {
      console.error('Error checking debt status:', error);
      return {
        isBlocked: false,
        currentBalance: 0,
        debtAmount: 0,
      };
    }

    const isBlocked = wallet.solde < DEBT_THRESHOLD;
    const debtAmount = isBlocked ? Math.abs(wallet.solde) : 0;

    return {
      isBlocked,
      currentBalance: wallet.solde,
      debtAmount,
    };
  } catch (error) {
    console.error('Error in checkDebtStatus:', error);
    return {
      isBlocked: false,
      currentBalance: 0,
      debtAmount: 0,
    };
  }
}

/**
 * Block commission in wallet
 */
export async function blockCommission(userId: string, commissionAmount: number) {
  try {
    // In test mode, skip commission blocking
    if (IS_TEST_MODE) {
      console.log('TEST MODE: Skipping commission blocking');
      return { success: true, error: null };
    }

    const { wallet, error: walletError } = await getOrCreateWallet(userId);

    if (walletError || !wallet) {
      console.error('Error getting wallet for blocking commission:', walletError);
      return { success: false, error: walletError };
    }

    // Update solde_bloque
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        solde_bloque: wallet.solde_bloque + commissionAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error blocking commission:', updateError);
      return { success: false, error: updateError };
    }

    console.log(`Blocked ${commissionAmount} FCFA in wallet for user ${userId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in blockCommission:', error);
    return { success: false, error };
  }
}

/**
 * Credit driver wallet after payment
 */
export async function creditDriverWallet(
  userId: string,
  amount: number,
  courseId: string,
  description: string
) {
  try {
    const { wallet, error: walletError } = await getOrCreateWallet(userId);

    if (walletError || !wallet) {
      console.error('Error getting wallet for credit:', walletError);
      return { success: false, error: walletError };
    }

    const soldeBefore = wallet.solde;
    const soldeAfter = soldeBefore + amount;

    // Update wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        solde: soldeAfter,
        total_gagne: wallet.total_gagne + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return { success: false, error: updateError };
    }

    // Insert transaction
    const { error: transactionError } = await supabase
      .from('transactions_wallet')
      .insert({
        wallet_id: wallet.id,
        type: 'gain',
        montant: amount,
        solde_avant: soldeBefore,
        solde_apres: soldeAfter,
        course_id: courseId,
        description,
      });

    if (transactionError) {
      console.error('Error inserting transaction:', transactionError);
      return { success: false, error: transactionError };
    }

    console.log(`Credited ${amount} FCFA to wallet for user ${userId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in creditDriverWallet:', error);
    return { success: false, error };
  }
}

/**
 * Debit commission from wallet
 */
export async function debitCommission(
  userId: string,
  commissionAmount: number,
  courseId: string,
  description: string,
  unblockAmount: number = 0
) {
  try {
    // In test mode, skip commission deduction
    if (IS_TEST_MODE) {
      console.log('TEST MODE: Skipping commission deduction');
      return { success: true, error: null };
    }

    const { wallet, error: walletError } = await getOrCreateWallet(userId);

    if (walletError || !wallet) {
      console.error('Error getting wallet for debit:', walletError);
      return { success: false, error: walletError };
    }

    const soldeBefore = wallet.solde;
    const soldeAfter = soldeBefore - commissionAmount;

    // Update wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        solde: soldeAfter,
        solde_bloque: Math.max(0, wallet.solde_bloque - unblockAmount),
        total_commissions: wallet.total_commissions + commissionAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return { success: false, error: updateError };
    }

    // Insert transaction
    const { error: transactionError } = await supabase
      .from('transactions_wallet')
      .insert({
        wallet_id: wallet.id,
        type: 'commission',
        montant: -commissionAmount,
        solde_avant: soldeBefore,
        solde_apres: soldeAfter,
        course_id: courseId,
        description,
      });

    if (transactionError) {
      console.error('Error inserting transaction:', transactionError);
      return { success: false, error: transactionError };
    }

    console.log(`Debited ${commissionAmount} FCFA commission from wallet for user ${userId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in debitCommission:', error);
    return { success: false, error };
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}
