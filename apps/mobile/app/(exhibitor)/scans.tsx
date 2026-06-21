import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getExhibitorScanHistory } from '../../src/api/scanner';
import type { ScanHistoryEntry } from '../../src/api/scanner';
import { EmptyState, Screen, ScreenTitle } from '../../src/components/ui';
import { AppIcon } from '../../src/components/AppIcon';
import { useI18n } from '../../src/i18n/I18nProvider';
import { localeCode } from '../../src/lib/locale';
import { colors, fonts, spacing } from '../../src/theme';

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
      <ScreenTitle title={t('exhibitor.scans.title')} subtitle={t('exhibitor.scans.subtitle')} />
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t('exhibitor.scans.empty')} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <AppIcon
              name={item.valid ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={22}
              color={item.valid ? colors.success : colors.danger}
            />
            <View style={styles.content}>
              <Text style={styles.name}>{item.userName ?? item.reason ?? '—'}</Text>
              <Text style={styles.meta}>
                {new Date(item.scannedAt).toLocaleString(localeCode(locale))}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  content: { flex: 1 },
  name: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 14 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
