
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';

export default function MyReservationsScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const { getReservationsByPassenger, cancelReservation } = useCovoiturage();

  // For demo purposes, we'll show all reservations. In production, filter by passengerId
  const myReservations = getReservationsByPassenger('passenger_demo');

  const handleCancelReservation = (reservationId: string) => {
    Alert.alert(
      'Annuler la réservation',
      'Voulez-vous vraiment annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            await cancelReservation(reservationId);
            Alert.alert('Succès', 'Réservation annulée.');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return colors.primary;
      case 'refused':
        return colors.accent;
      default:
        return '#FF8C00';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'refused':
        return 'Refusée';
      default:
        return 'En attente';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return { ios: 'checkmark.circle.fill', android: 'check-circle' };
      case 'refused':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      default:
        return { ios: 'clock.fill', android: 'schedule' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Mes réservations</Text>
          <Text style={styles.headerSubtitle}>{myReservations.length} réservation(s)</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {myReservations.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
              <IconSymbol
                ios_icon_name="list.bullet"
                android_material_icon_name="list"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: isDark ? colors.darkText : colors.text }]}>
                Aucune réservation
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                Recherchez un trajet pour commencer
              </Text>
            </View>
          ) : (
            myReservations.map((reservation, index) => {
              const ride = reservation.ride;
              if (!ride) return null;

              const statusIcon = getStatusIcon(reservation.status);

              return (
                <View
                  key={index}
                  style={[styles.reservationCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                >
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
                    <IconSymbol
                      ios_icon_name={statusIcon.ios}
                      android_material_icon_name={statusIcon.android}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.statusText}>{getStatusText(reservation.status)}</Text>
                  </View>

                  {/* Route */}
                  <View style={styles.routeSection}>
                    <View style={styles.routeContainer}>
                      <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                        {ride.departureCity}
                      </Text>
                      <IconSymbol
                        ios_icon_name="arrow.right"
                        android_material_icon_name="arrow-forward"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={[styles.cityText, { color: isDark ? colors.darkText : colors.text }]}>
                        {ride.arrivalCity}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="calendar-today"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {new Date(ride.date).toLocaleDateString('fr-FR')} à {ride.time}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="person.fill"
                        android_material_icon_name="person"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        Conducteur: {ride.driverName}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="person.2.fill"
                        android_material_icon_name="people"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {reservation.numberOfPassengers} passager(s)
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <IconSymbol
                        ios_icon_name="banknote"
                        android_material_icon_name="attach-money"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.detailText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                        {ride.pricePerPassenger * reservation.numberOfPassengers} FCFA
                      </Text>
                    </View>
                  </View>

                  {/* Cancel Button */}
                  {reservation.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.cancelButton, { backgroundColor: colors.accent }]}
                      onPress={() => handleCancelReservation(reservation.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Annuler la réservation</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    padding: 20,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  reservationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  routeSection: {
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsSection: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  cancelButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
