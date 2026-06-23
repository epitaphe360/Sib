import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchCollaborators, fetchOwnerContext } from '../../src/api/team';
import { A4_SHEET_WIDTH, BadgeA4Bifold } from '../../src/components/BadgeA4Bifold';
import { PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { printBadgeFromView } from '../../src/lib/printBadge';
import type { UserBadge } from '../../src/types';
import { colors, fonts, spacing } from '../../src/theme';

function collaboratorBadge(
  c: { id: string; firstName: string; lastName: string; email: string; position: string | null },
  company: string,
  stand?: string
): UserBadge {
  const now = new Date();
  return {
    id: c.id,
    userId: c.id,
    badgeCode: `COLLAB-${c.id.slice(0, 8).toUpperCase()}`,
    userType: 'exhibitor',
    fullName: `${c.firstName} ${c.lastName}`.trim(),
    companyName: company,
    email: c.email,
    accessLevel: 'exhibitor',
    validFrom: now,
    validUntil: new Date('2026-12-31'),
    status: 'active',
  };
}

export default function TeamPrintScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [printing, setPrinting] = useState(false);
  const previewRef = useRef<View>(null);
  const [activeBadge, setActiveBadge] = useState<UserBadge | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const ctx = await fetchOwnerContext(user.id);
    if (!ctx) return;
    const team = await fetchCollaborators(ctx.ownerId);
    setBadges(team.map((c) => collaboratorBadge(c, ctx.companyName, ctx.standNumber)));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const printOne = async (badge: UserBadge) => {
    setActiveBadge(badge);
    setPrinting(true);
    try {
      await printBadgeFromView(previewRef);
      Alert.alert(t('printStation.printed'), badge.fullName);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('printStation.printError'));
    } finally {
      setPrinting(false);
    }
  };

  const printAll = async () => {
    for (const badge of badges) {
      await printOne(badge);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('team.printTitle')} subtitle={t('team.printSubtitle')} />
        <PrimaryButton label={t('team.printAll')} onPress={printAll} loading={printing} variant="gold" />
        <FlatList
          data={badges}
          keyExtractor={(b) => b.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.fullName}</Text>
              <PrimaryButton label={t('badge.printA4')} onPress={() => printOne(item)} />
            </View>
          )}
        />
        <View ref={previewRef} collapsable={false} style={styles.hiddenPrintPreview} pointerEvents="none">
          {activeBadge ? (
            <BadgeA4Bifold badge={activeBadge} previewScale={false} />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  row: { marginBottom: spacing.md, gap: spacing.sm },
  name: { fontFamily: fonts.bodyBold, color: colors.text },
  hiddenPrintPreview: { position: 'absolute', top: 0, left: 0, width: A4_SHEET_WIDTH, opacity: 0.01 },
});
