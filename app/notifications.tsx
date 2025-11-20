
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { notifications, markNotificationAsRead, markAllAsRead, clearAllNotifications } = useNotifications();

  const handleNotificationPress = async (notification: any) => {
    // Mark as read
    await markNotificationAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === 'parcel_assignment' && notification.data?.parcelId && notification.data?.assignmentId) {
      router.push({
        pathname: '/colis/driver-parcel-detail',
        params: {
          parcelId: notification.data.parcelId,
          assignmentId: notification.data.assignmentId,
        },
      });
    } else if (notification.type === 'reservation_created' && notification.data?.rideId) {
      router.push({
        pathname: '/covoiturage/my-rides',
        params: {
          rideId: notification.data.rideId,
        },
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'parcel_assignment':
      case 'parcel_accepted':
      case 'parcel_picked_up':
      case 'parcel_delivered':
        return {
          ios: 'shippingbox.fill',
          android: 'local-shipping',
          color: colors.accent,
        };
      case 'reservation_created':
      case 'reservation_accepted':
      case 'reservation_refused':
        return {
          ios: 'car.fill',
          android: 'directions-car',
          color: colors.primary,
        };
      case 'parcel_already_taken':
        return {
          ios: 'exclamationmark.triangle.fill',
          android: 'warning',
          color: colors.warning,
        };
      default:
        return {
          ios: 'bell.fill',
          android: 'notifications',
          color: colors.textSecondary,
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Action Buttons */}
          {notifications.length > 0 && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={markAllAsRead}
              >
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.actionButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                  Tout marquer comme lu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={clearAllNotifications}
              >
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.error}
                />
                <Text style={[styles.actionButtonText, { color: isDark ? colors.darkText : colors.text }]}>
                  Tout effacer
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="bell.slash.fill"
                android_material_icon_name="notifications-off"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
                Aucune notification
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Vous recevrez des notifications pour vos trajets et colis.
              </Text>
            </View>
          ) : (
            notifications.map((notification) => {
              const icon = getNotificationIcon(notification.type);
              
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    { backgroundColor: isDark ? colors.darkCard : colors.card },
                    !notification.read && styles.unreadCard,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={styles.notificationHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                      <IconSymbol
                        ios_icon_name={icon.ios}
                        android_material_icon_name={icon.android}
                        size={24}
                        color={icon.color}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationTitle, { color: isDark ? colors.darkText : colors.text }]}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.notificationBody, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {notification.body}
                      </Text>
                      <Text style={[styles.notificationTime, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {formatTimeAgo(notification.createdAt)}
                      </Text>
                    </View>
                    {!notification.read && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
  },
  headerBackButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  unreadCard: {
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  notificationHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
});
