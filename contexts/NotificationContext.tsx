
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { 
  setupNotificationChannels, 
  requestNotificationPermissions,
  sendPushNotification,
} from '@/utils/notificationSetup';

// Configure notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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
  sendLocalNotification: (title: string, body: string, data?: any, channelId?: string) => Promise<void>;
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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadData = useCallback(async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
        console.log('📱 Notifications loaded from storage');
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const navigateToParcelDetail = useCallback((parcelId: string, assignmentId: string) => {
    console.log('🚀 Navigating to driver parcel detail:', parcelId, assignmentId);
    try {
      router.push({
        pathname: '/colis/driver-parcel-detail',
        params: {
          parcelId,
          assignmentId,
        },
      });
    } catch (error) {
      console.error('❌ Error navigating to parcel detail:', error);
    }
  }, [router]);

  const setupNotificationListeners = useCallback(() => {
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
          AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        // Trigger haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        // Auto-navigate for parcel assignments
        const data = notification.request.content.data;
        if (data?.type === 'parcel_assignment' && data?.parcelId && data?.assignmentId) {
          console.log('🚀 Auto-navigating to parcel detail (foreground)');
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
        } else if (
          (data?.type === 'reservation_accepted' || 
           data?.type === 'reservation_refused' || 
           data?.type === 'ride_cancelled') && 
          data?.reservationId
        ) {
          router.push('/covoiturage/my-reservations');
        }
      });

      console.log('✅ Notification listeners configured');
    } catch (error) {
      console.error('❌ Error setting up notification listeners:', error);
    }
  }, [navigateToParcelDetail, router]);

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
  }, [loadData, setupNotificationListeners]);

  const registerForPushNotifications = async (userId: string = 'current_user', roles: string[] = []) => {
    try {
      console.log('🔔 Registering for push notifications...');
      
      // Request permissions and setup channels
      const granted = await requestNotificationPermissions();
      setHasPermission(granted);

      if (!granted) {
        console.log('❌ Push notification permissions not granted');
        return;
      }

      console.log('✅ Push notification permissions granted');

      // Generate a mock token for demo purposes
      // In production, you would get the actual Expo push token
      const token = `expo_token_${Platform.OS}_${userId}_${Date.now()}`;
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

      console.log('✅ Device token registered:', token, 'Roles:', roles);
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      setHasPermission(false);
    }
  };

  const sendLocalNotification = async (
    title: string, 
    body: string, 
    data?: any,
    channelId: string = 'covoiturage-general'
  ) => {
    try {
      if (!hasPermission) {
        console.log('⚠️ Cannot send notification: permission not granted');
        // Try to request permissions again
        const granted = await requestNotificationPermissions();
        if (!granted) {
          console.log('❌ Still no permission after retry');
          return;
        }
        setHasPermission(true);
      }

      console.log('📤 Sending local notification:', { title, body, channelId });

      // Use the enhanced sendPushNotification function
      await sendPushNotification(title, body, data, channelId);

      console.log('✅ Local notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      await Notifications.dismissAllNotificationsAsync();
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
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
