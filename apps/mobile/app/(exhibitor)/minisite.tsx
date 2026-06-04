import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { fetchExhibitorStand, fetchMiniSite, toggleMiniSitePublish, updateExhibitorStandLite } from '../../src/api/minisite';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

export default function ExhibitorMiniSiteScreen() {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [siteId, setSiteId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [exhibitorId, setExhibitorId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const stand = await fetchExhibitorStand(user.id);
    const site = await fetchMiniSite(user.id);
    if (stand) {
      setExhibitorId(stand.id);
      setDescription(stand.description ?? '');
      setEmail(stand.contactEmail ?? '');
      setPhone(stand.contactPhone ?? '');
    }
    if (site) {
      setSiteId(site.id);
      setPublished(site.isPublished);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!exhibitorId) return;
    try {
      await updateExhibitorStandLite(exhibitorId, { description, contactEmail: email, contactPhone: phone });
      Alert.alert('Enregistré', 'Fiche stand mise à jour');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Sauvegarde impossible');
    }
  };

  const togglePublish = async () => {
    if (!siteId) {
      Alert.alert('Mini-site', 'Créez votre mini-site sur le web pour activer la publication.');
      return;
    }
    try {
      await toggleMiniSitePublish(siteId, !published);
      setPublished(!published);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Publication impossible');
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenTitle title="Mini-site (édition légère)" subtitle="Description et contacts" />
        <Input label="Description" value={description} onChangeText={setDescription} multiline />
        <Input label="Email contact" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <PrimaryButton label="Enregistrer" onPress={save} />
        <Text style={styles.hint}>Éditeur complet disponible sur urbaevent.com</Text>
        {siteId && (
          <PrimaryButton
            label={published ? 'Dépublier le mini-site' : 'Publier le mini-site'}
            onPress={togglePublish}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md, fontSize: 13 },
});
