
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { supabase } from "@/app/integrations/supabase/client";

type FeedbackType = 'suggestion' | 'bug' | 'other';

export default function FeedbackScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackOptions = [
    {
      id: 'suggestion' as FeedbackType,
      label: 'Suggestion',
      icon: { ios: 'lightbulb.fill', android: 'lightbulb' },
      color: colors.primary,
    },
    {
      id: 'bug' as FeedbackType,
      label: 'Bug / Problème',
      icon: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
      color: colors.accent,
    },
    {
      id: 'other' as FeedbackType,
      label: 'Autre',
      icon: { ios: 'ellipsis.circle.fill', android: 'more-horiz' },
      color: colors.secondary,
    },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!message.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un message");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          type: feedbackType,
          message: message.trim(),
          contact: contact.trim() || null,
          source: 'app_mobile',
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        Alert.alert(
          "Erreur",
          "❌ Votre avis n'a pas pu être envoyé. Vérifiez votre connexion internet et réessayez."
        );
      } else {
        console.log('Feedback submitted successfully');
        Alert.alert(
          "Succès",
          "✅ Merci ! Votre avis a été envoyé à l'équipe Yombal Yoon.",
          [
            {
              text: "OK",
              onPress: () => {
                // Clear form
                setMessage('');
                setContact('');
                setFeedbackType('suggestion');
                // Go back to profile
                router.back();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Exception submitting feedback:', error);
      Alert.alert(
        "Erreur",
        "❌ Votre avis n'a pas pu être envoyé. Vérifiez votre connexion internet et réessayez."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={isDark ? colors.darkText : colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Donner mon avis
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Description */}
        <View style={[styles.descriptionCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <IconSymbol
            ios_icon_name="bubble.left.and.bubble.right.fill"
            android_material_icon_name="chat"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.descriptionText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Votre avis est important pour nous ! Partagez vos suggestions, signalez un problème ou posez une question.
          </Text>
        </View>

        {/* Feedback Type Selection */}
        <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Type de message
          </Text>

          <View style={styles.feedbackTypeContainer}>
            {feedbackOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.feedbackTypeOption,
                  feedbackType === option.id && styles.feedbackTypeOptionSelected,
                  { 
                    backgroundColor: isDark ? colors.darkBackground : colors.background,
                    borderColor: feedbackType === option.id ? option.color : colors.border,
                  },
                ]}
                onPress={() => setFeedbackType(option.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.feedbackTypeIconContainer, { backgroundColor: option.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={option.icon.ios}
                    android_material_icon_name={option.icon.android}
                    size={24}
                    color={option.color}
                  />
                </View>
                <Text style={[
                  styles.feedbackTypeText,
                  { color: isDark ? colors.darkText : colors.text },
                  feedbackType === option.id && styles.feedbackTypeTextSelected,
                ]}>
                  {option.label}
                </Text>
                {feedbackType === option.id && (
                  <View style={[styles.checkmark, { backgroundColor: option.color }]}>
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={14}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message Input */}
        <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Votre message *
          </Text>
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: isDark ? colors.darkBackground : colors.background,
                color: isDark ? colors.darkText : colors.text,
                borderColor: isDark ? colors.darkTextSecondary + '30' : colors.border,
              },
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder="Décrivez votre suggestion, problème ou question..."
            placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Contact Input */}
        <View style={[styles.formCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Téléphone ou email (optionnel)
          </Text>
          <Text style={[styles.sectionDescription, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Si vous souhaitez être contacté pour un suivi
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.darkBackground : colors.background,
                color: isDark ? colors.darkText : colors.text,
                borderColor: isDark ? colors.darkTextSecondary + '30' : colors.border,
              },
            ]}
            value={contact}
            onChangeText={setContact}
            placeholder="+221 XX XXX XX XX ou email@exemple.com"
            placeholderTextColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
            keyboardType="default"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            isSubmitting && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="paperplane.fill"
                android_material_icon_name="send"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.submitButtonText}>Envoyer mon avis</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>
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
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  descriptionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  feedbackTypeContainer: {
    gap: 10,
  },
  feedbackTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    gap: 12,
  },
  feedbackTypeOptionSelected: {
    borderWidth: 2,
    boxShadow: '0px 3px 10px rgba(0, 128, 0, 0.2)',
    elevation: 4,
  },
  feedbackTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTypeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  feedbackTypeTextSelected: {
    fontWeight: '700',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
