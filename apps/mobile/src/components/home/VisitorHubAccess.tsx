import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../../theme';
import { AppIcon } from '../AppIcon';
import { PrimaryButton } from '../ui';

/** Invité : carte connexion/inscription. Connecté : rien (navigation via tab bar). */
export function VisitorHubAccess() {
  const { user } = useAuth();
  const { t } = useI18n();

  if (user) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.guestCard}>
        <View style={styles.guestHeader}>
          <View style={styles.guestIconWrap}>
            <AppIcon name="person-outline" size={26} color="#fff" />
          </View>
          <View style={styles.guestTextCol}>
            <Text style={styles.guestTitle}>{t('home.urba.visitorHubTitle')}</Text>
            <Text style={styles.guestBody}>{t('home.urba.authBody')}</Text>
          </View>
        </View>
        <PrimaryButton
          label={t('home.urba.loginCta')}
          variant="gold"
          onPress={() => router.push('/(auth)/login' as never)}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label={t('home.urba.registerCta')}
          variant="outline"
          onPress={() => router.push('/(auth)/register' as never)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  guestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  guestHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  guestIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTextCol: { flex: 1 },
  guestTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  guestBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  gap: { height: spacing.sm },
});
