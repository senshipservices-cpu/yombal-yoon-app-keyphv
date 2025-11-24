
/**
 * Application Configuration
 * Centralized configuration for modules, features, and business logic
 * 
 * IMPORTANT: This is the single source of truth for app configuration.
 * All platforms (Web, iOS, Android) must use this configuration.
 * DO NOT create platform-specific logic that differs from this config.
 */

/**
 * Module Configuration
 * Defines which modules are active and their parameters
 */
export const MODULE_CONFIG = {
  covoiturage: {
    enabled: true,
    name: 'Covoiturage',
    description: 'Partagez vos trajets',
    icon: {
      ios: 'car.fill',
      android: 'directions-car',
    },
    settings: {
      maxSeats: 8,
      minSeats: 1,
      maxDistanceKm: 1000,
      minPricePerSeat: 500, // FCFA
      maxPricePerSeat: 50000, // FCFA
      allowStops: true,
      requirePhoneVerification: false, // Set to true in production
    },
  },
  
  colis: {
    enabled: true,
    name: 'Envoi de Colis',
    description: 'Envoyez vos colis rapidement',
    icon: {
      ios: 'shippingbox.fill',
      android: 'local-shipping',
    },
    settings: {
      maxDistanceKm: 100,
      minPrice: 1000, // FCFA
      maxPrice: 100000, // FCFA
      pricePerKm: 200, // FCFA per km
      basePrice: 1000, // FCFA
      requirePhoneVerification: false, // Set to true in production
      allowDriverSelection: true,
    },
  },
  
  livraisonExpress: {
    enabled: true,
    name: 'Livraison Express',
    description: 'Livraison rapide en ville',
    icon: {
      ios: 'bolt.fill',
      android: 'flash-on',
    },
    settings: {
      maxDistanceKm: 50,
      estimatedDeliveryMinutes: 30,
      pricePerKm: 300, // FCFA per km
      basePrice: 1500, // FCFA
    },
  },
  
  livraison14Regions: {
    enabled: true,
    name: 'Livraison 14 Régions',
    description: 'Livraison inter-régions',
    icon: {
      ios: 'map.fill',
      android: 'map',
    },
    settings: {
      regions: [
        'Dakar',
        'Thiès',
        'Diourbel',
        'Fatick',
        'Kaolack',
        'Kaffrine',
        'Kolda',
        'Louga',
        'Matam',
        'Saint-Louis',
        'Sédhiou',
        'Tambacounda',
        'Kédougou',
        'Ziguinchor',
      ],
      basePricePerRegion: 5000, // FCFA
      estimatedDeliveryDays: 2,
    },
  },
  
  wallet: {
    enabled: true,
    name: 'Wallet Yombal Yoon',
    description: 'Gérez vos paiements',
    icon: {
      ios: 'creditcard.fill',
      android: 'account-balance-wallet',
    },
    settings: {
      minRechargeAmount: 1000, // FCFA
      maxRechargeAmount: 500000, // FCFA
      minWithdrawalAmount: 5000, // FCFA
      maxWithdrawalAmount: 1000000, // FCFA
      withdrawalMethods: ['wave', 'orange_money'],
      rechargeMethods: ['wave', 'orange_money', 'carte_bancaire'],
    },
  },
} as const;

/**
 * Commission Configuration
 * Defines commission rates for different services
 * 
 * IMPORTANT: These rates are controlled by IS_TEST_MODE in config/testMode.ts
 * In test mode, commissions are 0%. In production, these rates apply.
 */
export const COMMISSION_CONFIG = {
  covoiturage: {
    rate: 0.12, // 12%
    description: 'Commission sur les trajets de covoiturage',
  },
  colis: {
    rate: 0.15, // 15%
    description: 'Commission sur les livraisons de colis',
  },
  livraisonExpress: {
    rate: 0.15, // 15%
    description: 'Commission sur les livraisons express',
  },
  livraison14Regions: {
    rate: 0.10, // 10%
    description: 'Commission sur les livraisons inter-régions',
  },
} as const;

/**
 * Payment Configuration
 * Defines available payment methods and their settings
 */
export const PAYMENT_CONFIG = {
  methods: {
    wave: {
      enabled: true,
      name: 'Wave',
      icon: '📱',
      minAmount: 100,
      maxAmount: 1000000,
    },
    orange_money: {
      enabled: true,
      name: 'Orange Money',
      icon: '🟠',
      minAmount: 100,
      maxAmount: 1000000,
    },
    especes: {
      enabled: true,
      name: 'Espèces',
      icon: '💵',
      minAmount: 0,
      maxAmount: 1000000,
    },
    wallet: {
      enabled: true,
      name: 'Wallet Yombal Yoon',
      icon: '💳',
      minAmount: 0,
      maxAmount: 1000000,
    },
    carte_bancaire: {
      enabled: false, // Not yet implemented
      name: 'Carte Bancaire',
      icon: '💳',
      minAmount: 1000,
      maxAmount: 5000000,
    },
  },
} as const;

/**
 * Feature Flags
 * Enable/disable specific features across all platforms
 */
