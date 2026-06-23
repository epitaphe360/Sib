import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchInvoicesForUser, type Invoice } from '../../src/api/invoices';
import { EmptyState, Screen, ScreenTitle } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/Skeleton';
import { AnimatedListItem } from '../../src/components/AnimatedListItem';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { localeCode } from '../../src/lib/locale';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function VisitorInvoicesScreen() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await fetchInvoicesForUser(user.id));
    } catch { /* silently ignore */ } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Screen><ScreenTitle title={t('invoices.title')} /><SkeletonList rows={4} /></Screen>;

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('invoices.title')} subtitle={t('invoices.subtitle')} />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState message={t('invoices.empty')} />}
        renderItem={({ item, index }) => (
          <AnimatedListItem index={index}>
            <View style={styles.row}>
              <Text style={styles.num}>{item.invoiceNumber}</Text>
              <Text style={styles.amount}>{item.amountTtc.toFixed(2)} {item.currency}</Text>
              <Text style={styles.meta}>{new Date(item.issuedAt).toLocaleDateString(localeCode(locale))} · {item.status}</Text>
            </View>
          </AnimatedListItem>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  num: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 15 },
  amount: { fontFamily: fonts.display, color: colors.primary, fontSize: 20, marginTop: 4 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
