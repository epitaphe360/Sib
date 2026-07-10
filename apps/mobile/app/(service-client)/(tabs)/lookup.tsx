import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { lookupParticipant, lookupParticipants, type VisitorLookup } from '../../../src/api/serviceClient';
import { A4_SHEET_WIDTH, BadgeA4Bifold } from '../../../src/components/BadgeA4Bifold';
import { QRScannerView } from '../../../src/components/QRScannerView';
import { SignOutOverlayButton } from '../../../src/components/SignOutOverlayButton';
import { Chip, Input, PrimaryButton, Screen, ScreenTitle, SecondaryButton } from '../../../src/components/ui';
import { printBadgeFromView } from '../../../src/lib/printBadge';
import { useI18n } from '../../../src/i18n/I18nProvider';
import type { UserBadge } from '../../../src/types';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function LookupScreen() {
  const { t } = useI18n();
  const [mode, setMode] = useState<'search' | 'scan'>('search');
  const isScanMode = mode === 'scan';
  const [query, setQuery] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState<VisitorLookup[]>([]);
  const [result, setResult] = useState<VisitorLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const printRef = useRef<View>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      if (query.includes('@')) {
        const list = await lookupParticipants({
          email: query.trim().toLowerCase(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        });
        const found = list.filter((r) => r.found);
        setResults(found);
        setResult(found.length === 1 ? found[0] : found.length === 0 ? list[0] ?? null : null);
        if (found.length > 1) {
          Alert.alert(
            t('lookup.multipleResultsTitle'),
            t('lookup.multipleResultsBody', { count: String(found.length) }),
          );
        }
      } else {
        const r = await lookupParticipant(query.trim());
        setResults(r.found ? [r] : []);
        setResult(r);
      }
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const selectResult = (r: VisitorLookup) => {
    setResult(r);
  };

  const onScan = async (data: string) => {
    setLoading(true);
    try {
      const r = await lookupParticipant(data);
      setResult(r);
      setMode('search');
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const printBadge = async () => {
    setPrinting(true);
    try {
      await printBadgeFromView(printRef);
      Alert.alert(t('printStation.printed'));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : '');
    } finally {
      setPrinting(false);
    }
  };

  const badge = result?.badge;

  const typeLabel: Record<string, string> = {
    visitor: t('lookup.typeVisitor'),
    exhibitor: t('lookup.typeExhibitor'),
    partner: t('lookup.typePartner'),
    admin: t('lookup.typeAdmin'),
    security: t('lookup.typeSecurity'),
    service_client: t('lookup.typeServiceClient'),
  };
  const statusLabel: Record<string, string> = {
    active: t('lookup.statusActive'),
    pending_payment: t('lookup.statusPendingPayment'),
    inactive: t('lookup.statusInactive'),
    suspended: t('lookup.statusSuspended'),
  };
  const statusColor: Record<string, string> = {
    active: colors.success, pending_payment: colors.warning, inactive: colors.textMuted, suspended: colors.danger,
  };

  if (isScanMode) {
    return (
      <View style={styles.fullRoot} pointerEvents="box-none">
        <QRScannerView onScan={onScan} active={!loading} fullScreen />
        <View style={styles.topBar} pointerEvents="box-none">
          <SignOutOverlayButton />
        </View>
        <View style={styles.scanOverlay}>
          <Text style={styles.scanHint}>{t('lookup.scanHint')}</Text>
          <PrimaryButton label={t('lookup.searchBack')} variant="outline" onPress={() => setMode('search')} />
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('lookup.title')} subtitle={t('lookup.subtitle')} />

        <View style={styles.modeRow}>
          <Chip label={t('lookup.modeText')} active={!isScanMode} onPress={() => setMode('search')} />
          <Chip label={t('lookup.modeQr')} active={isScanMode} onPress={() => setMode('scan')} />
        </View>

        <Input
          label={t('lookup.searchLabel')}
          value={query}
          onChangeText={setQuery}
          placeholder={t('lookup.placeholder')}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={search}
        />
        <Input
          label={t('lookup.firstNameSharedEmail')}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <Input
          label={t('lookup.lastNameSharedEmail')}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={search}
        />
        <PrimaryButton label={t('common.search')} onPress={search} loading={loading} disabled={!query.trim()} />

        {results.length > 1 && (
          <View style={styles.multiResults}>
            <Text style={styles.multiTitle}>{t('lookup.selectVisitor')}</Text>
            {results.map((r) => (
              <SecondaryButton
                key={r.userId ?? r.email}
                label={`${r.name ?? '?'} — ${r.email ?? ''}`}
                onPress={() => selectResult(r)}
              />
            ))}
          </View>
        )}

        {result && (
          <View style={styles.resultBlock}>
            {            result.found ? (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  {result.status ? (
                    <View style={[styles.statusBadge, { backgroundColor: (statusColor[result.status] ?? colors.textMuted) + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor[result.status] ?? colors.textMuted }]}>
                        {statusLabel[result.status] ?? result.status}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.resultEmail}>{result.email}</Text>
                <Text style={styles.resultType}>{typeLabel[result.type ?? ''] ?? result.type}</Text>
                {result.visitorLevel ? <Text style={styles.resultMeta}>Pass : {result.visitorLevel.toUpperCase()}</Text> : null}
                {result.hasBadge ? (
                  <Text style={styles.badgeStatus}>{t('lookup.hasBadge')}</Text>
                ) : (
                  <Text style={styles.noBadge}>{t('lookup.noBadge')}</Text>
                )}

                {/* Actions */}
                <View style={styles.actionRow}>
                  {result.hasBadge && badge ? (
                    <PrimaryButton label={t('lookup.printBadge')} onPress={printBadge} loading={printing} variant="gold" />
                  ) : (
                    <PrimaryButton
                      label={t('lookup.createBadge')}
                      onPress={() => Alert.alert('Info', t('lookup.createBadgeHint'))}
                    />
                  )}
                  <View style={{ height: spacing.sm }} />
                  <SecondaryButton
                    label={t('lookup.replaceBadge')}
                    onPress={() => router.push({ pathname: '/(service-client)/badge-replacement', params: { userId: result.userId ?? '' } } as never)}
                  />
                </View>

                {/* Aperçu badge pour impression */}
                {badge ? (
                  <View ref={printRef} collapsable={false} style={styles.hiddenPreview}>
                    <BadgeA4Bifold badge={badge} previewScale={false} />
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.notFoundCard}>
                <Text style={styles.notFoundText}>{result.error ?? t('lookup.notFound')}</Text>
                <Text style={styles.notFoundHint}>{t('lookup.notFoundHint')}</Text>
                <PrimaryButton
                  label={t('lookup.registerOnSite')}
                  onPress={() => router.push('/(service-client)/on-site-registration' as never)}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  fullRoot: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 24,
  },
  scanOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(27,54,93,0.92)', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  scanHint: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 14, textAlign: 'center', marginBottom: 12 },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  multiResults: { marginTop: spacing.sm, gap: spacing.xs },
  multiTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary, marginBottom: spacing.xs },
  resultBlock: { marginTop: spacing.md },
  resultCard: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  resultName: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.text, flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  statusBadgeText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  resultEmail: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs },
  resultType: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary, marginBottom: spacing.xs },
  resultMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  badgeStatus: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.success, marginBottom: spacing.md },
  noBadge: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.warning, marginBottom: spacing.md },
  actionRow: { gap: spacing.sm },
  hiddenPreview: { position: 'absolute', top: 0, left: 0, width: A4_SHEET_WIDTH, opacity: 0.01, pointerEvents: 'none' },
  notFoundCard: { alignItems: 'center', padding: spacing.lg, backgroundColor: colors.dangerBg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.danger },
  notFoundText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.danger, marginBottom: spacing.sm },
  notFoundHint: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
});
