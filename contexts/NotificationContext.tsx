
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEVICE_TOKENS_STORAGE_KEY = '@yombal_yoon_device_tokens';
const NOTIFICATIONS_STORAGE_KEY = '@yombal_yoon_notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    loadData();
    setupNotificationListeners();

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
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
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

  const setupNotificationListeners = () => {
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        
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

        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        
        // Handle notification tap - navigate to appropriate screen
        const data = response.notification.request.content.data;
        
        if (data?.type === 'parcel_assignment' && data?.parcelId && data?.assignmentId) {
          // Navigate to driver parcel detail screen
          console.log('Navigating to driver parcel detail:', data.parcelId);
          // Note: Navigation will be handled by the app's navigation system
          // The router hook is not available in this context
        }
      });
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  };

  const registerForPushNotifications = async (userId: string = 'current_user', roles: string[] = []) => {
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
          });

          await Notifications.setNotificationChannelAsync('covoiturage', {
            name: 'Covoiturage',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF8C00',
          });

          await Notifications.setNotificationChannelAsync('colis', {
            name: 'Livraison de Colis',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF0000',
          });

          console.log('Android notification channels created successfully');
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
      console.log('Push notification permissions granted');

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

      const storedTokens = await AsyncStorage.getItem(DEVICE_TOKENS_STORAGE_KEY);
      const tokens: DeviceToken[] = storedTokens ? JSON.parse(storedTokens) : [];
      
      const existingTokenIndex = tokens.findIndex(t => t.userId === userId && t.platform === Platform.OS);
      if (existingTokenIndex >= 0) {
        tokens[existingTokenIndex] = deviceTokenData;
      } else {
        tokens.push(deviceTokenData);
      }
      
      await AsyncStorage.setItem(DEVICE_TOKENS_STORAGE_KEY, JSON.stringify(tokens));

      console.log('Device token registered successfully:', token, 'Roles:', roles);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setHasPermission(false);
      // Don't throw the error, just log it to prevent app crashes
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
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

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });

      console.log('Local notification sent:', title);
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
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      await Notifications.dismissAllNotificationsAsync();
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
