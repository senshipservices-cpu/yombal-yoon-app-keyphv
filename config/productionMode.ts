
/**
 * Production Mode Configuration
 * 
 * Controls whether the app is in production or test mode.
 * In test mode, phone numbers can be reused for testing purposes.
 * In production mode, phone numbers are unique per user.
 */

export const IS_PRODUCTION_MODE = false; // Set to true for production, false for testing

/**
 * Test mode configuration
 * When IS_PRODUCTION_MODE is false, these settings apply:
 * - Phone numbers can be reused for testing
 * - OTP verification is more lenient
 * - Duplicate phone number checks are relaxed
 */
export const TEST_MODE_CONFIG = {
  // Allow phone number reuse in test mode
  allowPhoneReuse: !IS_PRODUCTION_MODE,
  
  // OTP expiration time (in minutes)
  otpExpirationMinutes: 10,
  
  // Maximum OTP attempts before blocking
  maxOtpAttempts: 5,
};

/**
 * Get the current mode display text
 */
export function getModeDisplayText(): string {
  return IS_PRODUCTION_MODE ? 'Production' : 'Test';
}

/**
 * Check if phone number reuse is allowed
 */
export function isPhoneReuseAllowed(): boolean {
  return TEST_MODE_CONFIG.allowPhoneReuse;
}
