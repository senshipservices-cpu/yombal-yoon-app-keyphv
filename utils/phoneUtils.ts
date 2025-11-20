
import { Linking } from 'react-native';

/**
 * Mask a phone number for display
 * Format: 77 *** ** 86 (2 first digits, masked middle, 2 last digits)
 * @param phoneNumber - The phone number to mask
 * @returns Masked phone number string
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 4) {
    // If number is too short, just mask everything except first digit
    return cleanNumber.charAt(0) + '*'.repeat(cleanNumber.length - 1);
  }
  
  // Get first 2 and last 2 digits
  const firstTwo = cleanNumber.substring(0, 2);
  const lastTwo = cleanNumber.substring(cleanNumber.length - 2);
  
  // Calculate middle section length
  const middleLength = cleanNumber.length - 4;
  
  // Create masked middle section with spacing
  let maskedMiddle = '';
  if (middleLength > 0) {
    // Group asterisks for better readability
    const groups = Math.ceil(middleLength / 2);
    for (let i = 0; i < groups; i++) {
      maskedMiddle += '**';
      if (i < groups - 1) maskedMiddle += ' ';
    }
  }
  
  return `${firstTwo} ${maskedMiddle} ${lastTwo}`;
}

/**
 * Make a phone call
 * @param phoneNumber - The phone number to call
 */
export async function makePhoneCall(phoneNumber: string): Promise<void> {
  if (!phoneNumber) {
    console.error('No phone number provided');
    return;
  }
  
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const url = `tel:${cleanNumber}`;
  
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.error('Cannot open phone dialer');
    }
  } catch (error) {
    console.error('Error making phone call:', error);
  }
}

/**
 * Open WhatsApp with a pre-filled message
 * @param phoneNumber - The phone number to contact on WhatsApp
 * @param message - Optional custom message (default: "Bonjour, je vous contacte via Yombal Yoon…")
 */
export async function openWhatsApp(
  phoneNumber: string,
  message: string = 'Bonjour, je vous contacte via Yombal Yoon…'
): Promise<void> {
  if (!phoneNumber) {
    console.error('No phone number provided');
    return;
  }
  
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Ensure number has country code (Senegal: 221)
  let formattedNumber = cleanNumber;
  if (!cleanNumber.startsWith('221') && cleanNumber.length === 9) {
    formattedNumber = '221' + cleanNumber;
  }
  
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.error('Cannot open WhatsApp');
    }
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
  }
}
