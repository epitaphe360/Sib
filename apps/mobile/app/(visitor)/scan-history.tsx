import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  buildVisitorScansCsv,
  fetchVisitorScanHistory,
  type VisitorScanEntry,
} from '../../src/api/visitorScans';
import { AppIcon } from '../../src/components/AppIcon';
import { openContactProfile } from '../../src/lib/openContactProfile';
import { EmptyState, IllustratedEmpty, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { avatarColor, avatarInitials } from '../../src/lib/avatarColor';
import { colors, fonts, radius, spacing } from '../../src/theme';

function formatScanTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
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
      return status ?? '';
  }
}

function openContact(item: VisitorScanEntry) {
  openContactProfile({
    userId: item.partnerUserId,
    scannedAt: item.scannedAt,
    salonId: item.salonId,
    salonLabel: item.salonLabel,
    kind: item.kind,
    status: item.status,
  });
}

function ScanRow({ item, t }: { item: VisitorScanEntry; t: (k: string) => string }) {
  const kindLabel =
    item.kind === 'networking' ? t('scanHistory.kindNetworking') : t('scanHistory.kindStand');
  const bg = avatarColor(item.partnerUserId);
  const initials = avatarInitials(item.partnerName);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => openContact(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.partnerName}, ${item.salonLabel}`}
    >
      <View style={styles.rowMain}>
        <View style={[styles.avatar, { backgroundColor: bg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.partner} numberOfLines={1}>{item.partnerName}</Text>
            <Text style={styles.time}>{formatScanTime(item.scannedAt)}</Text>
          </View>
          {item.partnerCompany ? (
            <Text style={styles.company} numberOfLines={1}>{item.partnerCompany}</Text>
          ) : null}
          {item.partnerEmail ? <Text style={styles.email} numberOfLines={1}>{item.partnerEmail}</Text> : null}
          <View style={styles.eventLine}>
            <AppIcon name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.eventText} numberOfLines={1}>{item.salonLabel}</Text>
          </View>
          <View style={styles.rowMeta}>
            <Text style={styles.badge}>{kindLabel}</Text>
            {item.status ? <Text style={styles.status}>{statusLabel(item.status, t)}</Text> : null}
          </View>
        </View>
        <AppIcon name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
      <Text style={styles.tapHint}>{t('scanHistory.tapProfile')}</Text>
    </Pressable>
  );
}

export default function VisitorScanHistoryScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<VisitorScanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoadError(null);
    try {
      setItems(await fetchVisitorScanHistory(user.id));
    } catch (e) {
      setItems([]);
      setLoadError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportCsv = async () => {
    if (!items.length) return;
    setExporting(true);
    try {
      const path = `${FileSystem.cacheDirectory}urbaevent-scans-${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, buildVisitorScansCsv(items), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: t('scanHistory.exportCsv') });
      } else {
        Alert.alert(t('scanHistory.exportCsv'), t('scanHistory.exportUnavailable'));
      }
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setExporting(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <IllustratedEmpty
          icon="people-outline"
          title={t('scanHistory.title')}
          message={t('profile.guestHint')}
          actionLabel={t('login.submit')}
          onAction={() => router.push('/(auth)/login')}
        />
      </Screen>
    );
  }

  const header = (
    <View style={styles.header}>
      <ScreenTitle title={t('scanHistory.title')} subtitle={t('scanHistory.visitorSubtitle')} />
      <View style={styles.actions}>
        <PrimaryButton
          label={t('networking.scanTitle')}
          variant="gold"
          onPress={() => router.push('/(visitor)/scan-connect' as never)}
        />
        {items.length > 0 ? (
          <PrimaryButton
            label={t('scanHistory.exportCsv')}
            variant="outline"
            loading={exporting}
            onPress={() => void exportCsv()}
          />
        ) : null}
      </View>
      {items.length > 0 ? (
        <Text style={styles.count}>
          {t('scanHistory.count').replace('{{count}}', String(items.length))}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen style={styles.flex}>
      <FlatList
        style={styles.flex}
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />
        }
        contentContainerStyle={items.length ? styles.list : styles.listEmpty}
        ListHeaderComponent={header}
        ListEmptyComponent={
          !loading ? (
            loadError ? (
              <EmptyState title={t('common.error')} message={loadError} />
            ) : (
              <EmptyState title={t('scanHistory.empty')} message={t('scanHistory.emptyHint')} />
            )
          ) : null
        }
        renderItem={({ item }) => <ScanRow item={item} t={t} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { marginBottom: spacing.sm },
  actions: { gap: spacing.sm, marginBottom: spacing.xs },
  count: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  list: { paddingBottom: spacing.xl },
  listEmpty: { flexGrow: 1, paddingBottom: spacing.xl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowPressed: { opacity: 0.92 },
  rowMain: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 14 },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  partner: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  company: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDark,
    marginTop: 2,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  eventLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  eventText: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
  },
  rowMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.gold,
    backgroundColor: `${colors.gold}18`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  status: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  tapHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
