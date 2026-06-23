import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { MenuRow, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useSignOut } from '../../../src/hooks/useSignOut';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { ROLE_LABELS } from '../../../src/navigation/roleConfig';
import { colors, fonts, spacing } from '../../../src/theme';

export default function StaffProfileScreen() {
  const { user } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { t } = useI18n();
  const isSecurity = user?.type === 'security';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('staff.profile.title')} subtitle={user?.email} />
        <Text style={styles.row}>{user ? ROLE_LABELS[user.type] : ''}</Text>

        <MenuRow icon="scan-outline" label={t('scanner.title')} onPress={() => router.push('/(staff)/scanner')} />
        <MenuRow icon="print-outline" label={t('printStation.title')} onPress={() => router.push('/(staff)/print-station' as never)} />
        <MenuRow icon="qr-code-outline" label={t('badge.title')} onPress={() => router.push('/(staff)/badge' as never)} />
        {!isSecurity && (
          <>
            <MenuRow icon="card-outline" label={t('staff.payments')} onPress={() => router.push('/(staff)/payments')} />
            <MenuRow icon="notifications-outline" label={t('staff.alerts.title')} onPress={() => router.push('/(staff)/alerts')} />
            <MenuRow icon="people-outline" label={t('staff.users')} onPress={() => router.push('/(staff)/users')} />
          </>
        )}

        <PrimaryButton label={t('profile.signOut')} variant="outline" onPress={confirmSignOut} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  row: { marginBottom: spacing.md, fontSize: 15, fontFamily: fonts.body, color: colors.text },
});
