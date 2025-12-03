
/**
 * Navigation Configuration
 * Centralized navigation structure for Yombal Yoon
 * Ensures identical navigation across Web, iOS, and Android
 */

import { Href } from 'expo-router';

export interface NavigationTab {
  /**
   * Unique identifier for the tab
   */
  id: string;
  
  /**
   * Display name (must be identical across platforms)
   */
  label: string;
  
  /**
   * Route path
   */
  route: Href;
  
  /**
   * Icon name (Material Icons for Android, SF Symbols for iOS)
   */
  icon: {
    ios: string;
    android: string;
  };
  
  /**
   * Screen title (header)
   */
  screenTitle: string;
}

/**
 * Main navigation tabs for Yombal Yoon
 * DO NOT modify order or labels without updating all platforms
 * 
 * NOTE: 'Envoi de colis' module has been disabled
 */
export const NAVIGATION_TABS: NavigationTab[] = [
  {
    id: 'home',
    label: 'ACCUEIL',
    route: '/(tabs)/(home)/',
    icon: {
      ios: 'house.fill',
      android: 'home',
    },
    screenTitle: 'ACCUEIL',
  },
  {
    id: 'covoiturage',
    label: 'COVOITURAGE',
    route: '/(tabs)/covoiturage',
    icon: {
      ios: 'car.fill',
      android: 'directions-car',
    },
    screenTitle: 'COVOITURAGE',
  },
  // DISABLED: Envoi de colis module
  // {
  //   id: 'colis',
  //   label: 'COLIS',
  //   route: '/(tabs)/colis',
  //   icon: {
  //     ios: 'shippingbox.fill',
  //     android: 'local-shipping',
  //   },
  //   screenTitle: 'ENVOI DE COLIS',
  // },
  {
    id: 'livraison',
    label: 'COLIS REGIONS',
    route: '/(tabs)/livraison',
    icon: {
      ios: 'bolt.fill',
      android: 'flash-on',
    },
    screenTitle: 'COLIS REGIONS',
  },
  {
    id: 'profile',
    label: 'PROFIL',
    route: '/(tabs)/profile',
    icon: {
      ios: 'person.fill',
      android: 'person',
    },
    screenTitle: 'MON PROFIL',
  },
];

/**
 * Get tab by ID
 */
export const getTabById = (id: string): NavigationTab | undefined => {
  return NAVIGATION_TABS.find(tab => tab.id === id);
};

/**
 * Get tab by route
 */
export const getTabByRoute = (route: string): NavigationTab | undefined => {
  return NAVIGATION_TABS.find(tab => tab.route === route);
};

/**
 * Navigation configuration for FloatingTabBar
 */
export const getTabBarConfig = () => {
  return NAVIGATION_TABS.map(tab => ({
    name: tab.id,
    route: tab.route,
    icon: tab.icon.android, // Material Icons name
    label: tab.label,
  }));
};
