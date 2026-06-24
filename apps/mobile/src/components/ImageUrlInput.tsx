import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nProvider';
import { ImagePickCancelled, pickAndUploadImage } from '../lib/pickAndUploadImage';
import { radius, spacing } from '../theme';
import { Input, PrimaryButton } from './ui';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Dossier Supabase Storage (ex: products, minisite) */
  uploadFolder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  /** Si true, ajoute l'URL à la ligne suivante au lieu de remplacer */
  appendMode?: boolean;
  showPreview?: boolean;
};

export function ImageUrlInput({
  label,
  value,
  onChangeText,
  uploadFolder = 'minisite',
  multiline,
  numberOfLines,
  appendMode,
  showPreview = true,
}: Props) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);

  const browse = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const url = await pickAndUploadImage(user.id, uploadFolder);
      if (appendMode) {
        const next = value.trim() ? `${value.trim()}\n${url}` : url;
        onChangeText(next);
      } else {
        onChangeText(url);
      }
    } catch (error) {
      if (error instanceof ImagePickCancelled) return;
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('exhibitor.minisite.imageUploadFailed'),
      );
    } finally {
      setUploading(false);
    }
  };

  const previewUrl = !multiline && value.trim() ? value.trim() : multiline ? value.split('\n').find((l) => l.trim())?.trim() : '';

  return (
    <View style={styles.wrap}>
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType="url"
        autoCapitalize="none"
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      <PrimaryButton
        label={uploading ? t('exhibitor.minisite.imageUploading') : t('exhibitor.minisite.productBrowseImage')}
        variant="outline"
        onPress={browse}
        loading={uploading}
        disabled={uploading}
      />
      {showPreview && previewUrl ? (
        <Image source={{ uri: previewUrl }} style={styles.preview} resizeMode="cover" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  preview: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
  },
});
