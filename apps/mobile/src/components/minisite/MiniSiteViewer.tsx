import React, { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useI18n } from '../../i18n/I18nProvider';
import { pickLocalizedStringList, pickLocalizedText } from '../../lib/localizedContent';
import type { MiniSitePublicData, MiniSiteProduct, MiniSiteSection } from '../../types/minisite';
import { colors, fonts, radius, shadows, spacing } from '../../theme';

type Props = {
  data: MiniSitePublicData;
};

function sectionByType(sections: MiniSiteSection[], type: MiniSiteSection['type']) {
  return sections.find((s) => s.type === type && s.visible !== false);
}

function productText(product: MiniSiteProduct, field: 'name' | 'description', locale: 'fr' | 'en' | 'ar'): string {
  return (
    pickLocalizedText(
      {
        name: product.name,
        name_en: product.nameEn,
        name_ar: product.nameAr,
        description: product.description,
        description_en: product.descriptionEn,
        description_ar: product.descriptionAr,
      },
      field,
      locale,
    ) ?? (field === 'name' ? product.name : product.description)
  );
}

function featureLabels(content?: Record<string, unknown>, locale: 'fr' | 'en' | 'ar' = 'fr'): string[] {
  const localized = pickLocalizedStringList(content, 'features', locale);
  if (localized.length) return localized;
  const raw = content?.features ?? content?.values ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => (typeof f === 'string' ? f : (f as { name?: string; title?: string })?.name ?? (f as { title?: string })?.title ?? ''))
    .filter((f) => f.trim());
}

