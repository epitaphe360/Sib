import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { buildStaticParticipantQR } from '../../api/badgeLookup';
import { PLATFORM } from '../../config/platform';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useRotatingQR } from '../../hooks/useRotatingQR';
import { useI18n } from '../../i18n/I18nProvider';
import { ensureUserBadge } from '../../services/badge';
import type { UserBadge } from '../../types';
import { fonts, radius, shadows, spacing } from '../../theme';
import { AppIcon } from '../AppIcon';
import { FadeSlideIn } from '../FadeSlideIn';
import { PrimaryButton, SecondaryButton } from '../ui';
import { HomeSection } from './HomeSection';

/** E-Badge UrbaEvent — unique et valable pour tous les salons, créé depuis le hub. */
export function HubBadgeSection() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const { colors, isDark } = useAppTheme();
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { qrValue } = useRotatingQR(user?.id, badge);
  const displayQr = qrValue || (badge ? buildStaticParticipantQR(badge) : '');

  const loadOrCreate = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setBadge(await ensureUserBadge(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (user) loadOrCreate();
    else {
      setBadge(null);
      setError(null);
    }
  }, [user, loadOrCreate]);

  const openBadge = () => router.push('/(visitor)/(tabs)/badge' as never);
  const openRegister = () => router.push('/(auth)/register' as never);
  const openLogin = () => router.push('/(auth)/login' as never);

  return (
    <FadeSlideIn delay={60}>
      <HomeSection
        title={t('home.urba.badgeTitle')}
        subtitle={t('home.urba.badgeSubtitle')}
        actionLabel={user && badge ? t('home.urba.badgeViewFull') : undefined}
        onAction={user && badge ? openBadge : undefined}
      >
        <View style={styles.body}>
          {authLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : !user ? (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                !isDark && shadows.sm,
              ]}
            >
              <View style={styles.guestHeader}>
                <View style={[styles.iconWrap, { backgroundColor: colors.accentMuted }]}>
                  <AppIcon name="qr-code-outline" size={28} color={colors.primary} />
                </View>
                <View style={styles.guestText}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {t('home.urba.badgeGuestTitle')}
                  </Text>
                  <Text style={[styles.cardHint, { color: colors.textMuted }]}>
                    {t('home.urba.badgeGuestHint')}
                  </Text>
                </View>
              </View>
              <PrimaryButton label={t('home.urba.registerFree')} onPress={openRegister} variant="gold" />
              <Pressable onPress={openLogin} style={styles.loginRow} accessibilityRole="link">
                <Text style={[styles.loginHint, { color: colors.textMuted }]}>
                  {t('home.urba.alreadyAccount')}
                </Text>
                <Text style={[styles.loginLink, { color: colors.primary }]}>{t('home.urba.loginCta')}</Text>
              </Pressable>
            </View>
          ) : loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                {t('home.urba.badgeCreating')}
              </Text>
            </View>
          ) : error ? (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              <PrimaryButton label={t('common.retry')} onPress={loadOrCreate} />
            </View>
          ) : badge && displayQr ? (
            <Pressable
              onPress={openBadge}
              accessibilityRole="button"
              accessibilityLabel={t('home.urba.badgeViewFull')}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                !isDark && shadows.sm,
              ]}
            >
              <View style={styles.badgeRow}>
                <View style={styles.qrWrap}>
                  <QRCode value={displayQr} size={92} backgroundColor="#fff" color={colors.primary} />
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={[styles.platformLabel, { color: colors.textMuted }]}>{PLATFORM.name}</Text>
                  <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
                    {badge.fullName}
                  </Text>
                  <Text style={[styles.badgeCode, { color: colors.primary }]}>{badge.badgeCode}</Text>
                  <Text style={[styles.globalHint, { color: colors.textMuted }]}>
                    {t('home.urba.badgeGlobalHint')}
                  </Text>
                </View>
              </View>
              <SecondaryButton
                label={t('home.urba.badgeViewFull')}
                icon="qr-code-outline"
                onPress={openBadge}
              />
            </Pressable>
          ) : null}
        </View>
      </HomeSection>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 14 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 12,
    gap: spacing.sm,
  },
  guestHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: { flex: 1 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 16, marginBottom: 4 },
  cardHint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  loginHint: { fontFamily: fonts.body, fontSize: 13 },
  loginLink: { fontFamily: fonts.bodyBold, fontSize: 13 },
  center: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  loadingText: { fontFamily: fonts.body, fontSize: 14 },
  errorText: { fontFamily: fonts.body, fontSize: 14, marginBottom: spacing.sm, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  qrWrap: {
    padding: 7,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgeInfo: { flex: 1, justifyContent: 'center' },
  platformLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  badgeName: { fontFamily: fonts.bodyBold, fontSize: 16, marginBottom: 2 },
  badgeCode: { fontFamily: fonts.bodyBold, fontSize: 13, marginBottom: 4 },
  globalHint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
});
