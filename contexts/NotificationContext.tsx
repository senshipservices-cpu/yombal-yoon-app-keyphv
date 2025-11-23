
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Only set notification handler on native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export interface DeviceToken {
  userId: string;
  token: string;
  platform: string;
  roles: string[];
  createdAt: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 
    | 'reservation_created' 
    | 'reservation_accepted' 
    | 'reservation_refused' 
    | 'ride_cancelled'
    | 'parcel_assignment'
    | 'parcel_accepted'
    | 'parcel_picked_up'
    | 'parcel_delivered'
    | 'parcel_already_taken';
  title: string;
  body: string;
  data?: any;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  deviceToken: string | null;
  notifications: NotificationData[];
  unreadCount: number;
  registerForPushNotifications: (userId?: string, roles?: string[]) => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  isLoading: boolean;
  hasPermission: boolean;
  navigateToParcelDetail: (parcelId: string, assignmentId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEVICE_TOKENS_STORAGE_KEY = '@yombal_yoon_device_tokens';
const NOTIFICATIONS_STORAGE_KEY = '@yombal_yoon_notifications';

// Platform-aware storage helper
const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }
  return AsyncStorage.getItem(key);
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    return;
  }
  return AsyncStorage.setItem(key, value);
};

const removeStorageItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    return;
  }
  return AsyncStorage.removeItem(key);
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();

  useEffect(() => {
    loadData();
    
    // Only setup notification listeners on native platforms
    if (Platform.OS !== 'web') {
      setupNotificationListeners();
    } else {
      console.log('Push notifications not supported on web platform');
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadData = async () => {
    try {
      const storedNotifications = await getStorageItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
        console.log('Notifications loaded from storage');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToParcelDetail = (parcelId: string, assignmentId: string) => {
    console.log('Navigating to driver parcel detail:', parcelId, assignmentId);
    try {
      router.push({
        pathname: '/colis/driver-parcel-detail',
        params: {
          parcelId,
          assignmentId,
        },
      });
    } catch (error) {
      console.error('Error navigating to parcel detail:', error);
    }
  };

  const setupNotificationListeners = () => {
    try {
      // Listener for notifications received while app is in foreground
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('📱 Notification received (foreground):', notification);
        
        const newNotification: NotificationData = {
          id: notification.request.identifier,
          userId: 'current_user',
          type: notification.request.content.data?.type || 'reservation_created',
          title: notification.request.content.title || '',
          body: notification.request.content.body || '',
          data: notification.request.content.data,
          createdAt: new Date().toISOString(),
          read: false,
        };

        // Save notification to history
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          setStorageItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        // Trigger haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        // If it's a parcel assignment notification, navigate directly to detail screen
        const data = notification.request.content.data;
        if (data?.type === 'parcel_assignment' && data?.parcelId && data?.assignmentId) {
          console.log('🚀 Auto-navigating to parcel detail (foreground)');
          // Small delay to ensure the notification is processed
          setTimeout(() => {
            navigateToParcelDetail(data.parcelId, data.assignmentId);
          }, 500);
        }
      });

      // Listener for when user taps on a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response);
        
        // Trigger haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Handle notification tap - navigate to appropriate screen
        const data = response.notification.request.content.data;
        
        if (data?.type === 'parcel_assignment' && data?.parcelId && data?.assignmentId) {
          console.log('🚀 Navigating to parcel detail from notification tap');
          navigateToParcelDetail(data.parcelId, data.assignmentId);
        } else if (data?.type === 'reservation_created' && data?.rideId) {
          router.push({
            pathname: '/covoiturage/my-rides',
            params: {
              rideId: data.rideId,
            },
          });
        }
      });
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  };

  const registerForPushNotifications = async (userId: string = 'current_user', roles: string[] = []) => {
    // Skip push notification registration on web
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web platform');
      setHasPermission(false);
      return;
    }

    try {
      // Check if we're on a physical device or emulator
      if (Platform.OS === 'android') {
        // First, set up notification channels before requesting permissions
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Notifications Yombal Yoon',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#008000',
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          });

          await Notifications.setNotificationChannelAsync('covoiturage', {
            name: 'Covoiturage',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF8C00',
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          });

          await Notifications.setNotificationChannelAsync('colis', {
            name: 'Livraison de Colis',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF0000',
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          });

          console.log('✅ Android notification channels created successfully');
        } catch (channelError) {
          console.log('Error creating notification channels (may be expected on emulator):', channelError);
        }
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        setHasPermission(false);
        return;
      }

      setHasPermission(true);
      console.log('✅ Push notification permissions granted');

      // Generate a mock token for demo purposes
      const token = `mock_token_${Platform.OS}_${userId}_${Date.now()}`;
      setDeviceToken(token);

      const deviceTokenData: DeviceToken = {
        userId,
        token,
        platform: Platform.OS,
        roles,
        createdAt: new Date().toISOString(),
      };

      const storedTokens = await getStorageItem(DEVICE_TOKENS_STORAGE_KEY);
      const tokens: DeviceToken[] = storedTokens ? JSON.parse(storedTokens) : [];
      
      const existingTokenIndex = tokens.findIndex(t => t.userId === userId && t.platform === Platform.OS);
      if (existingTokenIndex >= 0) {
        tokens[existingTokenIndex] = deviceTokenData;
      } else {
        tokens.push(deviceTokenData);
      }
      
      await setStorageItem(DEVICE_TOKENS_STORAGE_KEY, JSON.stringify(tokens));

      console.log('✅ Device token registered successfully:', token, 'Roles:', roles);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setHasPermission(false);
      // Don't throw the error, just log it to prevent app crashes
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Local notifications not supported on web platform');
      return;
    }

    try {
      if (!hasPermission) {
        console.log('Cannot send notification: permission not granted');
        return;
      }

      const channelId = data?.type?.includes('parcel') || data?.type?.includes('colis') 
        ? 'colis' 
        : data?.type?.includes('reservation') || data?.type?.includes('ride')
        ? 'covoiturage'
        : 'default';

      console.log('📤 Sending local notification:', title, 'Channel:', channelId);

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          vibrate: [0, 250, 250, 250],
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });

      console.log('✅ Local notification sent:', title);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      await setStorageItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      await setStorageItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await removeStorageItem(NOTIFICATIONS_STORAGE_KEY);
      
      // Only dismiss notifications on native platforms
      if (Platform.OS !== 'web') {
        await Notifications.dismissAllNotificationsAsync();
      }
      
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        deviceToken,
        notifications,
        unreadCount,
        registerForPushNotifications,
        sendLocalNotification,
        markNotificationAsRead,
        markAllAsRead,
        clearAllNotifications,
        isLoading,
        hasPermission,
        navigateToParcelDetail,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
