
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/app/integrations/supabase/client';
import { useTheme } from '@react-navigation/native';

interface AvatarProps {
  url: string | null | undefined;
  size?: number;
  onUpload: (filePath: string) => void;
  editable?: boolean;
}

export default function Avatar({ url, size = 120, onUpload, editable = true }: AvatarProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) {
      downloadImage(url);
    }
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      console.log('Error downloading image: ', error);
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];
      console.log('Got image', image);

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(data.path);
      Alert.alert('Succès', 'Photo de profil mise à jour avec succès !');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors du téléchargement de la photo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={editable ? uploadAvatar : undefined}
        disabled={uploading || !editable}
        activeOpacity={editable ? 0.7 : 1}
        style={[styles.avatarContainer, { width: size, height: size }]}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[styles.avatar, { width: size, height: size }]}
            accessibilityLabel="Avatar"
          />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatar, { width: size, height: size }]}
          >
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={size * 0.5}
              color="#FFFFFF"
            />
          </LinearGradient>
        )}

        {editable && (
          <View style={[styles.cameraButton, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="camera-alt"
                size={20}
                color={colors.primary}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(0, 128, 0, 0.3)',
    elevation: 8,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
});
