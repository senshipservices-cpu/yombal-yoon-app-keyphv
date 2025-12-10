
/**
 * Test Mode Configuration
 * 
 * Set IS_TEST_MODE to true during testing phase to disable commissions.
 * Set to false when ready for production.
 * 
 * Note: This is separate from productionMode.ts which controls OTP/phone verification.
 * - testMode.ts: Controls commission calculations (wallet/payment features)
 * - productionMode.ts: Controls OTP verification and phone number reuse
 */

export const IS_TEST_MODE = true; // 🎉 MODE TEST ACTIVÉ - Commissions à 0 FCFA pour période d'essai

/**
 * Commission rates for production mode
 */
export const COMMISSION_RATES = {
  covoiturage: 0.12, // 12% for carpooling
  colis: 0.15,       // 15% for parcel delivery
};

/**
 * Get commission rate based on service type and test mode
 * 
 * @param type - Service type: 'covoiturage' or 'colis'
 * @returns Commission rate (0 in test mode, actual rate in production)
 */
export function getCommissionRate(type: 'covoiturage' | 'colis'): number {
  if (IS_TEST_MODE) {
    return 0; // 0% commission in test mode
  }

  // Production mode
  return COMMISSION_RATES[type] || 0;
}

/**
 * Calculate commission and provider amounts from total price
 * 
 * @param prixTotal - Total price
 * @param type - Service type: 'covoiturage' or 'colis'
 * @returns Object with total, commission, and provider amounts
 */
export function calculateCommissionAmounts(
  prixTotal: number,
  type: 'covoiturage' | 'colis'
): {
  prixTotal: number;
  commissionYombal: number;
  prixPrestataire: number;
  commissionRate: number;
} {
  const commissionRate = getCommissionRate(type);
  const commissionYombal = Math.round(prixTotal * commissionRate);
  const prixPrestataire = prixTotal - commissionYombal;

  return {
    prixTotal,
    commissionYombal,
    prixPrestataire,
    commissionRate,
  };
}

/**
 * Get commission display text for UI
 * 
 * @param type - Service type: 'covoiturage' or 'colis'
 * @returns Display text for commission
 */
export function getCommissionDisplayText(type: 'covoiturage' | 'colis'): string {
  if (IS_TEST_MODE) {
    return 'Commission Yombal Yoon (Phase test - 0%)';
  }

  const rate = COMMISSION_RATES[type];
  const percentage = Math.round(rate * 100);
  return `Commission Yombal Yoon (${percentage}%)`;
}
