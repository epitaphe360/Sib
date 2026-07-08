import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { startConversation } from '../../../src/api/chat';
import { fetchScannedContactProfile, resolveSalonLabel } from '../../../src/api/visitorScans';
import { Avatar, Card, IllustratedEmpty, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { AppIcon } from '../../../src/components/AppIcon';
import { useAuth } from '../../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { SALONS } from '../../../src/data/salons';
import { colors, fonts, spacing } from '../../../src/theme';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: string | undefined, t: (k: string) => string): string {
  switch (status) {
    case 'accepted':
      return t('scanHistory.statusAccepted');
    case 'pending':
      return t('scanHistory.statusPending');
    case 'rejected':
      return t('scanHistory.statusRejected');
    case 'scanned':
      return t('scanHistory.statusScanned');
    default:
      return status ?? '—';
  }
}

function typeLabel(type: string | undefined, t: (k: string) => string): string {
  switch (type) {
    case 'exhibitor':
      return t('scanHistory.typeExhibitor');
    case 'visitor':
      return t('scanHistory.typeVisitor');
    case 'partner':
      return t('scanHistory.typePartner');
    default:
      return type ?? t('scanHistory.typeContact');
  }
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ScanContactDetailScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    scannedAt?: string;
    salonId?: string;
    salonName?: string;
    kind?: string;
    status?: string;
  }>();
  const { user } = useAuth();
  const { permissions } = useNetworkingPermissions();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof fetchScannedContactProfile>>>(null);
  const [msgLoading, setMsgLoading] = useState(false);

  const salonLabel = useMemo(
    () => resolveSalonLabel(params.salonId, params.salonName),
    [params.salonId, params.salonName],
  );

  const salonMeta = useMemo(() => SALONS.find((s) => s.id === (params.salonId ?? 'sib')), [params.salonId]);

  const load = useCallback(async () => {
    if (!params.userId) return;
    setLoading(true);
    setLoadError(null);
    try {
      setProfile(await fetchScannedContactProfile(params.userId));
    } catch (e) {
      setProfile(null);
      setLoadError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [params.userId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const scanKind = params.kind === 'stand' ? t('scanHistory.kindStand') : t('scanHistory.kindNetworking');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('scanHistory.contactTitle')} subtitle={profile?.name ?? '…'} />

        {loading ? (
          <ActivityIndicator color={colors.gold} size="large" style={styles.loader} />
        ) : !profile ? (
          <IllustratedEmpty
            icon="person-outline"
            title={loadError ? t('common.error') : t('scanHistory.contactNotFound')}
            message={loadError ?? t('scanHistory.contactNotFound')}
          />
        ) : (
          <>
            <Card elevated>
              <View style={styles.profileHeader}>
                <Avatar name={profile.name} size={64} />
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{profile.name}</Text>
                  <Text style={styles.role}>{typeLabel(profile.type, t)}</Text>
                  {profile.company ? <Text style={styles.company}>{profile.company}</Text> : null}
                  {profile.jobTitle ? <Text style={styles.meta}>{profile.jobTitle}</Text> : null}
                  {profile.email ? <Text style={styles.email}>{profile.email}</Text> : null}
                  {profile.phone ? <Text style={styles.meta}>{profile.phone}</Text> : null}
                  {profile.standNumber ? (
                    <Text style={styles.meta}>
                      {t('scanHistory.stand')}: {profile.standNumber}
                      {profile.sector ? ` · ${profile.sector}` : ''}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Card>

            <Card elevated style={styles.eventCard}>
              <Text style={styles.sectionLabel}>{t('scanHistory.eventSection')}</Text>
              <View style={styles.eventRow}>
                <AppIcon name="calendar-outline" size={18} color={colors.primary} />
                <View style={styles.eventText}>
                  <Text style={styles.eventTitle}>{salonLabel}</Text>
                  {salonMeta?.dates ? <Text style={styles.eventMeta}>{salonMeta.dates}</Text> : null}
                  {salonMeta?.description ? (
                    <Text style={styles.eventMeta}>{salonMeta.description}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.divider} />
              <InfoLine label={t('scanHistory.scanType')} value={scanKind} />
              {params.scannedAt ? (
                <InfoLine label={t('scanHistory.scanDate')} value={formatWhen(params.scannedAt)} />
              ) : null}
              <InfoLine label={t('scanHistory.scanStatus')} value={statusLabel(params.status, t)} />
            </Card>

            <View style={styles.actions}>
              {profile.email ? (
                <PrimaryButton label={t('scanHistory.actionEmail')} variant="gold" onPress={() => void Linking.openURL(`mailto:${profile.email}`)} />
              ) : null}
              {profile.phone ? (
                <PrimaryButton label={t('scanHistory.actionCall')} variant="outline" onPress={() => void Linking.openURL(`tel:${profile.phone}`)} />
              ) : null}
              {permissions.canSendMessages && params.status === 'accepted' && user ? (
                <PrimaryButton
                  label={t('scanHistory.actionMessage')}
                  variant="outline"
                  loading={msgLoading}
                  onPress={async () => {
                    setMsgLoading(true);
                    try {
                      const conversationId = await startConversation(user.id, profile.id);
                      router.push(`/(visitor)/messages/${conversationId}` as never);
                    } catch (e) {
                      alert(e instanceof Error ? e.message : t('common.error'));
                    } finally {
                      setMsgLoading(false);
                    }
                  }}
                />
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  loader: { marginTop: spacing.xl },
  profileHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  profileInfo: { flex: 1 },
  name: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.text },
  role: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.gold,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  company: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primaryDark, marginTop: 6 },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 4 },
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.primary, marginTop: 4 },
  eventCard: { marginTop: spacing.md },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  eventRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  eventText: { flex: 1 },
  eventTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  eventMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 3, lineHeight: 18 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginTop: 6 },
  infoLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, flex: 1 },
  infoValue: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text, flex: 1, textAlign: 'right' },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
