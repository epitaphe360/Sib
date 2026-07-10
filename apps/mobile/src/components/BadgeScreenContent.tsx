import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { requestBadgeByEmail } from '../api/badgeEmail';
import { buildStaticParticipantQR } from '../api/badgeLookup';
import { downloadAndShareBadgePdf } from '../api/badgePdf';
import { A4_SHEET_WIDTH, BadgeA4Bifold } from './BadgeA4Bifold';
import { QRBadgeView } from './QRBadgeView';
import { BadgeGuestCard } from './BadgeGuestCard';
import { IllustratedEmpty, PrimaryButton, SecondaryButton } from './ui';
import { useAuth } from '../context/AuthContext';
import { useRotatingQR } from '../hooks/useRotatingQR';
import { useI18n } from '../i18n/I18nProvider';
import { printBadgeFromView, shareBadgeFromView, shareBadgePdfFromView } from '../lib/printBadge';
import { reloadBadgeConfig } from '../hooks/useBadgeConfig';
import { fetchExhibitorStand } from '../api/minisite';
import { isCollaboratorUser } from '../lib/collaboratorRole';
import { ensureUserBadge } from '../services/badge';
import type { UserBadge } from '../types';
import { colors, fonts, spacing } from '../theme';

type Props = {
  requireAuth?: boolean;
  variant?: 'visitor' | 'exhibitor';
};

