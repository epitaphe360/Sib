import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, MenuRow, RoleBadge, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useSignOut } from '../../../src/hooks/useSignOut';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function StaffProfileScreen() {
  const { user } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { t } = useI18n();
  const isSecurity = user?.type === 'security';

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Avatar name={user?.name ?? t('staff.profile.title')} size={72} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user ? (
            <View style={styles.badges}>
              <RoleBadge role={user.type} />
            </View>
          ) : null}
        </View>

        <Text style={styles.section}>{t('exhibitor.dashboard.sectionTools')}</Text>
        <Card elevated style={styles.menuCard}>
          <MenuRow icon="scan-outline" label={t('scanner.title')} onPress={() => router.push('/(staff)/scanner')} />
          {!isSecurity && (
            <>
              <View style={styles.divider} />
              <MenuRow icon="print-outline" label={t('printStation.title')} onPress={() => router.push('/(staff)/print-station' as never)} />
              <View style={styles.divider} />
              <MenuRow icon="qr-code-outline" label={t('badge.title')} onPress={() => router.push('/(staff)/badge' as never)} />
              <View style={styles.divider} />
              <MenuRow icon="card-outline" label={t('staff.payments')} onPress={() => router.push('/(staff)/payments')} />
              <View style={styles.divider} />
              <MenuRow icon="notifications-outline" label={t('staff.alerts.title')} onPress={() => router.push('/(staff)/alerts')} />
              <View style={styles.divider} />
              <MenuRow icon="people-outline" label={t('staff.users')} onPress={() => router.push('/(staff)/users')} />
            </>
          )}
        </Card>

        <MenuRow icon="log-out-outline" label={t('profile.signOut')} onPress={confirmSignOut} accent={colors.danger} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.lg, paddingTop: spacing.md },
  name: { fontSize: 22, fontFamily: fonts.display, color: colors.text, marginTop: spacing.md },
  email: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  section: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  menuCard: { paddingVertical: spacing.xs, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 56 },
});
