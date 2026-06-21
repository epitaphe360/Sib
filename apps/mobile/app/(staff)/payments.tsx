import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchPendingPaymentRequests, validatePaymentRequest, type PaymentRequestRow } from '../../src/api/admin';
import { AppIcon } from '../../src/components/AppIcon';
import { AnimatedListItem } from '../../src/components/AnimatedListItem';
import { PressableScale } from '../../src/components/PressableScale';
import { EmptyState, Screen, ScreenTitle } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/Skeleton';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

export default function StaffPaymentsScreen() {
  const { t } = useI18n();
  const [items, setItems] = useState<PaymentRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await fetchPendingPaymentRequests());
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, approve: boolean) => {
    setActingId(id);
    try {
      await validatePaymentRequest(id, approve);
      await load();
      Alert.alert(
        approve ? t('staff.alerts.approved') : t('staff.alerts.rejected'),
        approve ? 'Le niveau VIP a été activé.' : 'La demande a été refusée.'
      );
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <Screen>
        <ScreenTitle title={t('tabs.payments')} />
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.gold}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
          />
        }
        ListHeaderComponent={
          <ScreenTitle
            title={t('tabs.payments')}
            subtitle={`${items.length} demande${items.length !== 1 ? 's' : ''} en attente`}
          />
        }
        ListEmptyComponent={
          <EmptyState message="Aucun paiement en attente de validation" />
        }
        renderItem={({ item, index }) => (
          <AnimatedListItem index={index}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {(item.userName ?? item.userEmail ?? '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {item.userName ?? item.userEmail ?? '—'}
                  </Text>
                  {item.userEmail && item.userName ? (
                    <Text style={styles.userEmail} numberOfLines={1}>{item.userEmail}</Text>
                  ) : null}
                </View>
                <View style={styles.amountWrap}>
                  <Text style={styles.amount}>{item.amount}</Text>
                  <Text style={styles.currency}>{item.currency}</Text>
                </View>
              </View>

              {/* Meta */}
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <AppIcon name="card-outline" size={12} color={colors.info} />
                  <Text style={styles.metaText}>{item.paymentMethod ?? 'bank_transfer'}</Text>
                </View>
                <View style={[styles.metaChip, { backgroundColor: colors.warningBg }]}>
                  <AppIcon name="time-outline" size={12} color={colors.warning} />
                  <Text style={[styles.metaText, { color: colors.warning }]}>En attente</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <PressableScale
                  style={styles.btnApprove}
                  onPress={() => act(item.id, true)}
                  disabled={actingId === item.id}
                >
                  <AppIcon name="checkmark-circle-outline" size={16} color="#fff" />
                  <Text style={styles.btnText}>Valider</Text>
                </PressableScale>
                <PressableScale
                  style={styles.btnReject}
                  onPress={() => act(item.id, false)}
                  disabled={actingId === item.id}
                >
                  <AppIcon name="close-circle-outline" size={16} color="#fff" />
                  <Text style={styles.btnText}>Refuser</Text>
                </PressableScale>
              </View>
            </View>
          </AnimatedListItem>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold },
  cardInfo: { flex: 1 },
  userName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  userEmail: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  amountWrap: { alignItems: 'flex-end' },
  amount: { fontFamily: fonts.display, fontSize: 22, color: colors.primary },
  currency: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  metaRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.infoBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  metaText: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.info },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btnApprove: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  btnReject: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.danger,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  btnText: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#fff' },
});
