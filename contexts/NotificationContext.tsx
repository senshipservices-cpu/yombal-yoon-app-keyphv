
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
import { supabase } from '@/config/supabase';

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
const USER_ID_KEY = '@yombal_yoon_user_id';

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
      console.log('========================================');
      console.log('🔔 REGISTERING FOR PUSH NOTIFICATIONS');
      console.log('========================================');
      console.log('📱 Platform:', Platform.OS);
      console.log('👤 User ID:', userId);
      console.log('🎭 Roles:', roles);
      
      // Request permissions and setup channels
      const granted = await requestNotificationPermissions();
      setHasPermission(granted);

      if (!granted) {
        console.log('❌ Push notification permissions not granted');
        return;
      }

      console.log('✅ Push notification permissions granted');

      // Get the actual Expo push token
      let expoPushToken: string | null = null;
      
      if (Platform.OS !== 'web') {
        try {
          console.log('📲 Requesting Expo push token...');
          
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-project-id', // This will be auto-detected from app.json
          });
          
          expoPushToken = tokenData.data;
          console.log('✅ Expo push token obtained:', expoPushToken);
        } catch (tokenError) {
          console.error('❌ Error getting Expo push token:', tokenError);
          console.log('⚠️ Continuing without push token - notifications will be local only');
        }
      } else {
        console.log('⚠️ Web platform - push notifications not supported');
      }

      // Get or create user ID from AsyncStorage
      let actualUserId = userId;
      if (userId === 'current_user') {
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (storedUserId) {
          actualUserId = storedUserId;
          console.log('✅ Retrieved user ID from storage:', actualUserId);
        } else {
          console.log('⚠️ No user ID found in storage, using default');
        }
      }

      // Store token in database if we have a valid Expo token
      if (expoPushToken && actualUserId !== 'current_user') {
        try {
          console.log('💾 Storing push token in database...');
          
          // Check if token already exists for this user and platform
          const { data: existingTokens, error: fetchError } = await supabase
            .from('device_tokens')
            .select('*')
            .eq('user_id', actualUserId)
            .eq('platform', Platform.OS);

          if (fetchError) {
            console.error('❌ Error fetching existing tokens:', fetchError);
          } else if (existingTokens && existingTokens.length > 0) {
            // Update existing token
            const { error: updateError } = await supabase
              .from('device_tokens')
              .update({
                expo_push_token: expoPushToken,
                active: true,
                last_used_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', actualUserId)
              .eq('platform', Platform.OS);

            if (updateError) {
              console.error('❌ Error updating device token:', updateError);
            } else {
              console.log('✅ Device token updated in database');
            }
          } else {
            // Insert new token
            const { error: insertError } = await supabase
              .from('device_tokens')
              .insert({
                user_id: actualUserId,
                expo_push_token: expoPushToken,
                platform: Platform.OS,
                active: true,
                last_used_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error('❌ Error inserting device token:', insertError);
            } else {
              console.log('✅ Device token inserted in database');
            }
          }
        } catch (dbError) {
          console.error('❌ Database error storing token:', dbError);
        }
      }

      // Store token locally for reference
      const token = expoPushToken || `local_token_${Platform.OS}_${actualUserId}_${Date.now()}`;
      setDeviceToken(token);

      const deviceTokenData: DeviceToken = {
        userId: actualUserId,
        token,
        platform: Platform.OS,
        roles,
        createdAt: new Date().toISOString(),
      };

      const storedTokens = await AsyncStorage.getItem(DEVICE_TOKENS_STORAGE_KEY);
      const tokens: DeviceToken[] = storedTokens ? JSON.parse(storedTokens) : [];
      
      const existingTokenIndex = tokens.findIndex(t => t.userId === actualUserId && t.platform === Platform.OS);
      if (existingTokenIndex >= 0) {
        tokens[existingTokenIndex] = deviceTokenData;
      } else {
        tokens.push(deviceTokenData);
      }
      
      await AsyncStorage.setItem(DEVICE_TOKENS_STORAGE_KEY, JSON.stringify(tokens));

      console.log('========================================');
      console.log('✅ PUSH NOTIFICATION REGISTRATION COMPLETE');
      console.log('========================================');
      console.log('🎫 Token:', token);
      console.log('🎭 Roles:', roles);
      console.log('📱 Platform:', Platform.OS);
      console.log('========================================');
    } catch (error) {
      console.error('========================================');
      console.error('❌ ERROR REGISTERING PUSH NOTIFICATIONS');
      console.error('========================================');
      console.error('Error:', error);
      console.error('========================================');
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
