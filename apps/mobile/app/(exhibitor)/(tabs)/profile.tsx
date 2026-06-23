import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { fetchExhibitorStand, updateExhibitorStandLite } from '../../../src/api/minisite';
import { supabaseErrorMessage } from '../../../src/lib/supabaseError';
import { isCollaboratorUser } from '../../../src/lib/collaboratorRole';
import { Card, Input, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useSignOut } from '../../../src/hooks/useSignOut';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { ROLE_LABELS } from '../../../src/navigation/roleConfig';
import { colors, spacing } from '../../../src/theme';

export default function ExhibitorProfileScreen() {
  const { user } = useAuth();
  const { confirmSignOut } = useSignOut();
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [standId, setStandId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && isCollaboratorUser(user)) {
      router.replace('/(visitor)/(tabs)/badge' as never);
    }
  }, [user]);

  const load = useCallback(async () => {
    if (!user || isCollaboratorUser(user)) return;
    try {
      const stand = await fetchExhibitorStand(user.id);
      if (!stand) return;
      setStandId(stand.id);
      setDescription(stand.description ?? '');
      setContactEmail(stand.contactEmail ?? user.email ?? '');
      setContactPhone(stand.contactPhone ?? '');
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('common.error')));
    }
  }, [user]);

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

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenTitle title={t('exhibitor.profile.title')} subtitle={user?.email} />
        <Card>
          <Text style={styles.row}>
            {t('exhibitor.profile.name')} : {user?.name}
          </Text>
          <Text style={styles.row}>
            {t('exhibitor.profile.role')} : {user ? ROLE_LABELS[user.type] : '—'}
          </Text>
        </Card>
        {standId ? (
          <Card>
            <Input label={t('exhibitor.profile.description')} value={description} onChangeText={setDescription} multiline />
            <Input label="Email" value={contactEmail} onChangeText={setContactEmail} autoCapitalize="none" />
            <Input label={t('exhibitor.phone')} value={contactPhone} onChangeText={setContactPhone} />
            <PrimaryButton label={t('exhibitor.profile.save')} onPress={save} loading={saving} />
          </Card>
        ) : null}
        <PrimaryButton label={t('profile.signOut')} onPress={confirmSignOut} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { fontSize: 15, color: colors.text, marginBottom: spacing.sm },
});
