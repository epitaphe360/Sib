import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchExhibitorLeads, buildLeadsCsv, type ExhibitorLead } from '../../../src/api/leads';
import { Avatar, IllustratedEmpty, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function ExhibitorContactsScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [leads, setLeads] = useState<ExhibitorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      setLeads(await fetchExhibitorLeads(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const exportCsv = async () => {
    if (!leads.length) return;
    const csv = buildLeadsCsv(leads);
    const path = `${FileSystem.cacheDirectory}urbaevent-leads-${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: t('exhibitor.contacts.exportCsv') });
    }
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('exhibitor.contacts.title')} subtitle={t('exhibitor.contacts.subtitle')} />
      {leads.length > 0 && (
        <PrimaryButton label={t('exhibitor.contacts.exportCsv')} variant="outline" onPress={exportCsv} />
      )}

      {error ? (
        <>
          <IllustratedEmpty icon="alert-circle-outline" title={t('common.error')} message={error} />
          <PrimaryButton label={t('common.retry')} onPress={load} />
        </>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(l) => l.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            !loading ? (
              <IllustratedEmpty
                icon="people-outline"
                title={t('exhibitor.contacts.emptyTitle')}
                message={t('exhibitor.contacts.emptyMessage')}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <LeadRow lead={item} onPress={() => router.push(`/(exhibitor)/contact/${item.id}` as never)} />
          )}
        />
      )}
    </Screen>
  );
}

function LeadRow({ lead, onPress }: { lead: ExhibitorLead; onPress: () => void }) {
  const { t } = useI18n();
  const name = lead.visitorName ?? t('exhibitor.contacts.unknown');
  const date = new Date(lead.scannedAt).toLocaleString('fr-FR');

  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <Avatar name={name} size={48} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {lead.companyName ? <Text style={styles.company}>{lead.companyName}</Text> : null}
        {lead.visitorEmail ? <Text style={styles.email}>{lead.visitorEmail}</Text> : null}
        <Text style={styles.meta}>{t('exhibitor.contacts.scannedAt')} {date}</Text>
        <View style={styles.qrHint}>
          <Text style={styles.qrLabel}>{t('exhibitor.contacts.badgeId')}</Text>
          <Text style={styles.qrCode} numberOfLines={1}>{lead.visitorUserId.slice(0, 8)}…</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.text },
  company: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  email: { fontSize: 13, fontFamily: fonts.body, color: colors.primary, marginTop: 2 },
  meta: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, marginTop: 6 },
  qrHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  qrLabel: { fontSize: 10, fontFamily: fonts.bodyBold, color: colors.gold, textTransform: 'uppercase' },
  qrCode: { fontSize: 11, fontFamily: fonts.bodyMedium, color: colors.textMuted, flex: 1 },
});
