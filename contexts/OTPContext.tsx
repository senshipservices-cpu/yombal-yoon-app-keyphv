
import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OTPContextType {
  isPhoneVerified: boolean;
  phoneNumber: string;
  verifyPhone: (phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  sendOTP: (phone: string) => Promise<{ success: boolean; message?: string }>;
  setPhoneVerified: (verified: boolean) => Promise<void>;
  loadVerificationStatus: () => Promise<void>;
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

  const sendOTP = async (phone: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('Sending OTP to:', phone);

      // In a real implementation, this would call a backend service
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate OTP: 123456
      console.log('OTP sent successfully (demo mode)');
      return {
        success: true,
        message: 'Code OTP envoyé par SMS. Utilisez 123456 pour la démo.',
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi du code OTP',
      };
    }
  };

  const verifyPhone = async (phone: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('Verifying OTP for phone:', phone, 'OTP:', otp);

      // In a real implementation, this would verify with backend
      // For demo purposes, accept 123456 as valid OTP
      if (otp === '123456') {
        await AsyncStorage.setItem(OTP_STORAGE_KEY, 'true');
        await AsyncStorage.setItem(PHONE_STORAGE_KEY, phone);
        setIsPhoneVerifiedState(true);
        setPhoneNumber(phone);
        console.log('Phone verified successfully');
        return {
          success: true,
          message: 'Numéro vérifié avec succès !',
        };
      } else {
        return {
          success: false,
          message: 'Code OTP incorrect. Utilisez 123456 pour la démo.',
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Erreur lors de la vérification',
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