export const FEATURE_FLAGS = {
  // Authentication & Security
  requirePhoneVerification: false, // Set to true in production
  enableOTP: false, // Set to true when OTP is ready
  enableBiometrics: false, // Future feature
  
  // Notifications
  enablePushNotifications: true,
  enableEmailNotifications: false,
  enableSMSNotifications: false,
  
  // Social Features
  enableRatings: true,
  enableReviews: true,
  enableChat: false, // Future feature
  
  // Payment Features
  enableWalletRecharge: true,
  enableWalletWithdrawal: true,
  enableAutoPayment: false, // Future feature
  
  // Admin Features
  enableAdminPanel: true,
  enableAnalytics: true,
  enableDebugMode: true, // Set to false in production
  
  // Experimental Features
  enableRealTimeTracking: false, // Future feature
  enableScheduledRides: true,
  enableRecurringRides: false, // Future feature
} as const;

/**
 * App Limits & Thresholds
 * Define limits for various operations
 */
export const APP_LIMITS = {
  // User limits
  maxActiveRides: 5,
  maxActiveParcels: 10,
  maxPendingBookings: 20,
  
  // Search limits
  searchResultsLimit: 50,
  searchRadiusKm: 100,
  
  // Time limits
  rideBookingTimeoutMinutes: 30,
  parcelAssignmentTimeoutMinutes: 15,
  paymentTimeoutMinutes: 60,
  
  // File limits
  maxImageSizeMB: 5,
  maxImagesPerUpload: 5,
  
  // Text limits
  maxDescriptionLength: 500,
  maxMessageLength: 1000,
  maxNameLength: 100,
} as const;

/**
 * API Configuration
 * Defines API endpoints and settings
 */
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  
  // Google Maps API
  googleMaps: {
    autocompleteMinChars: 3,
    autocompleteDebounceMs: 300,
    defaultCountry: 'SN', // Senegal
    defaultLanguage: 'fr',
  },
  
  // Supabase
  supabase: {
    realtimeEnabled: true,
    realtimeChannels: ['parcels', 'carpool_rides', 'notifications'],
  },
} as const;

/**
 * UI Configuration
 * Defines UI behavior and settings
 */
export const UI_CONFIG = {
  // Toast/Notification duration
  toastDuration: 3000, // 3 seconds
  errorToastDuration: 5000, // 5 seconds
  successToastDuration: 2000, // 2 seconds
  
  // Loading states
  minLoadingDuration: 500, // Minimum time to show loading spinner
  skeletonAnimationDuration: 1500,
  
  // Animations
  defaultAnimationDuration: 300,
  pageTransitionDuration: 250,
  
  // Refresh
  pullToRefreshEnabled: true,
  autoRefreshInterval: 30000, // 30 seconds
  
  // Map
  defaultMapZoom: 13,
  defaultMapCenter: {
    lat: 14.6928, // Dakar
    lng: -17.4467,
  },
} as const;

/**
 * Contact & Support Configuration
 */
export const CONTACT_CONFIG = {
  supportPhone: '+221 XX XXX XX XX',
  supportEmail: 'support@yombalyoon.sn',
  supportWhatsApp: '+221 XX XXX XX XX',
  
  socialMedia: {
    facebook: 'https://facebook.com/yombalyoon',
    twitter: 'https://twitter.com/yombalyoon',
    instagram: 'https://instagram.com/yombalyoon',
  },
  
  businessHours: {
    weekdays: '8h00 - 20h00',
    weekends: '9h00 - 18h00',
  },
} as const;

/**
 * Helper Functions
 */

/**
 * Check if a module is enabled
 */
export function isModuleEnabled(moduleKey: keyof typeof MODULE_CONFIG): boolean {
  return MODULE_CONFIG[moduleKey]?.enabled ?? false;
}

/**
 * Get module configuration
 */
export function getModuleConfig<K extends keyof typeof MODULE_CONFIG>(
  moduleKey: K
): typeof MODULE_CONFIG[K] | null {
  return MODULE_CONFIG[moduleKey] ?? null;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureKey: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[featureKey] ?? false;
}

/**
 * Get commission rate for a service
 */
export function getCommissionRate(serviceKey: keyof typeof COMMISSION_CONFIG): number {
  return COMMISSION_CONFIG[serviceKey]?.rate ?? 0;
}

/**
 * Get payment method configuration
 */
export function getPaymentMethod(methodKey: keyof typeof PAYMENT_CONFIG.methods) {
  return PAYMENT_CONFIG.methods[methodKey] ?? null;
}

/**
 * Validate configuration on app start
 * This ensures all required config values are present
 */
export function validateAppConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check that at least one module is enabled
  const enabledModules = Object.values(MODULE_CONFIG).filter(m => m.enabled);
  if (enabledModules.length === 0) {
    errors.push('At least one module must be enabled');
  }
  
  // Check commission rates are valid
  Object.entries(COMMISSION_CONFIG).forEach(([key, config]) => {
    if (config.rate < 0 || config.rate > 1) {
      errors.push(`Invalid commission rate for ${key}: ${config.rate}`);
    }
  });
  
  // Check payment methods
  const enabledPaymentMethods = Object.values(PAYMENT_CONFIG.methods).filter(m => m.enabled);
  if (enabledPaymentMethods.length === 0) {
    errors.push('At least one payment method must be enabled');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Log configuration validation on module load
if (__DEV__) {
  const validation = validateAppConfig();
  if (!validation.valid) {
    console.error('❌ App configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log('✅ App configuration validated successfully');
  }
}
