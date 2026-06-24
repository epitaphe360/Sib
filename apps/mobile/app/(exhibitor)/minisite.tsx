import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  ensureMiniSiteRow,
  fetchMiniSiteEditor,
  saveMiniSiteEditor,
  type MiniSiteEditorDraft,
} from '../../src/api/minisiteEditor';
import { fetchMiniSiteProducts } from '../../src/api/minisiteProducts';
import { Input, PrimaryButton, Screen } from '../../src/components/ui';
import { WorkspaceHeader, WorkspaceSectionTitle } from '../../src/components/workspace/WorkspaceUI';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { isCollaboratorUser } from '../../src/lib/collaboratorRole';
import { supabaseErrorMessage } from '../../src/lib/supabaseError';
import { colors, fonts, spacing } from '../../src/theme';

function patchDraft(prev: MiniSiteEditorDraft, patch: Partial<MiniSiteEditorDraft>): MiniSiteEditorDraft {
  return { ...prev, ...patch };
}

export default function ExhibitorMiniSiteScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [draft, setDraft] = useState<MiniSiteEditorDraft | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user || isCollaboratorUser(user)) return;
    setLoading(true);
    try {
      let data = await fetchMiniSiteEditor(user.id);
      if (!data) {
        Alert.alert(t('common.error'), t('exhibitor.minisite.noStand'));
        return;
      }
      if (!data.siteId) {
        const siteId = await ensureMiniSiteRow(data.exhibitorId, data.companyName, data.description);
        data = { ...data, siteId };
      }
      setDraft(data);
      setProductCount((await fetchMiniSiteProducts(data.exhibitorId)).length);
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('common.error')));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const { siteId } = await saveMiniSiteEditor(draft);
      setDraft((prev) => (prev ? { ...prev, siteId } : prev));
      Alert.alert(t('exhibitor.profile.saved'), t('exhibitor.minisite.savedBody'));
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('exhibitor.minisite.saveFailed')));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return (
      <Screen style={styles.flex}>
        <Text style={styles.loading}>{t('common.loading')}</Text>
      </Screen>
    );
  }

  const set = (patch: Partial<MiniSiteEditorDraft>) => setDraft((prev) => (prev ? patchDraft(prev, patch) : prev));

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <WorkspaceHeader
          eyebrow={t('exhibitor.minisite.title')}
          title={draft.companyName}
          subtitle={t('exhibitor.minisite.subtitleFull')}
          tone="exhibitor"
          icon="globe-outline"
          status={draft.published ? t('exhibitor.dashboard.published') : t('appointments.status.pending')}
        />

        <View style={styles.body}>
          <View style={[styles.publishRow, { borderColor: colors.border }]}>
            <View style={styles.publishCopy}>
              <Text style={styles.publishTitle}>{t('exhibitor.minisite.publish')}</Text>
              <Text style={styles.publishHint}>{t('exhibitor.minisite.publishHint')}</Text>
            </View>
            <Switch
              value={draft.published}
              onValueChange={(published) => set({ published })}
              trackColor={{ false: colors.border, true: colors.gold }}
            />
          </View>

          <WorkspaceSectionTitle>{t('exhibitor.minisite.sectionGeneral')}</WorkspaceSectionTitle>
          <Input label={t('exhibitor.profile.description')} value={draft.description} onChangeText={(description) => set({ description })} multiline numberOfLines={4} />
          <Input label={t('minisite.website')} value={draft.website} onChangeText={(website) => set({ website })} keyboardType="url" autoCapitalize="none" />
          <Input label={t('exhibitor.minisite.logoUrl')} value={draft.logoUrl} onChangeText={(logoUrl) => set({ logoUrl })} keyboardType="url" autoCapitalize="none" />

          <WorkspaceSectionTitle>{t('exhibitor.minisite.sectionHero')}</WorkspaceSectionTitle>
          <Input label={t('exhibitor.minisite.heroTitle')} value={draft.heroTitle} onChangeText={(heroTitle) => set({ heroTitle })} />
          <Input label={t('exhibitor.minisite.heroSubtitle')} value={draft.heroSubtitle} onChangeText={(heroSubtitle) => set({ heroSubtitle })} multiline numberOfLines={3} />
          <Input label={t('exhibitor.minisite.heroBackground')} value={draft.heroBackgroundImage} onChangeText={(heroBackgroundImage) => set({ heroBackgroundImage })} keyboardType="url" autoCapitalize="none" />
          <Input label={t('exhibitor.minisite.heroCtaText')} value={draft.heroCtaText} onChangeText={(heroCtaText) => set({ heroCtaText })} />
          <Input label={t('exhibitor.minisite.heroCtaLink')} value={draft.heroCtaLink} onChangeText={(heroCtaLink) => set({ heroCtaLink })} autoCapitalize="none" />

          <WorkspaceSectionTitle>{t('exhibitor.minisite.sectionAbout')}</WorkspaceSectionTitle>
          <Input label={t('exhibitor.minisite.aboutTitle')} value={draft.aboutTitle} onChangeText={(aboutTitle) => set({ aboutTitle })} />
          <Input label={t('exhibitor.minisite.aboutDescription')} value={draft.aboutDescription} onChangeText={(aboutDescription) => set({ aboutDescription })} multiline numberOfLines={5} />
          <Input label={t('exhibitor.minisite.aboutFeatures')} value={draft.aboutFeatures} onChangeText={(aboutFeatures) => set({ aboutFeatures })} multiline numberOfLines={4} placeholder={t('exhibitor.minisite.featuresPlaceholder')} />

          <WorkspaceSectionTitle>{t('exhibitor.minisite.sectionContact')}</WorkspaceSectionTitle>
          <Input label={t('exhibitor.minisite.contactTitle')} value={draft.contactSectionTitle} onChangeText={(contactSectionTitle) => set({ contactSectionTitle })} />
          <Input label={t('exhibitor.minisite.email')} value={draft.contactEmail} onChangeText={(contactEmail) => set({ contactEmail })} keyboardType="email-address" autoCapitalize="none" />
          <Input label={t('exhibitor.phone')} value={draft.contactPhone} onChangeText={(contactPhone) => set({ contactPhone })} keyboardType="phone-pad" />
          <Input label={t('minisite.address')} value={draft.contactAddress} onChangeText={(contactAddress) => set({ contactAddress })} multiline numberOfLines={2} />
          <Input label={t('exhibitor.minisite.socialLinkedin')} value={draft.socialLinkedin} onChangeText={(socialLinkedin) => set({ socialLinkedin })} keyboardType="url" autoCapitalize="none" />
          <Input label={t('exhibitor.minisite.socialFacebook')} value={draft.socialFacebook} onChangeText={(socialFacebook) => set({ socialFacebook })} keyboardType="url" autoCapitalize="none" />
          <Input label={t('exhibitor.minisite.socialInstagram')} value={draft.socialInstagram} onChangeText={(socialInstagram) => set({ socialInstagram })} keyboardType="url" autoCapitalize="none" />

          <WorkspaceSectionTitle>{t('exhibitor.minisite.sectionGallery')}</WorkspaceSectionTitle>
          <Input label={t('exhibitor.minisite.galleryTitle')} value={draft.galleryTitle} onChangeText={(galleryTitle) => set({ galleryTitle })} />
          <Input label={t('exhibitor.minisite.galleryImages')} value={draft.galleryImages} onChangeText={(galleryImages) => set({ galleryImages })} multiline numberOfLines={4} placeholder={t('exhibitor.minisite.galleryPlaceholder')} />

          <WorkspaceSectionTitle>{t('exhibitor.minisite.sectionProducts')}</WorkspaceSectionTitle>
          <Input label={t('exhibitor.minisite.productsSectionTitle')} value={draft.productsSectionTitle} onChangeText={(productsSectionTitle) => set({ productsSectionTitle })} />
          <PrimaryButton
            label={t('exhibitor.minisite.manageProducts', { count: productCount })}
            variant="outline"
            onPress={() => router.push('/(exhibitor)/minisite-products' as never)}
          />

          <WorkspaceSectionTitle>{t('exhibitor.minisite.sectionTheme')}</WorkspaceSectionTitle>
          <Input label={t('exhibitor.minisite.colorPrimary')} value={draft.primaryColor} onChangeText={(primaryColor) => set({ primaryColor })} autoCapitalize="none" />
          <Input label={t('exhibitor.minisite.colorSecondary')} value={draft.secondaryColor} onChangeText={(secondaryColor) => set({ secondaryColor })} autoCapitalize="none" />
          <Input label={t('exhibitor.minisite.colorAccent')} value={draft.accentColor} onChangeText={(accentColor) => set({ accentColor })} autoCapitalize="none" />

          <View style={styles.actions}>
            <PrimaryButton label={t('common.save')} onPress={save} loading={saving} />
            <PrimaryButton
              label={t('exhibitor.dashboard.minisite')}
              variant="outline"
              onPress={() => router.push(`/minisite/${draft.exhibitorId}?preview=1` as never)}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  loading: { textAlign: 'center', marginTop: spacing.xl, fontFamily: fonts.body, color: colors.textMuted },
  body: { paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: -spacing.sm },
  publishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  publishCopy: { flex: 1, paddingRight: spacing.sm },
  publishTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  publishHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  actions: { gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
});
