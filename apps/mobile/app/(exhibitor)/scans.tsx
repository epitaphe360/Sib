import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getExhibitorScanHistory } from '../../src/api/scanner';
import type { ScanHistoryEntry } from '../../src/api/scanner';
import { AppIcon } from '../../src/components/AppIcon';
import { IllustratedEmpty, Screen } from '../../src/components/ui';
import { WorkspaceHeader } from '../../src/components/workspace/WorkspaceUI';
import { useI18n } from '../../src/i18n/I18nProvider';
import { localeCode } from '../../src/lib/locale';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

export default function ExhibitorScansHistoryScreen() {
  const { t, locale } = useI18n();
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  const reload = useCallback(() => {
    setHistory(getExhibitorScanHistory());
  }, []);

  useEffect(() => {
    reload();
    const timer = setInterval(reload, 10_000);
    return () => clearInterval(timer);
  }, [reload]);

  return (
    <Screen style={styles.flex}>
      <WorkspaceHeader
        eyebrow={t('exhibitor.scans.title')}
        title={t('exhibitor.scans.title')}
        subtitle={t('exhibitor.scans.subtitle')}
        tone="exhibitor"
        icon="scan-outline"
        status={history.length ? `${history.length}` : undefined}
      />
      <FlatList
        style={styles.flex}
        contentContainerStyle={[styles.list, history.length === 0 && styles.emptyList]}
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <IllustratedEmpty icon="scan-outline" title={t('exhibitor.scans.title')} message={t('exhibitor.scans.empty')} />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: item.valid ? colors.successBg : colors.dangerBg }]}>
              <AppIcon
                name={item.valid ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={22}
                color={item.valid ? colors.success : colors.danger}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.name}>{item.userName ?? item.reason ?? '—'}</Text>
              <Text style={styles.meta}>{new Date(item.scannedAt).toLocaleString(localeCode(locale))}</Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  emptyList: { flexGrow: 1 },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  name: { fontFamily: fonts.bodySemiBold, color: colors.text, fontSize: 14 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
