
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RideAlert {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  origin_city: string;
  destination_city: string;
  date_from?: string;
  date_to?: string;
  time_range_start?: string;
  time_range_end?: string;
  max_price?: number;
  min_seats: number;
  accepts_luggage: boolean;
  is_active: boolean;
  created_at: string;
}

const USER_ID_KEY = '@yombal_yoon_user_id';

export default function MyAlertsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;
  
  const [alerts, setAlerts] = useState<RideAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        console.log('No user ID found');
        setAlerts([]);
        return;
      }

      console.log('Loading alerts for user:', userId);

      const { data, error } = await supabase
        .from('ride_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading alerts:', error);
        Alert.alert('Erreur', 'Impossible de charger vos alertes');
        return;
      }

      console.log('Loaded alerts:', data?.length || 0);
      setAlerts(data || []);
    } catch (error) {
      console.error('Error in loadAlerts:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAlerts();
  };

  const handleToggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ride_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) {
        console.error('Error toggling alert:', error);
        Alert.alert('Erreur', 'Impossible de modifier l\'alerte');
        return;
      }

      // Update local state
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_active: !currentStatus } : alert
        )
      );

      Alert.alert(
        'Succès',
        !currentStatus ? 'Alerte activée' : 'Alerte désactivée'
      );
    } catch (error) {
      console.error('Error in handleToggleAlert:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    Alert.alert(
      'Supprimer l\'alerte',
      'Êtes-vous sûr de vouloir supprimer cette alerte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('ride_alerts')
                .delete()
                .eq('id', alertId);

              if (error) {
                console.error('Error deleting alert:', error);
                Alert.alert('Erreur', 'Impossible de supprimer l\'alerte');
                return;
              }

              // Update local state
              setAlerts(prev => prev.filter(alert => alert.id !== alertId));
              Alert.alert('Succès', 'Alerte supprimée');
            } catch (error) {
              console.error('Error in handleDeleteAlert:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          },
        },
      ]
    );
  };

  const handleCreateAlert = () => {
    router.push('/covoiturage/create-alert');
  };

  const formatDateRange = (dateFrom?: string, dateTo?: string) => {
    if (!dateFrom && !dateTo) return 'Toutes les dates';
    if (dateFrom && !dateTo) return `À partir du ${new Date(dateFrom).toLocaleDateString('fr-FR')}`;
    if (!dateFrom && dateTo) return `Jusqu'au ${new Date(dateTo).toLocaleDateString('fr-FR')}`;
    return `${new Date(dateFrom!).toLocaleDateString('fr-FR')} - ${new Date(dateTo!).toLocaleDateString('fr-FR')}`;
  };

  const formatTimeRange = (timeStart?: string, timeEnd?: string) => {
    if (!timeStart && !timeEnd) return 'Toute la journée';
    if (timeStart && !timeEnd) return `À partir de ${timeStart}`;
    if (!timeStart && timeEnd) return `Jusqu'à ${timeEnd}`;
    return `${timeStart} - ${timeEnd}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: isDark ? colors.darkText : colors.text }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Mes Alertes</Text>
          <Text style={styles.headerSubtitle}>
            {alerts.length} alerte{alerts.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.refreshButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Create Alert Button */}
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateAlert}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add-circle"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.createButtonText}>Créer une nouvelle alerte</Text>
        </TouchableOpacity>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <IconSymbol
              ios_icon_name="bell.slash"
              android_material_icon_name="notifications-off"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Aucune alerte
            </Text>
            <Text style={[styles.emptyDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Créez une alerte pour être notifié quand un trajet correspondant est publié
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                { backgroundColor: isDark ? colors.darkCard : colors.card },
                !alert.is_active && styles.inactiveCard,
              ]}
            >
              {/* Alert Header */}
              <View style={styles.alertHeader}>
                <View style={styles.alertRoute}>
                  <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                    {alert.origin_city}
                  </Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                    {alert.destination_city}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: alert.is_active ? colors.primary + '20' : colors.textSecondary + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: alert.is_active ? colors.primary : colors.textSecondary }
                  ]}>
                    {alert.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              {/* Alert Details */}
              <View style={styles.alertDetails}>
                <View style={styles.detailRow}>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="calendar-today"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {formatDateRange(alert.date_from, alert.date_to)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <IconSymbol
                    ios_icon_name="clock"
                    android_material_icon_name="access-time"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {formatTimeRange(alert.time_range_start, alert.time_range_end)}
                  </Text>
                </View>

                {alert.max_price && (
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="creditcard"
                      android_material_icon_name="payments"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                      Max {alert.max_price} FCFA/place
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <IconSymbol
                    ios_icon_name="person.2"
                    android_material_icon_name="people"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Min {alert.min_seats} place{alert.min_seats > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {/* Alert Actions */}
              <View style={styles.alertActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: alert.is_active ? colors.accent + '20' : colors.primary + '20' }]}
                  onPress={() => handleToggleAlert(alert.id, alert.is_active)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name={alert.is_active ? 'pause.circle' : 'play.circle'}
                    android_material_icon_name={alert.is_active ? 'pause-circle' : 'play-circle'}
                    size={20}
                    color={alert.is_active ? colors.accent : colors.primary}
                  />
                  <Text style={[styles.actionButtonText, { color: alert.is_active ? colors.accent : colors.primary }]}>
                    {alert.is_active ? 'Désactiver' : 'Activer'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FF0000' + '20' }]}
                  onPress={() => handleDeleteAlert(alert.id)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={20}
                    color="#FF0000"
                  />
                  <Text style={[styles.actionButtonText, { color: '#FF0000' }]}>
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary + '20',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