export function BadgeScreenContent({ requireAuth = true, variant = 'visitor' }: Props) {
  const isExhibitor = variant === 'exhibitor';
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showA4, setShowA4] = useState(true);
  const [showMobileQr, setShowMobileQr] = useState(!isExhibitor);
  const [printing, setPrinting] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [kioskMode, setKioskMode] = useState(false);
  const printCaptureRef = useRef<View>(null);
  const { qrValue, expiresAt, error: qrError, refresh, usingCache } = useRotatingQR(user?.id, badge);
  const displayQr = qrValue || (badge ? buildStaticParticipantQR(badge) : '');
  const usingStaticQr = Boolean(badge && !qrValue);

  useEffect(() => {
    if (kioskMode) activateKeepAwake('badge-kiosk');
    else deactivateKeepAwake('badge-kiosk');
    return () => {
      void deactivateKeepAwake('badge-kiosk');
    };
  }, [kioskMode]);

  const loadBadge = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (user.type === 'exhibitor' && !isCollaboratorUser(user)) {
        const stand = await fetchExhibitorStand(user.id);
        if (!stand) {
          throw new Error(t('exhibitor.minisite.noStand'));
        }
      }
      setBadge(await ensureUserBadge(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (user) loadBadge();
  }, [user, loadBadge]);

  useFocusEffect(
    useCallback(() => {
      reloadBadgeConfig().catch(() => undefined);
    }, []),
  );

  const sendEmail = async () => {
    if (!user) return;
    setEmailSending(true);
    try {
      await requestBadgeByEmail(user.id);
      Alert.alert(t('common.ok'), t('badge.emailSent'));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setEmailSending(false);
    }
  };

  const runPrintAction = useCallback(
    async (action: (viewRef: RefObject<View | null>) => Promise<void>) => {
      setPrinting(true);
      try {
        await reloadBadgeConfig();
        await new Promise((r) => setTimeout(r, 300));
        await action(printCaptureRef);
      } catch (e) {
        Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
      } finally {
        setPrinting(false);
      }
    },
    [t],
  );

  if (authLoading) {
    return <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: spacing.xl }} />;
  }

  if (!user && requireAuth) {
    return (
      <ScrollView contentContainerStyle={styles.guestScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>{t('badge.title')}</Text>
          <Text style={styles.pageSub}>{t('badge.subtitle')}</Text>
        </View>
        <BadgeGuestCard />
      </ScrollView>
    );
  }

  if (!user) return null;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
    >
      {/* Navy header zone */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>{t('badge.title')}</Text>
        <Text style={styles.pageSub}>
          {isExhibitor ? t('badge.exhibitorSubtitle') : t('badge.subtitle')}
        </Text>
      </View>

      {/* Content zone */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: spacing.xl }} />
        ) : error ? (
          <>
            <IllustratedEmpty icon="alert-circle-outline" title={t('common.error')} message={error} />
            <PrimaryButton label={t('common.retry')} onPress={loadBadge} />
          </>
        ) : badge ? (
          <>
            {usingCache && (
              <View style={styles.offlineBanner}>
                <Text style={styles.offline}>{t('common.offline')}</Text>
              </View>
            )}

            {isExhibitor && (
              <Text style={styles.exhibitorHint}>{t('badge.exhibitorA4Hint')}</Text>
            )}

            {showA4 && (
              <View style={styles.a4Wrap} collapsable={false}>
                <Text style={styles.a4Label}>{t('badge.bifoldPreview')}</Text>
                <BadgeA4Bifold badge={badge} />
              </View>
            )}

            <View ref={printCaptureRef} collapsable={false} style={styles.hiddenPrintPreview} pointerEvents="none">
              <BadgeA4Bifold badge={badge} previewScale={false} />
            </View>

            <View style={styles.primaryActions}>
              <PrimaryButton
                label={t('badge.printA4')}
                variant="gold"
                loading={printing}
                onPress={() => runPrintAction(printBadgeFromView)}
              />
              {!isExhibitor ? (
                <PrimaryButton label={t('badge.sendEmail')} variant="outline" onPress={sendEmail} loading={emailSending} />
              ) : null}
            </View>

            <View style={styles.previewToggle}>
              <SecondaryButton
                label={showA4 ? t('badge.hideA4') : t('badge.showA4')}
                icon="document-outline"
                onPress={() => setShowA4((v) => !v)}
              />
              {isExhibitor ? (
                <SecondaryButton
                  label={showMobileQr ? t('badge.hideMobile') : t('badge.showMobile')}
                  icon="qr-code-outline"
                  onPress={() => setShowMobileQr((v) => !v)}
                />
              ) : null}
            </View>

            {(!isExhibitor || showMobileQr) && displayQr ? (
              <>
                <QRBadgeView badge={badge} qrValue={displayQr} fullScreen={!isExhibitor} />

                {usingStaticQr ? (
                  <View style={styles.staticQrRow}>
                    <Text style={styles.staticQr}>{t('badge.staticQr')}</Text>
                    {qrError ? (
                      <PrimaryButton label={t('badge.regenerate')} onPress={refresh} />
                    ) : null}
                  </View>
                ) : expiresAt ? (
                  <View style={styles.expiryRow}>
                    <View style={styles.expiryDot} />
                    <Text style={styles.expiry}>
                      {t('badge.secureQr')} {expiresAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ) : null}

                {qrError && !usingCache && !usingStaticQr && (
                  <PrimaryButton label={t('badge.regenerate')} onPress={refresh} />
                )}
              </>
            ) : null}

            <View style={styles.secondaryGrid}>
              {[
                { label: t('badge.share'), icon: 'share-outline' as const, onPress: () => runPrintAction(shareBadgeFromView) },
                { label: t('badge.sharePdf'), icon: 'document-text-outline' as const, onPress: () => runPrintAction(shareBadgePdfFromView) },
                { label: t('badge.downloadPdf'), icon: 'download-outline' as const, onPress: async () => { if (!badge) return; try { await downloadAndShareBadgePdf(badge); } catch (e) { Alert.alert(t('common.error'), e instanceof Error ? e.message : ''); } } },
                ...(!isExhibitor
                  ? [
                      { label: kioskMode ? t('badge.kioskOff') : t('badge.kioskOn'), icon: 'phone-portrait-outline' as const, onPress: () => setKioskMode((v) => !v) },
                    ]
                  : []),
              ].map((action) => (
                <SecondaryButton key={action.label} label={action.label} icon={action.icon} onPress={action.onPress} />
              ))}
            </View>

          </>
        ) : (
          <>
            <IllustratedEmpty icon="qr-code-outline" title={t('badge.title')} message={t('badge.unavailable')} />
            <PrimaryButton label={t('common.retry')} onPress={loadBadge} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  guestScroll: { flexGrow: 1, paddingBottom: spacing.xl, backgroundColor: colors.background },
  scrollView: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + 8,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: fonts.display,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  pageSub: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    padding: spacing.md,
    marginTop: 0,
  },
  offlineBanner: {
    backgroundColor: colors.warningBg,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  offline: {
    textAlign: 'center',
    color: colors.warning,
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  expiryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  expiry: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  staticQrRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  staticQr: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    paddingHorizontal: spacing.md,
  },
  primaryActions: { gap: spacing.sm, marginTop: spacing.md },
  secondaryGrid: { gap: spacing.sm, marginTop: spacing.sm },
  previewToggle: { gap: spacing.sm, marginTop: spacing.sm },
  a4Wrap: { marginTop: spacing.lg },
  a4Label: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  hiddenPrintPreview: {
    position: 'absolute',
    left: -9999,
    top: 0,
    width: A4_SHEET_WIDTH,
    height: Math.round(A4_SHEET_WIDTH * (297 / 210)),
    opacity: 1,
  },
  exhibitorHint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
});
