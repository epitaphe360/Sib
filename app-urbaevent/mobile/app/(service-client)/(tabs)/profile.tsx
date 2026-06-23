import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useSignOut } from '../../../src/hooks/useSignOut';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { SALON_INFO } from '../../../src/data/salons';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function ServiceClientProfileScreen() {
  const { user } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { t } = useI18n();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Mon profil" subtitle={`Service Clientèle · ${SALON_INFO.name}`} />

        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>Service Clientèle</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Email" value={user?.email ?? '—'} />
          <InfoRow label="Rôle" value="Service Clientèle" />
          <InfoRow label="Salon" value={SALON_INFO.name} />
        </View>

        <PrimaryButton
          label="Scanner la station impression"
          variant="outline"
          onPress={() => router.push('/(service-client)/print-station' as never)}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton label={t('common.signOut')} variant="outline" onPress={confirmSignOut} />
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBlock: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0E7490',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: '#fff', fontFamily: fonts.display, fontSize: 32 },
  name: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.text, marginBottom: 4 },
  email: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  roleChip: { backgroundColor: '#0E7490', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  roleChipText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 12 },
  infoCard: { marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.textMuted },
  infoValue: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
});