function SafeImage({ uri, style, letter }: { uri?: string; style: object; letter?: string }) {
  const [error, setError] = useState(false);
  if (!uri || error) {
    return (
      <View style={[style, styles.imageFallback]}>
        <Text style={styles.imageFallbackText}>{letter ?? '?'}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setError(true)} />;
}

export function MiniSiteViewer({ data }: Props) {
  const { t, locale } = useI18n();
  const { miniSite, exhibitor, products } = data;
  const theme = miniSite.theme;
  const hero = sectionByType(miniSite.sections, 'hero');
  const about = sectionByType(miniSite.sections, 'about');
  const productsSection = sectionByType(miniSite.sections, 'products');
  const gallery = sectionByType(miniSite.sections, 'gallery');
  const contact = sectionByType(miniSite.sections, 'contact');
  const exhibitorDescription =
    pickLocalizedText(
      {
        description: exhibitor.description,
        description_en: exhibitor.descriptionEn,
        description_ar: exhibitor.descriptionAr,
      },
      'description',
      locale,
    ) ?? exhibitor.description;
  const features = featureLabels(about?.content, locale);
  const [selectedProduct, setSelectedProduct] = useState<MiniSiteProduct | null>(null);

  const heroTitle =
    pickLocalizedText(hero?.content, 'title', locale) ?? exhibitor.companyName;
  const heroSubtitle =
    exhibitorDescription ??
    pickLocalizedText(hero?.content, 'subtitle', locale) ??
    pickLocalizedText(hero?.content, 'description', locale) ??
    t('minisite.defaultSubtitle');
  const logoUrl = miniSite.logoUrl ?? exhibitor.logoUrl;
  const bgImage = asStr(hero?.content?.backgroundImage);
  const contactInfo = exhibitor.contactInfo;
  const social = contactInfo.social ?? {};

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        {bgImage ? (
          <>
            <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <View style={styles.heroOverlay} />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.primaryColor }]} />
        )}
        <View style={styles.heroContent}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.heroLogo} resizeMode="contain" />
          ) : (
            <View style={[styles.heroLogo, styles.imageFallback]}>
              <Text style={styles.heroLogoLetter}>{exhibitor.companyName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('minisite.officialBadge')}</Text>
          </View>
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          {asStr(hero?.content?.ctaText) ? (
            <Pressable
              style={[styles.heroCta, { backgroundColor: theme.accentColor }]}
              onPress={() => {
                const link = asStr(hero?.content?.ctaLink);
                if (link && link.startsWith('http')) Linking.openURL(link);
              }}
            >
              <Text style={styles.heroCtaText}>{asStr(hero?.content?.ctaText)}</Text>
            </Pressable>
          ) : null}
          {(exhibitor.standNumber || exhibitor.hallNumber) && (
            <Text style={styles.heroMeta}>
              {[exhibitor.standNumber && `${t('exhibitor.standNumber')} ${exhibitor.standNumber}`, exhibitor.hallNumber && `${t('exhibitor.hallNumber')} ${exhibitor.hallNumber}`]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionKicker, { color: theme.accentColor }]}>{t('minisite.about')}</Text>
        <Text style={styles.sectionTitle}>
          {pickLocalizedText(about?.content, 'title', locale) ?? t('minisite.expertise')}
        </Text>
        <Text style={styles.sectionBody}>
          {exhibitorDescription ??
            pickLocalizedText(about?.content, 'description', locale) ??
            pickLocalizedText(about?.content, 'text', locale) ??
            t('minisite.aboutFallback')}
        </Text>

        {features.length > 0 && (
          <View style={styles.featuresGrid}>
            {features.map((f) => (
              <View key={f} style={[styles.featureCard, { borderColor: `${theme.primaryColor}22` }]}>
                <View style={[styles.featureDot, { backgroundColor: theme.primaryColor }]} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        {Array.isArray(about?.content?.stats) && (about.content.stats as unknown[]).length > 0 && (
          <View style={[styles.statsRow, { backgroundColor: `${theme.primaryColor}10` }]}>
            {(about.content.stats as { number?: string; label?: string }[]).map((stat) => (
              <View key={`${stat.label}-${stat.number}`} style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.primaryColor }]}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {asStr(about?.content?.image) && (
          <SafeImage uri={asStr(about?.content?.image)} style={styles.aboutImage} />
        )}
      </View>

      {/* Products */}
      <View style={[styles.section, styles.sectionAlt]}>
        <Text style={[styles.sectionKicker, { color: theme.accentColor }]}>{t('minisite.products')}</Text>
        <Text style={styles.sectionTitle}>
          {pickLocalizedText(productsSection?.content, 'title', locale) ?? t('minisite.productsTitle')}
        </Text>
        {products.length === 0 ? (
          <Text style={styles.empty}>{t('minisite.noProducts')}</Text>
        ) : (
          products.map((product) => (
            <Pressable
              key={product.id}
              style={styles.productCard}
              onPress={() => setSelectedProduct(product)}
            >
              <SafeImage
                uri={product.images[0]}
                style={styles.productImage}
                letter={product.name.charAt(0)}
              />
              <View style={styles.productBody}>
                {product.category ? <Text style={styles.productCategory}>{product.category}</Text> : null}
                <Text style={styles.productName}>{productText(product, 'name', locale)}</Text>
                <Text style={styles.productDesc} numberOfLines={3}>
                  {productText(product, 'description', locale)}
                </Text>
                <Text style={[styles.productPrice, { color: theme.primaryColor }]}>
                  {product.price ? String(product.price) : t('minisite.onQuote')}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Gallery */}
      {gallery && Array.isArray(gallery.content?.images) && (gallery.content.images as unknown[]).length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionKicker, { color: theme.accentColor }]}>{t('minisite.gallery')}</Text>
          <Text style={styles.sectionTitle}>{pickLocalizedText(gallery.content, 'title', locale) ?? t('minisite.gallery')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
            {(gallery.content.images as { url?: string; caption?: string }[] | string[]).map((img, i) => {
              const url = typeof img === 'string' ? img : img.url;
              if (!url) return null;
              return <SafeImage key={`${url}-${i}`} uri={url} style={styles.galleryImage} />;
            })}
          </ScrollView>
        </View>
      )}

      {/* Contact */}
      <View style={[styles.section, styles.sectionAlt]}>
        <Text style={[styles.sectionKicker, { color: theme.accentColor }]}>{t('minisite.contact')}</Text>
        <Text style={styles.sectionTitle}>{pickLocalizedText(contact?.content, 'title', locale) ?? t('minisite.contact')}</Text>

        {contactInfo.email ? (
          <ContactRow label={t('minisite.email')} value={contactInfo.email} onPress={() => Linking.openURL(`mailto:${contactInfo.email}`)} />
        ) : null}
        {contactInfo.phone ? (
          <ContactRow label={t('minisite.phone')} value={contactInfo.phone} onPress={() => Linking.openURL(`tel:${contactInfo.phone}`)} />
        ) : null}
        {contactInfo.address ? (
          <ContactRow label={t('minisite.address')} value={contactInfo.address} />
        ) : null}
        {exhibitor.website ? (
          <ContactRow label={t('minisite.website')} value={exhibitor.website} onPress={() => Linking.openURL(exhibitor.website!)} />
        ) : null}

        {Object.entries(social).filter(([, v]) => v).length > 0 && (
          <View style={styles.socialRow}>
            {Object.entries(social).map(([network, url]) =>
              url ? (
                <Pressable key={network} style={[styles.socialBtn, { backgroundColor: theme.primaryColor }]} onPress={() => Linking.openURL(url)}>
                  <Text style={styles.socialBtnText}>{network}</Text>
                </Pressable>
              ) : null,
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('minisite.views').replace('{{count}}', String(miniSite.views))}
        </Text>
      </View>

      <ProductModal product={selectedProduct} theme={theme} locale={locale} onClose={() => setSelectedProduct(null)} />
    </ScrollView>
  );
}

function ContactRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const content = (
    <View style={styles.contactRow}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={[styles.contactValue, onPress && styles.contactLink]}>{value}</Text>
    </View>
  );
  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>;
  return content;
}

function ProductModal({
  product,
  theme,
  locale,
  onClose,
}: {
  product: MiniSiteProduct | null;
  theme: { primaryColor: string };
  locale: 'fr' | 'en' | 'ar';
  onClose: () => void;
}) {
  const { t } = useI18n();
  if (!product) return null;
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
        <SafeImage uri={product.images[0]} style={styles.modalImage} letter={product.name.charAt(0)} />
        <Text style={styles.modalTitle}>{productText(product, 'name', locale)}</Text>
        {product.category ? <Text style={styles.modalCategory}>{product.category}</Text> : null}
        <Text style={styles.modalDesc}>{productText(product, 'description', locale)}</Text>
        {product.specifications ? (
          <>
            <Text style={styles.modalSection}>{t('minisite.specs')}</Text>
            <Text style={styles.modalDesc}>{product.specifications}</Text>
          </>
        ) : null}
        <Text style={[styles.modalPrice, { color: theme.primaryColor }]}>
          {product.price ? String(product.price) : t('minisite.onQuote')}
        </Text>
        <Pressable style={[styles.modalClose, { backgroundColor: theme.primaryColor }]} onPress={onClose}>
          <Text style={styles.modalCloseText}>{t('common.close')}</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

function asStr(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  hero: { minHeight: 360, justifyContent: 'flex-end' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroContent: { padding: spacing.lg, paddingBottom: spacing.xl, alignItems: 'center' },
  heroLogo: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: '#fff',
    marginBottom: spacing.md,
  },
  heroLogoLetter: { fontSize: 36, fontFamily: fonts.display, color: colors.primary },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: fonts.bodySemiBold, letterSpacing: 0.5 },
  heroTitle: { color: '#fff', fontSize: 26, fontFamily: fonts.display, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.92)', fontSize: 15, fontFamily: fonts.body, textAlign: 'center', lineHeight: 22 },
  heroCta: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.full },
  heroCtaText: { color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 14 },
  heroMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: fonts.bodyMedium, marginTop: 10 },
  section: { padding: spacing.lg, backgroundColor: colors.surface },
  sectionAlt: { backgroundColor: colors.background },
  sectionKicker: { fontSize: 11, fontFamily: fonts.bodyBold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  sectionTitle: { fontSize: 22, fontFamily: fonts.display, color: colors.text, marginBottom: spacing.sm },
  sectionBody: { fontSize: 15, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 23 },
  featuresGrid: { marginTop: spacing.md, gap: spacing.sm },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { flex: 1, fontSize: 14, fontFamily: fonts.bodyMedium, color: colors.text },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  stat: { flex: 1, minWidth: '40%', alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: fonts.display },
  statLabel: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  aboutImage: { width: '100%', height: 200, borderRadius: radius.lg, marginTop: spacing.md },
  empty: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, fontStyle: 'italic' },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  productImage: { width: '100%', height: 160, backgroundColor: colors.borderLight },
  productBody: { padding: spacing.md },
  productCategory: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  productName: { fontSize: 17, fontFamily: fonts.bodyBold, color: colors.text, marginBottom: 6 },
  productDesc: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 19 },
  productPrice: { fontSize: 16, fontFamily: fonts.bodyBold, marginTop: 8 },
  galleryRow: { gap: spacing.sm, paddingVertical: spacing.sm },
  galleryImage: { width: 220, height: 150, borderRadius: radius.md, backgroundColor: colors.borderLight },
  contactRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  contactLabel: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  contactValue: { fontSize: 15, fontFamily: fonts.bodySemiBold, color: colors.text, marginTop: 2 },
  contactLink: { color: colors.primary },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  socialBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full },
  socialBtnText: { color: '#fff', fontSize: 12, fontFamily: fonts.bodySemiBold, textTransform: 'capitalize' },
  footer: { padding: spacing.lg, alignItems: 'center' },
  footerText: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  imageFallback: { backgroundColor: colors.accentMuted, alignItems: 'center', justifyContent: 'center' },
  imageFallbackText: { fontSize: 28, fontFamily: fonts.display, color: colors.primary },
  modalScroll: { flex: 1, backgroundColor: colors.surface },
  modalContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  modalImage: { width: '100%', height: 220, borderRadius: radius.lg, marginBottom: spacing.md },
  modalTitle: { fontSize: 24, fontFamily: fonts.display, color: colors.text },
  modalCategory: { fontSize: 12, fontFamily: fonts.bodyBold, color: colors.textMuted, marginTop: 4 },
  modalDesc: { fontSize: 15, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm },
  modalSection: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.text, marginTop: spacing.md },
  modalPrice: { fontSize: 20, fontFamily: fonts.bodyBold, marginTop: spacing.md },
  modalClose: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 15 },
});
