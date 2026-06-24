import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchExhibitorStand, updateExhibitorStandLite } from '../../../src/api/minisite';
import { supabaseErrorMessage } from '../../../src/lib/supabaseError';
import { isCollaboratorUser } from '../../../src/lib/collaboratorRole';
import { Avatar, Card, Input, MenuRow, PrimaryButton, RoleBadge, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useSignOut } from '../../../src/hooks/useSignOut';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function ExhibitorProfileScreen() {
  const { user } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [standId, setStandId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user || isCollaboratorUser(user)) return;
    try {
      const stand = await fetchExhibitorStand(user.id);
      if (!stand) return;
      setStandId(stand.id);
      setCompanyName(stand.companyName);
      setDescription(stand.description ?? '');
      setContactEmail(stand.contactEmail ?? user.email ?? '');
      setContactPhone(stand.contactPhone ?? '');
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('common.error')));
    }
  }, [user, t]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!standId) {
      Alert.alert(t('common.error'), t('exhibitor.minisite.noStand'));
      return;
    }
    setSaving(true);
    try {
      await updateExhibitorStandLite(standId, { description, contactEmail, contactPhone });
      Alert.alert(t('exhibitor.profile.saved'), t('exhibitor.minisite.savedBody'));
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('exhibitor.minisite.saveFailed')));
    } finally {
      setSaving(false);
    }
  };

  const displayName = companyName || user?.name || t('tabs.stand');

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Avatar name={displayName} size={72} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user ? (
            <View style={styles.badges}>
              <RoleBadge role={user.type} />
            </View>
          ) : null}
        </View>

        <Text style={styles.section}>{t('exhibitor.dashboard.sectionTools')}</Text>
        <Card elevated style={styles.menuCard}>
          <MenuRow icon="create-outline" label={t('exhibitor.dashboard.editMinisite')} onPress={() => router.push('/(exhibitor)/minisite' as never)} />
          <View style={styles.divider} />
          <MenuRow icon="cube-outline" label={t('exhibitor.dashboard.products')} onPress={() => router.push('/(exhibitor)/minisite-products' as never)} />
          <View style={styles.divider} />
          <MenuRow icon="bar-chart-outline" label={t('exhibitor.analytics.title')} onPress={() => router.push('/(exhibitor)/analytics' as never)} />
          <View style={styles.divider} />
          <MenuRow icon="person-add-outline" label={t('team.title')} onPress={() => router.push('/(exhibitor)/team' as never)} />
        </Card>

        {standId ? (
          <>
            <Text style={styles.section}>{t('exhibitor.profile.title')}</Text>
            <Card elevated style={styles.formCard}>
              <Input label={t('exhibitor.profile.description')} value={description} onChangeText={setDescription} multiline />
              <Input label={t('exhibitor.minisite.email')} value={contactEmail} onChangeText={setContactEmail} autoCapitalize="none" keyboardType="email-address" />
              <Input label={t('exhibitor.phone')} value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
              <PrimaryButton label={t('exhibitor.profile.save')} onPress={save} loading={saving} />
            </Card>
          </>
        ) : null}

        <MenuRow icon="log-out-outline" label={t('profile.signOut')} onPress={confirmSignOut} accent={colors.danger} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.lg, paddingTop: spacing.md },
  name: { fontSize: 22, fontFamily: fonts.display, color: colors.text, marginTop: spacing.md, textAlign: 'center' },
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
  formCard: { gap: spacing.sm },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 56 },
});
