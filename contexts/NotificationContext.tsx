
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
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
  createdAt: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'reservation_created' | 'reservation_accepted' | 'reservation_refused' | 'ride_cancelled';
  title: string;
  body: string;
  data?: any;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  deviceToken: string | null;
  notifications: NotificationData[];
  registerForPushNotifications: () => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEVICE_TOKENS_STORAGE_KEY = '@yombal_yoon_device_tokens';
const NOTIFICATIONS_STORAGE_KEY = '@yombal_yoon_notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    // Listen for notifications received while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Add to local notifications list
      const newNotification: NotificationData = {
        id: notification.request.identifier,
        userId: 'current_user', // In production, use actual user ID
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

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle navigation or other actions based on notification data
    });
  };

  const registerForPushNotifications = async () => {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return;
      }

      // Create notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('covoiturage', {
          name: 'Covoiturage',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF8C00',
        });
      }

      // Get device push token (mock for now - in production, use getExpoPushTokenAsync)
      const token = `mock_token_${Platform.OS}_${Date.now()}`;
      setDeviceToken(token);

      // Store device token
      const deviceTokenData: DeviceToken = {
        userId: 'current_user', // In production, use actual user ID
        token,
        platform: Platform.OS,
        createdAt: new Date().toISOString(),
      };

      const storedTokens = await AsyncStorage.getItem(DEVICE_TOKENS_STORAGE_KEY);
      const tokens: DeviceToken[] = storedTokens ? JSON.parse(storedTokens) : [];
      tokens.push(deviceTokenData);
      await AsyncStorage.setItem(DEVICE_TOKENS_STORAGE_KEY, JSON.stringify(tokens));

      console.log('Device token registered:', token);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Immediate notification
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
        registerForPushNotifications,
        sendLocalNotification,
        markNotificationAsRead,
        clearAllNotifications,
        isLoading,
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
