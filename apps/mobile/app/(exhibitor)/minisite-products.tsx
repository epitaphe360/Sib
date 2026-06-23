import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { fetchExhibitorStand } from '../../src/api/minisite';
import { deleteMiniSiteProduct, fetchMiniSiteProducts, saveMiniSiteProduct, type ProductDraft } from '../../src/api/minisiteProducts';
import { Input, PrimaryButton, Screen } from '../../src/components/ui';
import { WorkspaceHeader, WorkspaceSectionTitle } from '../../src/components/workspace/WorkspaceUI';
import { useAuth } from '../../src/context/AuthContext';
import { isCollaboratorUser } from '../../src/lib/collaboratorRole';
import { useAppTheme } from '../../src/context/ThemeContext';
import { fonts, radius, spacing } from '../../src/theme';
import type { MiniSiteProduct } from '../../src/types/minisite';

const EMPTY: ProductDraft = { name: '', description: '', category: '', imageUrl: '', price: '', specifications: '', featured: false };

export default function MiniSiteProductsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [exhibitorId, setExhibitorId] = useState('');
  const [products, setProducts] = useState<MiniSiteProduct[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY);
  const [editingId, setEditingId] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && isCollaboratorUser(user)) {
      router.replace('/(visitor)/(tabs)/badge' as never);
    }
  }, [user]);

  const load = useCallback(async () => {
    if (!user || isCollaboratorUser(user)) return;
    const stand = await fetchExhibitorStand(user.id);
    if (!stand) {
      throw new Error('Stand exposant introuvable — contactez l\'organisation');
    }
    setExhibitorId(stand.id);
    setProducts(await fetchMiniSiteProducts(stand.id));
  }, [user]);
  useEffect(() => { load().catch((error) => Alert.alert('Catalogue', error.message)); }, [load]);

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
      Alert.alert('Informations requises', 'Le nom et la description sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await saveMiniSiteProduct(exhibitorId, draft, editingId);
      setDraft(EMPTY);
      setEditingId(undefined);
      await load();
    } catch (error) {
      Alert.alert('Catalogue', error instanceof Error ? error.message : 'Enregistrement impossible');
    } finally { setSaving(false); }
  };

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <WorkspaceHeader eyebrow="Mini-site exposant" title="Catalogue produits" subtitle="Ajoute les solutions qui seront présentées aux visiteurs." tone="exhibitor" icon="cube-outline" status={`${products.length} produit${products.length > 1 ? 's' : ''}`} />

        {products.length ? <WorkspaceSectionTitle>Produits publiés</WorkspaceSectionTitle> : null}
        {products.map((product) => (
          <Pressable key={product.id} onPress={() => edit(product)} style={[styles.product, { backgroundColor: colors.surface, borderColor: editingId === product.id ? colors.gold : colors.cardBorder }]}>
            {product.images[0] ? <Image source={{ uri: product.images[0] }} style={styles.image} /> : <View style={[styles.image, { backgroundColor: colors.background }]} />}
            <View style={styles.productCopy}>
              <Text numberOfLines={1} style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
              <Text numberOfLines={1} style={[styles.productMeta, { color: colors.textMuted }]}>{product.category ?? 'Général'}{product.price != null ? ` · ${product.price}` : ''}</Text>
            </View>
            <Pressable onPress={() => Alert.alert('Supprimer ce produit ?', product.name, [{ text: 'Annuler' }, { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteMiniSiteProduct(exhibitorId, product.id); await load(); } }])}>
              <Text style={{ color: colors.danger, fontFamily: fonts.bodyBold }}>Supprimer</Text>
            </Pressable>
          </Pressable>
        ))}

        <WorkspaceSectionTitle>{editingId ? 'Modifier le produit' : 'Ajouter un produit'}</WorkspaceSectionTitle>
        <Input label="Nom du produit" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} />
        <Input label="Description" value={draft.description} onChangeText={(description) => setDraft({ ...draft, description })} multiline numberOfLines={4} />
        <Input label="Catégorie" value={draft.category} onChangeText={(category) => setDraft({ ...draft, category })} />
        <Input label="Image (URL)" value={draft.imageUrl} onChangeText={(imageUrl) => setDraft({ ...draft, imageUrl })} keyboardType="url" autoCapitalize="none" />
        <Input label="Prix indicatif" value={draft.price} onChangeText={(price) => setDraft({ ...draft, price })} keyboardType="decimal-pad" />
        <Input label="Spécifications" value={draft.specifications} onChangeText={(specifications) => setDraft({ ...draft, specifications })} multiline numberOfLines={3} />
        <View style={[styles.featured, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <View style={styles.productCopy}>
            <Text style={[styles.productName, { color: colors.text }]}>Mettre en avant</Text>
            <Text style={[styles.productMeta, { color: colors.textMuted }]}>Ce produit apparaîtra en priorité.</Text>
          </View>
          <Switch value={draft.featured} onValueChange={(featured) => setDraft({ ...draft, featured })} trackColor={{ false: colors.border, true: colors.gold }} />
        </View>
        <View style={styles.actions}>
          <PrimaryButton label={editingId ? 'Enregistrer les modifications' : 'Ajouter au catalogue'} onPress={save} loading={saving} />
          {editingId ? <PrimaryButton label="Annuler la modification" variant="ghost" onPress={() => { setEditingId(undefined); setDraft(EMPTY); }} /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, scroll: { paddingBottom: 24 },
  product: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.lg, padding: 10, marginBottom: 8 },
  image: { width: 46, height: 46, borderRadius: 10 },
  productCopy: { flex: 1, minWidth: 0 },
  productName: { fontFamily: fonts.bodySemiBold, fontSize: 13 },
  productMeta: { fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  featured: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, padding: 12 },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
