import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import {
  ensureExhibitorStand,
  fetchMiniSite,
  toggleMiniSitePublish,
  updateExhibitorStandLite,
} from '../../src/api/minisite';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { supabaseErrorMessage } from '../../src/lib/supabaseError';
import { colors, spacing } from '../../src/theme';

export default function ExhibitorMiniSiteScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [siteId, setSiteId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [exhibitorId, setExhibitorId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const stand = await ensureExhibitorStand(user.id, {
        companyName: user.name,
        email: user.email,
      });
      setExhibitorId(stand.id);
      setDescription(stand.description ?? '');
      setEmail(stand.contactEmail ?? user.email ?? '');
      setPhone(stand.contactPhone ?? '');

      const site = await fetchMiniSite(user.id);
      if (site) {
        setSiteId(site.id);
        setPublished(site.isPublished);
      }
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('common.error')));
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!exhibitorId) {
      Alert.alert(t('common.error'), t('exhibitor.minisite.noStand'));
      return;
    }
    setSaving(true);
    try {
      await updateExhibitorStandLite(exhibitorId, { description, contactEmail: email, contactPhone: phone });
      Alert.alert(t('exhibitor.profile.saved'), t('exhibitor.minisite.savedBody'));
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('exhibitor.minisite.saveFailed')));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!siteId) {
      Alert.alert(t('exhibitor.minisite.title'), t('exhibitor.minisite.createOnWeb'));
      return;
    }
    try {
      await toggleMiniSitePublish(siteId, !published);
      setPublished(!published);
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('exhibitor.minisite.publishFailed')));
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenTitle title={t('exhibitor.minisite.title')} subtitle={t('exhibitor.minisite.subtitle')} />
        <Input label={t('exhibitor.profile.description')} value={description} onChangeText={setDescription} multiline />
        <Input label={t('exhibitor.minisite.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label={t('exhibitor.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <PrimaryButton label={t('common.save')} onPress={save} loading={saving} />
        {exhibitorId ? (
          <PrimaryButton
            label={t('exhibitor.dashboard.minisite')}
            variant="outline"
            onPress={() => router.push(`/minisite/${exhibitorId}?preview=1` as never)}
          />
        ) : null}
        <Text style={styles.hint}>{t('exhibitor.minisite.webHint')}</Text>
        {siteId ? (
          <PrimaryButton
            label={published ? t('exhibitor.minisite.unpublish') : t('exhibitor.minisite.publish')}
            onPress={togglePublish}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md, fontSize: 13 },
});
