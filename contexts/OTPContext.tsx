
import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/supabase';
import { IS_PRODUCTION_MODE } from '@/config/productionMode';

interface OTPContextType {
  isPhoneVerified: boolean;
  phoneNumber: string;
  verifyPhone: (phone: string, otp: string, userId?: string) => Promise<{ success: boolean; message?: string }>;
  sendOTP: (phone: string, method?: 'whatsapp' | 'sms', userId?: string) => Promise<{ success: boolean; message?: string; method?: string }>;
  setPhoneVerified: (verified: boolean) => Promise<void>;
  loadVerificationStatus: () => Promise<void>;
  isProductionMode: boolean;
}

const OTPContext = createContext<OTPContextType | undefined>(undefined);

const OTP_STORAGE_KEY = '@yombal_yoon_phone_verified';
const PHONE_STORAGE_KEY = '@yombal_yoon_verified_phone';

export function OTPProvider({ children }: { children: ReactNode }) {
  const [isPhoneVerified, setIsPhoneVerifiedState] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const loadVerificationStatus = async () => {
    try {
      const [verified, phone] = await Promise.all([
        AsyncStorage.getItem(OTP_STORAGE_KEY),
        AsyncStorage.getItem(PHONE_STORAGE_KEY),
      ]);

      if (verified === 'true') {
        setIsPhoneVerifiedState(true);
        setPhoneNumber(phone || '');
        console.log('Phone verification status loaded:', { verified: true, phone });
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  };

  const setPhoneVerified = async (verified: boolean) => {
    try {
      await AsyncStorage.setItem(OTP_STORAGE_KEY, verified ? 'true' : 'false');
      setIsPhoneVerifiedState(verified);
      console.log('Phone verification status updated:', verified);
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const sendOTP = async (
    phone: string,
    method: 'whatsapp' | 'sms' = 'whatsapp',
    userId?: string
  ): Promise<{ success: boolean; message?: string; method?: string }> => {
    try {
      console.log('📱 Sending OTP to:', phone, 'via', method, 'userId:', userId, 'Mode:', IS_PRODUCTION_MODE ? 'Production' : 'Test');

      // Normalize phone number (ensure it starts with +)
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      const requestBody = {
        action: 'send',
        phoneNumber: normalizedPhone,
        method,
        userId,
      };

      console.log('📤 Request body:', requestBody);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp-twilio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('📥 Response:', { status: response.status, data });

      if (!response.ok || !data.success) {
        console.error('❌ Error sending OTP:', data.error);
        return {
          success: false,
          message: data.error || 'Erreur lors de l\'envoi du code OTP',
        };
      }

      console.log('✅ OTP sent successfully via', data.method);
      return {
        success: true,
        message: data.message,
        method: data.method,
      };
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      return {
        success: false,
        message: 'Erreur de connexion. Veuillez réessayer.',
      };
    }
  };

  const verifyPhone = async (
    phone: string,
    otp: string,
    userId?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🔍 Verifying OTP for phone:', phone, 'userId:', userId, 'Mode:', IS_PRODUCTION_MODE ? 'Production' : 'Test');

      // Normalize phone number
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      const requestBody = {
        action: 'verify',
        phoneNumber: normalizedPhone,
        otpCode: otp,
        userId,
      };

      console.log('📤 Verify request body:', { ...requestBody, otpCode: '******' });

      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp-twilio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('📥 Verify response:', { status: response.status, data });

      if (!response.ok || !data.success) {
        console.error('❌ Error verifying OTP:', data.error);
        return {
          success: false,
          message: data.error || 'Code OTP incorrect',
        };
      }

      // Store verification status locally
      await AsyncStorage.setItem(OTP_STORAGE_KEY, 'true');
      await AsyncStorage.setItem(PHONE_STORAGE_KEY, normalizedPhone);
      setIsPhoneVerifiedState(true);
      setPhoneNumber(normalizedPhone);

      console.log('✅ Phone verified successfully');
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      return {
        success: false,
        message: 'Erreur de connexion. Veuillez réessayer.',
      };
    }
  };

  return (
    <OTPContext.Provider
      value={{
        isPhoneVerified,
        phoneNumber,
        verifyPhone,
        sendOTP,
        setPhoneVerified,
        loadVerificationStatus,
        isProductionMode: IS_PRODUCTION_MODE,
      }}
    >
      {children}
    </OTPContext.Provider>
  );
}

export function useOTP() {
  const context = useContext(OTPContext);
  if (context === undefined) {
    throw new Error('useOTP must be used within an OTPProvider');
  }
  return context;
}
