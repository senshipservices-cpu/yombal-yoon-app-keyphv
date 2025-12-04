
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useCovoiturage } from '@/contexts/CovoiturageContext';

export default function RateTripScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { reservationId, isDriver } = params;
  const { reservations, rides, submitRating } = useCovoiturage();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reservation = reservations.find(r => r.id === reservationId);
  const ride = reservation ? rides.find(r => r.id === reservation.rideId) : null;

  const isDriverRating = isDriver === 'true';

  useEffect(() => {
    if (!reservation || !ride) {
      if (Platform.OS === 'web') {
        window.alert('Réservation introuvable');
      } else {
        Alert.alert('Erreur', 'Réservation introuvable');
      }
      router.back();
    }
  }, [reservation, ride, router]);

  const handleSubmit = async () => {
    if (rating === 0) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez sélectionner une note');
      } else {
        Alert.alert('Erreur', 'Veuillez sélectionner une note');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitRating(
        reservationId as string,
        rating,
        comment,
        isDriverRating
      );

      setIsSubmitting(false);

      if (result.success) {
        if (Platform.OS === 'web') {
          window.alert('Merci pour votre évaluation !');
        } else {
          Alert.alert('Succès', 'Merci pour votre évaluation !');
        }
        router.back();
      } else {
        if (Platform.OS === 'web') {
          window.alert(result.message || 'Erreur lors de l\'envoi de la notation');
        } else {
          Alert.alert('Erreur', result.message || 'Erreur lors de l\'envoi de la notation');
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setIsSubmitting(false);
      if (Platform.OS === 'web') {
        window.alert('Une erreur est survenue');
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue');
      }
    }
  };

  if (!reservation || !ride) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>
            {isDriverRating ? 'Noter les passagers' : 'Noter le conducteur'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {ride.departureCity} → {ride.arrivalCity}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Trip Info */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Informations du trajet
            </Text>
            <View style={styles.tripInfo}>
              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                  {new Date(ride.date).toLocaleDateString('fr-FR')} à {ride.time}
                </Text>
              </View>
              {isDriverRating ? (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="person.fill"
                    android_material_icon_name="person"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    {reservation.passengerName} ({reservation.numberOfPassengers} place(s))
                  </Text>
                </View>
              ) : (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="car.fill"
                    android_material_icon_name="directions-car"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
                    Conducteur : {ride.driverName}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Rating */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Votre note
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  style={styles.starButton}
                >
                  <IconSymbol
                    ios_icon_name={rating >= star ? 'star.fill' : 'star'}
                    android_material_icon_name={rating >= star ? 'star' : 'star-border'}
                    size={48}
                    color={rating >= star ? '#FFD700' : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.ratingText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              {rating === 0 && 'Sélectionnez une note'}
              {rating === 1 && 'Très mauvais'}
              {rating === 2 && 'Mauvais'}
              {rating === 3 && 'Moyen'}
              {rating === 4 && 'Bon'}
              {rating === 5 && 'Excellent'}
            </Text>
          </View>

          {/* Comment */}
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.cardTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Commentaire (optionnel)
            </Text>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: isDark ? colors.darkBackground : colors.background,
                  color: isDark ? colors.darkText : colors.text,
                  borderColor: isDark ? colors.darkBorder : colors.border,
                },
              ]}
              placeholder="Partagez votre expérience..."
              placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: rating > 0 ? colors.primary : colors.textSecondary,
                opacity: isSubmitting ? 0.5 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Envoyer l'évaluation</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        </View>
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
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  tripInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
