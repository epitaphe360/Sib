import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { fetchExhibitorStand } from '../../src/api/minisite';
import { deleteMiniSiteProduct, fetchMiniSiteProducts, saveMiniSiteProduct, type ProductDraft } from '../../src/api/minisiteProducts';
import { Input, PrimaryButton, Screen } from '../../src/components/ui';
import { WorkspaceHeader, WorkspaceSectionTitle } from '../../src/components/workspace/WorkspaceUI';
import { useAuth } from '../../src/context/AuthContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { isCollaboratorUser } from '../../src/lib/collaboratorRole';
import { fonts, radius, spacing } from '../../src/theme';
import type { MiniSiteProduct } from '../../src/types/minisite';

const EMPTY: ProductDraft = {
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  price: '',
  specifications: '',
  featured: false,
};

export default function MiniSiteProductsScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { colors } = useAppTheme();
  const [exhibitorId, setExhibitorId] = useState('');
  const [products, setProducts] = useState<MiniSiteProduct[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY);
  const [editingId, setEditingId] = useState<string>();
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user || isCollaboratorUser(user)) return;
    const stand = await fetchExhibitorStand(user.id);
    if (!stand) throw new Error(t('exhibitor.minisite.noStand'));
    setExhibitorId(stand.id);
    setProducts(await fetchMiniSiteProducts(stand.id));
  }, [user, t]);

  useEffect(() => {
    load().catch((error) => Alert.alert(t('common.error'), error instanceof Error ? error.message : t('common.error')));
  }, [load, t]);

  const edit = (product: MiniSiteProduct) => {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      description: product.description,
      category: product.category ?? '',
      imageUrl: product.images[0] ?? '',
      price: product.price == null ? '' : String(product.price),
      specifications: product.specifications ?? '',
      featured: product.featured === true,
    });
  };

  const save = async () => {
    if (!exhibitorId || !draft.name.trim() || !draft.description.trim()) {
      Alert.alert(t('common.error'), t('exhibitor.minisite.productRequired'));
      return;
    }
    setSaving(true);
    try {
      await saveMiniSiteProduct(exhibitorId, draft, editingId);
      setDraft(EMPTY);
      setEditingId(undefined);
      await load();
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('exhibitor.minisite.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <WorkspaceHeader
          eyebrow={t('exhibitor.minisite.title')}
          title={t('exhibitor.minisite.productsTitle')}
          subtitle={t('exhibitor.minisite.productsSubtitle')}
          tone="exhibitor"
          icon="cube-outline"
          status={t('exhibitor.minisite.manageProducts', { count: products.length })}
        />

        <View style={styles.body}>
          {products.length ? <WorkspaceSectionTitle>{t('exhibitor.minisite.productsPublished')}</WorkspaceSectionTitle> : null}
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => edit(product)}
              style={[
                styles.product,
                { backgroundColor: colors.surface, borderColor: editingId === product.id ? colors.gold : colors.cardBorder },
              ]}
            >
              {product.images[0] ? (
                <Image source={{ uri: product.images[0] }} style={styles.image} />
              ) : (
                <View style={[styles.image, { backgroundColor: colors.background }]} />
              )}
              <View style={styles.productCopy}>
                <Text numberOfLines={1} style={[styles.productName, { color: colors.text }]}>
                  {product.name}
                </Text>
                <Text numberOfLines={1} style={[styles.productMeta, { color: colors.textMuted }]}>
                  {product.category ?? t('exhibitor.minisite.productGeneral')}
                  {product.price != null ? ` · ${product.price}` : ''}
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert(t('exhibitor.minisite.productDeleteTitle'), product.name, [
                    { text: t('common.cancel') },
                    {
                      text: t('common.delete'),
                      style: 'destructive',
                      onPress: async () => {
                        await deleteMiniSiteProduct(exhibitorId, product.id);
                        await load();
                      },
                    },
                  ])
                }
              >
                <Text style={{ color: colors.danger, fontFamily: fonts.bodyBold }}>{t('common.delete')}</Text>
              </Pressable>
            </Pressable>
          ))}

          <WorkspaceSectionTitle>
            {editingId ? t('exhibitor.minisite.productEdit') : t('exhibitor.minisite.productAdd')}
          </WorkspaceSectionTitle>
          <Input label={t('exhibitor.minisite.productName')} value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} />
          <Input label={t('exhibitor.minisite.productDescription')} value={draft.description} onChangeText={(description) => setDraft({ ...draft, description })} multiline numberOfLines={4} />
          <Input label={t('exhibitor.minisite.productCategory')} value={draft.category} onChangeText={(category) => setDraft({ ...draft, category })} />
          <Input label={t('exhibitor.minisite.productImage')} value={draft.imageUrl} onChangeText={(imageUrl) => setDraft({ ...draft, imageUrl })} keyboardType="url" autoCapitalize="none" />
          <Input label={t('exhibitor.minisite.productPrice')} value={draft.price} onChangeText={(price) => setDraft({ ...draft, price })} keyboardType="decimal-pad" />
          <Input label={t('minisite.specs')} value={draft.specifications} onChangeText={(specifications) => setDraft({ ...draft, specifications })} multiline numberOfLines={3} />
          <View style={[styles.featured, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <View style={styles.productCopy}>
              <Text style={[styles.productName, { color: colors.text }]}>{t('exhibitor.minisite.productFeatured')}</Text>
              <Text style={[styles.productMeta, { color: colors.textMuted }]}>{t('exhibitor.minisite.productFeaturedHint')}</Text>
            </View>
            <Switch value={draft.featured} onValueChange={(featured) => setDraft({ ...draft, featured })} trackColor={{ false: colors.border, true: colors.gold }} />
          </View>
          <View style={styles.actions}>
            <PrimaryButton
              label={editingId ? t('exhibitor.minisite.productSaveEdit') : t('exhibitor.minisite.productSaveAdd')}
              onPress={save}
              loading={saving}
            />
            {editingId ? (
              <PrimaryButton
                label={t('common.cancel')}
                variant="ghost"
                onPress={() => {
                  setEditingId(undefined);
                  setDraft(EMPTY);
                }}
              />
            ) : null}
            <PrimaryButton label={t('common.back')} variant="outline" onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  body: { paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: -spacing.sm },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 10,
    marginBottom: 8,
  },
  image: { width: 46, height: 46, borderRadius: 10 },
  productCopy: { flex: 1, minWidth: 0 },
  productName: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  productMeta: { fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  featured: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, padding: 12 },
  actions: { gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
});
