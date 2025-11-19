
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useNotifications } from '@/contexts/NotificationContext';
import EmptyState from '@/components/EmptyState';

export default function NotificationsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { notifications, markNotificationAsRead, markAllAsRead, clearAllNotifications } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation_created':
      case 'reservation_accepted':
      case 'reservation_refused':
      case 'ride_cancelled':
        return { ios: 'car.fill', android: 'directions-car' };
      case 'parcel_assignment':
      case 'parcel_accepted':
      case 'parcel_picked_up':
      case 'parcel_delivered':
      case 'parcel_already_taken':
        return { ios: 'shippingbox.fill', android: 'local-shipping' };
      default:
        return { ios: 'bell.fill', android: 'notifications' };
    }
  };

  const getNotificationColor = (type: string) => {
    if (type.includes('parcel') || type.includes('colis')) {
      return colors.accent;
    }
    if (type.includes('reservation') || type.includes('ride')) {
      return '#FF8C00';
    }
    return colors.primary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>{notifications.length} notification(s)</Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.headerAction}>
            <IconSymbol
              ios_icon_name="checkmark.circle"
              android_material_icon_name="check-circle"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {notifications.length === 0 ? (
            <EmptyState
              icon={{ ios: 'bell', android: 'notifications' }}
              title="Aucune notification"
              message="Vous n'avez pas encore reçu de notifications. Vous serez notifié des événements importants ici."
            />
          ) : (
            <React.Fragment>
              {notifications.map((notification, index) => {
                const icon = getNotificationIcon(notification.type);
                const color = getNotificationColor(notification.type);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.notificationCard,
                      { backgroundColor: isDark ? colors.darkCard : colors.card },
                      !notification.read && styles.unreadCard,
                    ]}
                    onPress={() => markNotificationAsRead(notification.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                      <IconSymbol
                        ios_icon_name={icon.ios}
                        android_material_icon_name={icon.android}
                        size={24}
                        color={color}
                      />
                    </View>

                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={[styles.notificationTitle, { color: isDark ? colors.darkText : colors.text }]}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
                        )}
                      </View>

                      <Text style={[styles.notificationBody, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {notification.body}
                      </Text>

                      <Text style={[styles.notificationTime, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                onPress={clearAllNotifications}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="trash"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.accent}
                />
                <Text style={[styles.clearButtonText, { color: colors.accent }]}>
                  Effacer toutes les notifications
                </Text>
              </TouchableOpacity>
            </React.Fragment>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 68 : 60,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
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
  headerAction: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    gap: 12,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
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
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
