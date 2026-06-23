import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  IllustratedEmpty,
  MenuRow,
  PrimaryButton,
  Screen,
  StatusBadge,
} from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useSignOut } from '../../../src/hooks/useSignOut';
import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { ensureUserBadge } from '../../../src/services/badge';
import { getLatestPaymentRequest } from '../../../src/services/payment';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function ProfileScreen() {
  const { user, isLoading, isConfigured } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { permissions } = useNetworkingPermissions();
  const { t } = useI18n();
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.status === 'pending_payment') {
      getLatestPaymentRequest(user.id)
        .then((req) => setPaymentRequestId(req?.id ?? null))
        .catch(() => setPaymentRequestId(null));
    }
  }, [user?.id, user?.status]);

  useEffect(() => {
    if (user?.type === 'visitor') {
      ensureUserBadge(user.id).catch(() => undefined);
    }
  }, [user?.id, user?.type]);

  if (isLoading) {
    return (
      <Screen>
        <Text style={styles.loading}>{t('common.loading')}</Text>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <IllustratedEmpty
          icon="person-outline"
          title={t('profile.title')}
          message={t('profile.guestHint')}
          actionLabel={t('login.submit')}
          onAction={() => router.push('/(auth)/login')}
        />
        <PrimaryButton label={t('auth.register.freeTitle')} onPress={() => router.push('/(auth)/register')} />
        <View style={styles.gap} />
        <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} variant="gold" />
        {!isConfigured && (
          <Text style={styles.warn}>{t('profile.envWarn')}</Text>
        )}
      </Screen>
    );
  }

  const isVip = user.visitorLevel === 'vip' || user.visitorLevel === 'premium';
  const isFreeVisitor = user.type === 'visitor' && !isVip;

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar name={user.name} size={72} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badges}>
            <StatusBadge status={user.status === 'pending_payment' ? 'pending' : 'confirmed'} />
            {isFreeVisitor && (
              <View style={styles.freePill}>
                <Text style={styles.freeText}>{t('profile.visitorFree')}</Text>
              </View>
            )}
            {isVip && (
              <View style={styles.vipPill}>
                <Text style={styles.vipText}>{t('home.status.vip')}</Text>
              </View>
            )}
          </View>
        </View>

        {isFreeVisitor && (
          <Card elevated style={styles.badgeCard}>
            <Text style={styles.badgeCardTitle}>{t('profile.freeBadgeCard')}</Text>
            <Text style={styles.badgeCardHint}>{t('badge.subtitle')}</Text>
            <PrimaryButton
              label={t('profile.freeBadgeCta')}
              onPress={() => router.push('/(visitor)/(tabs)/badge')}
            />
          </Card>
        )}

        {user.status === 'pending_payment' && (
          <Card elevated>
            <Text style={styles.pendingHint}>{t('profile.pendingPayment')}</Text>
            <PrimaryButton
              label={t('payment.title')}
              variant="gold"
              onPress={() => {
                if (paymentRequestId) router.push(`/payment/${paymentRequestId}`);
                else Alert.alert(t('payment.title'), t('profile.paymentMissing'));
              }}
            />
          </Card>
        )}

        <Text style={styles.section}>{t('profile.sectionActivity')}</Text>
        <MenuRow icon="time-outline" label={t('tabs.appointments')} onPress={() => router.push('/(visitor)/appointments' as never)} />
        {permissions.canAccessNetworking && (
          <>
            <MenuRow icon="chatbubbles-outline" label={t('tabs.messages')} onPress={() => router.push('/(visitor)/messages' as never)} />
            <MenuRow icon="people-outline" label={t('tabs.networking')} onPress={() => router.push('/(visitor)/networking' as never)} />
            <MenuRow icon="flash-outline" label={t('speed.title')} onPress={() => router.push('/(visitor)/speed-networking' as never)} />
          </>
        )}
        <MenuRow icon="qr-code-outline" label={t('badge.title')} onPress={() => router.push('/(visitor)/(tabs)/badge')} accent={colors.primary} />
        <MenuRow icon="document-text-outline" label={t('visa.title')} onPress={() => router.push('/(visitor)/visa-letter' as never)} />
        <MenuRow icon="receipt-outline" label={t('invoices.title')} onPress={() => router.push('/(visitor)/invoices' as never)} />
        <MenuRow icon="play-circle-outline" label={t('media.title')} onPress={() => router.push('/(visitor)/media' as never)} />

        <Text style={styles.section}>{t('profile.sectionAccount')}</Text>
        {!isVip && (
          <MenuRow icon="star-outline" label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} accent={colors.gold} />
        )}
        <MenuRow icon="settings-outline" label={t('settings.title')} onPress={() => router.push('/(visitor)/settings')} />
        <MenuRow icon="log-out-outline" label={t('profile.signOut')} onPress={confirmSignOut} accent={colors.danger} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { height: spacing.sm },
  loading: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.lg, paddingTop: spacing.md },
  name: { fontSize: 22, fontFamily: fonts.display, color: colors.text, marginTop: spacing.md },
  email: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  freePill: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  freeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#fff' },
  vipPill: { backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  vipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primaryDark },
  badgeCard: { marginBottom: spacing.md },
  badgeCardTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, marginBottom: spacing.xs },
  badgeCardHint: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  section: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  pendingHint: { fontFamily: fonts.body, color: colors.warning, fontSize: 14, marginBottom: spacing.md, lineHeight: 20 },
  warn: { color: colors.danger, fontSize: 13, marginTop: spacing.md, textAlign: 'center' },
});
