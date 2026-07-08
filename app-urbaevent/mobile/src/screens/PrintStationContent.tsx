import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getPrintHistory, getPrintStats, recordPrint, type PrintRecord } from '../lib/printHistory';
import { lookupBadgeByEmail, lookupBadgeByQRData } from '../api/badgeLookup';
import { A4_SHEET_WIDTH, BadgeA4Bifold } from '../components/BadgeA4Bifold';
import { QRScannerView } from '../components/QRScannerView';
import { Chip, Input, PrimaryButton, Screen, ScreenTitle, SecondaryButton } from '../components/ui';
import { printBadgeFromView } from '../lib/printBadge';
import { useI18n } from '../i18n/I18nProvider';
import type { UserBadge } from '../types';
import { colors, fonts, radius, spacing } from '../theme';

function BadgePrintTarget({ badge }: { badge: UserBadge }) {
  return <BadgeA4Bifold badge={badge} previewScale={false} />;
}

export function PrintStationContent() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<'scan' | 'search'>('search');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<'print' | 'history'>('print');
  const [history, setHistory] = useState<PrintRecord[]>([]);
  const printRef = useRef<View>(null);

  useEffect(() => {
    getPrintHistory().then(setHistory).catch((e) => console.warn('[PrintStation] getPrintHistory', e));
  }, [badge]);

  const applyResult = useCallback(async (lookup: Awaited<ReturnType<typeof lookupBadgeByQRData>>) => {
    if (!lookup.found || !lookup.badge) {
      setBadge(null);
      setError(lookup.error ?? t('printStation.notFound'));
      return false;
    }
    setBadge(lookup.badge);
    setError(null);
    return true;
  }, [t]);

  const onPrint = async () => {
    if (!badge) return;
    setPrinting(true);
    try {
      await printBadgeFromView(printRef);
      await recordPrint(badge.badgeCode, badge.fullName);
      setHistory(await getPrintHistory());
      Alert.alert(t('printStation.printed'));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('printStation.printError'));
    } finally {
      setPrinting(false);
    }
  };

  const onScan = async (data: string) => {
    if (scanning) return;
    setScanning(true);
    try {
      const found = await applyResult(await lookupBadgeByQRData(data));
      if (found) setMode('search');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setScanning(false);
    }
  };

  const onSearch = async () => {
    if (!email.trim()) return;
    setScanning(true);
    try {
      await applyResult(await lookupBadgeByEmail(email.trim(), {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setScanning(false);
    }
  };

  return (
    <Screen style={styles.flex}>
      <View ref={printRef} collapsable={false} style={styles.hiddenPrintTarget} pointerEvents="none">
        {badge ? <BadgePrintTarget badge={badge} /> : null}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenTitle title={t('printStation.title')} subtitle={t('printStation.subtitle')} />

        <View style={styles.modeRow}>
          <Chip label={t('printStation.tabPrint')} active={tab === 'print'} onPress={() => setTab('print')} />
          <Chip label={t('printStation.tabHistory')} active={tab === 'history'} onPress={() => setTab('history')} />
        </View>

        {tab === 'history' ? (
          <>
            <Text style={styles.stats}>
              {t('printStation.statsToday')}: {getPrintStats(history).today} · {t('printStation.statsTotal')}: {getPrintStats(history).total}
            </Text>
            <FlatList
              data={history}
              keyExtractor={(h) => h.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.histRow}>
                  <Text style={styles.histName}>{item.fullName}</Text>
                  <Text style={styles.histMeta}>
                    {item.badgeCode} · {new Date(item.printedAt).toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'en' ? 'en-US' : 'fr-FR')}
                  </Text>
                </View>
              )}
            />
          </>
        ) : (
          <>
            <View style={styles.modeRow}>
              <Chip label={t('printStation.search')} active={mode === 'search'} onPress={() => setMode('search')} />
              <Chip label={t('printStation.scan')} active={mode === 'scan'} onPress={() => setMode('scan')} />
            </View>

            {mode === 'search' ? (
              <>
                <Input
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="participant@email.com"
                  returnKeyType="next"
                />
                <Input
                  label="Prénom (email entreprise partagé)"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <Input
                  label="Nom (email entreprise partagé)"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="search"
                  onSubmitEditing={onSearch}
                />
                <PrimaryButton label={t('printStation.lookup')} onPress={onSearch} loading={scanning} />
              </>
            ) : (
              <View style={styles.scannerBox}>
                <QRScannerView onScan={onScan} active={!scanning && !printing} />
                <Text style={styles.scanHint}>{t('printStation.scanHint')}</Text>
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {badge ? (
              <View style={styles.previewBlock}>
                <Text style={styles.found}>{badge.fullName} · {badge.badgeCode}</Text>
                <View style={styles.previewCard}>
                  <BadgePrintTarget badge={badge} />
                </View>
                <PrimaryButton label={t('badge.printA4')} onPress={onPrint} loading={printing} variant="gold" />
                <SecondaryButton label={t('printStation.clear')} onPress={() => { setBadge(null); setError(null); setEmail(''); }} />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  scannerBox: {
    height: 260,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    backgroundColor: '#000',
  },
  scanHint: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    textAlign: 'center',
    color: '#fff',
    fontFamily: fonts.body,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  error: { color: colors.danger, fontFamily: fonts.body, marginBottom: spacing.md },
  previewBlock: { marginTop: spacing.md },
  previewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  hiddenPrintTarget: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: A4_SHEET_WIDTH,
    opacity: 0.01,
  },
  found: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.primary, marginBottom: spacing.sm, textAlign: 'center' },
  stats: { fontFamily: fonts.bodyBold, color: colors.gold, marginBottom: spacing.md },
  histRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  histName: { fontFamily: fonts.bodyBold, color: colors.text },
  histMeta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
