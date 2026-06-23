import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { useAuth } from '../context/AuthContext';
import { useSignOut } from '../hooks/useSignOut';
import { useI18n } from '../i18n/I18nProvider';
import { fonts, radius, spacing } from '../theme';

type Props = {
  style?: ViewStyle;
  compact?: boolean;
  /** Position fixe en haut à droite (défaut). false = dans le flux du parent. */
  floating?: boolean;
};

export function SignOutOverlayButton({ style, compact, floating = true }: Props) {
  const { user } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  if (!user) return null;

  return (
    <Pressable
      style={[
        styles.btn,
        floating && {
          position: 'absolute',
          right: spacing.md,
          top: insets.top + spacing.sm,
          zIndex: 1000,
          elevation: 24,
        },
        style,
      ]}
      onPress={confirmSignOut}
      accessibilityRole="button"
      accessibilityLabel={t('profile.signOut')}
      hitSlop={12}
    >
      <AppIcon name="log-out-outline" size={18} color="#fff" />
      {!compact ? <Text style={styles.label}>{t('profile.signOut')}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
  },
  label: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 12 },
});
