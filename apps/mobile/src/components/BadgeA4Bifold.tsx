import React, { forwardRef } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  resolveBadgeAssetUrl,
  type BadgeConfig,
  type FaceContent,
} from '../api/badgeConfig';
import { getBadgeLogoSource } from '../config/brandAssets';
import { useBadgeConfig } from '../hooks/useBadgeConfig';
import { buildStaticParticipantQR } from '../api/badgeLookup';
import { badgeAccessColor, badgeLevelLabel } from '../services/badge';
import type { UserBadge } from '../types';
import { fonts, spacing } from '../theme';

/** Largeur cible A4 pour capture impression (ratio 210×297 mm). */
export const A4_SHEET_WIDTH = 595;
const A4_RATIO = 297 / 210;
export const A4_SHEET_HEIGHT = Math.round(A4_SHEET_WIDTH * A4_RATIO);
const QUAD_W = A4_SHEET_WIDTH / 2;
const QUAD_H = A4_SHEET_HEIGHT / 2;

type Props = {
  badge: UserBadge;
  /** Pour l'aperçu écran : réduit à la largeur disponible */
  previewScale?: boolean;
};

function BadgeLogo({ url, height = 28, inverted }: { url?: string; height?: number; inverted?: boolean }) {
  const resolved = resolveBadgeAssetUrl(url);
  const source =
    resolved?.startsWith('brand://') || !resolved
      ? getBadgeLogoSource(url)
      : { uri: resolved };
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ height, maxWidth: QUAD_W * 0.45, resizeMode: 'contain' }}
      accessibilityLabel="logo"
    />
  );
}

function FaceHeader({ config, primary, secondary, showEventName }: {
  config: BadgeConfig;
  primary: string;
  secondary: string;
  showEventName?: boolean;
}) {
  return (
    <View style={[styles.headerBar, { backgroundColor: primary }]}>
      {config.logo_main_url ? (
        <BadgeLogo url={config.logo_main_url} height={24} />
      ) : (
        <Text style={[styles.headerLogoText, { color: secondary }]}>{config.event_name}</Text>
      )}
      <Text style={[styles.headerEdition, { color: secondary }]}>
        {showEventName ? `${config.event_name} · ${config.event_edition}` : config.event_edition}
      </Text>
    </View>
  );
}

function FaceFooter({ config, primary }: { config: BadgeConfig; primary: string }) {
  return (
    <View style={[styles.footerBar, { backgroundColor: primary }]}>
      <Text style={styles.footerMain}>{config.event_dates_display} · {config.event_location}</Text>
      <Text style={styles.footerSub}>{config.event_location_detail}</Text>
    </View>
  );
}

function ValidityBanner({ config }: { config: BadgeConfig }) {
  return (
    <View style={styles.validityBar}>
      <Text style={styles.validityFr}>{config.badge_validity_text_fr}</Text>
      <Text style={styles.validityEn}>{config.badge_validity_text_en}</Text>
    </View>
  );
}

function InfoRow({ icon, title, value }: { icon: string; title: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function FaceInfosPratiques({ config, primary }: { config: BadgeConfig; primary: string }) {
  return (
    <View style={styles.faceCol}>
      <ValidityBanner config={config} />
      <Text style={styles.italicHint}>Ce badge vous donne accès au salon pendant les 5 jours de l'évènement.</Text>
      <View style={styles.infoList}>
        <InfoRow icon="📅" title="DATES DU SALON" value={config.dates_label || config.event_dates_display} />
        <InfoRow icon="🕐" title="HORAIRES D'OUVERTURE" value={config.opening_hours} />
        <InfoRow icon="📍" title="LIEU" value={config.location_address || config.event_location_detail} />
        <InfoRow icon="🧭" title="VENIR AU SALON" value={config.how_to_get_there} />
        <InfoRow
          icon="📞"
          title="CONTACT"
          value={[config.contact_phone, config.contact_email, config.contact_website].filter(Boolean).join(' · ')}
        />
      </View>
    </View>
  );
}

function FaceCarteVisite({ config, primary, secondary }: { config: BadgeConfig; primary: string; secondary: string }) {
  return (
    <View style={styles.faceCol}>
      <View style={styles.carteCenter}>
        <View style={[styles.carteBox, { borderColor: primary }]}>
          <Text style={[styles.carteTitle, { color: primary }]}>
            Insérez votre carte de visite{'\n'}dans le porte-badge
          </Text>
          <Text style={styles.carteSub}>
            Insert your business card{'\n'}in the badge holder
          </Text>
        </View>
      </View>
      <FaceFooter config={config} primary={primary} />
    </View>
  );
}

function FacePartenaires({ config, primary }: { config: BadgeConfig; primary: string }) {
  const sponsors = [...(config.featured_sponsors ?? [])].sort((a, b) => a.order - b.order);
  const hasSponsors = sponsors.length > 0;
  const rowsConfig = config.partners_rows_config ?? [3, 3];

  type LogoItem = { key: string; url: string; label: string; sub?: string };
  const allLogos: LogoItem[] = hasSponsors
    ? sponsors.map((sp) => ({ key: sp.id, url: sp.logo_url, label: sp.name, sub: sp.role }))
    : [
        { key: 'aegis', url: config.logo_aegis_url, label: config.logo_aegis_label },
        { key: 'organizer', url: config.logo_organizer_url, label: config.logo_organizer_label },
        { key: 'delegate', url: config.logo_delegate_url, label: config.logo_delegate_label },
        { key: 'sponsor_1', url: config.logo_sponsor_1_url, label: config.logo_sponsor_1_label },
        { key: 'sponsor_2', url: config.logo_sponsor_2_url, label: config.logo_sponsor_2_label },
        { key: 'sponsor_3', url: config.logo_sponsor_3_url, label: config.logo_sponsor_3_label },
        { key: 'badging', url: config.logo_badging_url, label: config.logo_badging_label },
        { key: 'digital', url: config.logo_digital_url, label: config.logo_digital_label },
        { key: 'media', url: config.logo_media_url, label: config.logo_media_label },
      ];

  const logoRows: LogoItem[][] = [];
  let off = 0;
  rowsConfig.forEach((cnt) => {
    if (off < allLogos.length) {
      logoRows.push(allLogos.slice(off, off + cnt));
      off += cnt;
    }
  });

  return (
    <View style={styles.faceCol}>
      {config.partners_section_title ? (
        <Text style={styles.partnersTitle}>{config.partners_section_title}</Text>
      ) : null}
      <View style={styles.partnersBody}>
        {logoRows.map((row, ri) => (
          <View key={`row-${ri}`} style={styles.logoRow}>
            {row.map((item) => (
              <View key={item.key} style={styles.logoCell}>
                {resolveBadgeAssetUrl(item.url) ? (
                  <Image source={{ uri: resolveBadgeAssetUrl(item.url)! }} style={styles.logoImg} resizeMode="contain" />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoPlaceholderText} numberOfLines={2}>{item.label}</Text>
                  </View>
                )}
                {item.sub ? <Text style={styles.logoSub}>{item.sub}</Text> : null}
              </View>
            ))}
          </View>
        ))}
      </View>
      <FaceFooter config={config} primary={primary} />
    </View>
  );
}

function FaceIdentite({
  badge,
  config,
  primary,
  secondary,
  qrValue,
}: {
  badge: UserBadge;
  config: BadgeConfig;
  primary: string;
  secondary: string;
  qrValue: string;
}) {
  const accessColor = badgeAccessColor(badge.accessLevel || badge.userType);
  const accessLabel = badgeLevelLabel(badge.accessLevel || badge.userType);

  return (
    <View style={styles.faceCol}>
      <ValidityBanner config={config} />
      <View style={styles.identityBody}>
        <View style={[styles.avatarCircle, { borderColor: secondary }]}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={[styles.identityName, { color: config.text_dark }]}>{badge.fullName}</Text>
        {badge.companyName ? (
          <Text style={styles.identityCompany}>{badge.companyName}</Text>
        ) : null}
        <View style={[styles.levelPill, { backgroundColor: accessColor }]}>
          <Text style={styles.levelText}>{accessLabel}</Text>
        </View>
        <View style={[styles.qrFrame, { borderColor: secondary }]}>
          <QRCode value={qrValue} size={Math.min(QUAD_W * 0.38, 90)} backgroundColor="#fff" color={primary} />
        </View>
        <Text style={styles.badgeCode}>{badge.badgeCode}</Text>
      </View>
      <FaceFooter config={config} primary={primary} />
    </View>
  );
}

function FaceAppPromo({ config, primary, secondary }: { config: BadgeConfig; primary: string; secondary: string }) {
  const promoImg = resolveBadgeAssetUrl(config.app_promo_image_url);
  if (promoImg) {
    return (
      <Image source={{ uri: promoImg }} style={styles.fullImage} resizeMode="cover" />
    );
  }
  return (
    <View style={[styles.faceCol, { backgroundColor: primary }]}>
      <View style={styles.promoBody}>
        <Text style={[styles.promoBrand, { color: secondary }]}>
          URBA<Text style={{ color: '#fff' }}>EVENT</Text>
        </Text>
        <Text style={styles.promoTitle}>{config.app_promo_title}</Text>
        <Text style={styles.promoSub}>{config.app_promo_subtitle}</Text>
        <View style={styles.promoQrRow}>
          {config.app_store_url ? (
            <View style={styles.promoQrBox}>
              <QRCode value={config.app_store_url} size={48} backgroundColor="#fff" color={primary} />
              <Text style={styles.promoQrLabel}>App Store</Text>
            </View>
          ) : null}
          {config.google_play_url ? (
            <View style={styles.promoQrBox}>
              <QRCode value={config.google_play_url} size={48} backgroundColor="#fff" color={primary} />
              <Text style={styles.promoQrLabel}>Google Play</Text>
            </View>
          ) : null}
        </View>
      </View>
      <FaceFooter config={config} primary={primary} />
    </View>
  );
}

function FaceProgramme({ config, primary, secondary }: { config: BadgeConfig; primary: string; secondary: string }) {
  const programDay = config.program_days.find((d) => d.open !== false) ?? config.program_days[0];
  return (
    <View style={styles.faceCol}>
      <ValidityBanner config={config} />
      {config.show_program_on_badge === 'true' && programDay ? (
        <View style={styles.programBody}>
          <Text style={[styles.programDayLabel, { backgroundColor: secondary }]}>{programDay.label}</Text>
          {programDay.sessions.slice(0, 4).map((s, i) => (
            <Text key={`${programDay.id}-${i}`} style={styles.sessionLine}>
              <Text style={{ fontFamily: fonts.bodyBold }}>{s.time}</Text> · {s.title}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.programFallback}>{config.event_dates_display}</Text>
      )}
      <FaceFooter config={config} primary={primary} />
    </View>
  );
}

function renderFace(
  content: FaceContent,
  config: BadgeConfig,
  badge: UserBadge,
  qrValue: string,
  primary: string,
  secondary: string,
) {
  if (content === 'identite_participant') {
    return (
      <View style={styles.quadrant}>
        <FaceHeader config={config} primary={primary} secondary={secondary} showEventName />
        <FaceIdentite badge={badge} config={config} primary={primary} secondary={secondary} qrValue={qrValue} />
      </View>
    );
  }
  if (content === 'carte_de_visite') {
    return (
      <View style={styles.quadrant}>
        <FaceHeader config={config} primary={primary} secondary={secondary} showEventName />
        <FaceCarteVisite config={config} primary={primary} secondary={secondary} />
      </View>
    );
  }
  if (content === 'partenaires') {
    return (
      <View style={styles.quadrant}>
        <FaceHeader config={config} primary={primary} secondary={secondary} />
        <FacePartenaires config={config} primary={primary} />
      </View>
    );
  }
  if (content === 'infos_pratiques') {
    return (
      <View style={styles.quadrant}>
        <FaceInfosPratiques config={config} primary={primary} />
      </View>
    );
  }
  if (content === 'programme') {
    return (
      <View style={styles.quadrant}>
        <FaceHeader config={config} primary={primary} secondary={secondary} showEventName />
        <FaceProgramme config={config} primary={primary} secondary={secondary} />
      </View>
    );
  }
  return (
    <View style={styles.quadrant}>
      <FaceAppPromo config={config} primary={primary} secondary={secondary} />
    </View>
  );
}

/** Badge A4 — 4 quadrants configurables via /admin/badge-config (Supabase badge_config_v1). */
export const BadgeA4Bifold = forwardRef<ScrollViewType, Props>(function BadgeA4Bifold(
  { badge, previewScale = true },
  ref,
) {
  const { config } = useBadgeConfig();
  const qrValue = buildStaticParticipantQR(badge);
  const primary = config.primary_color;
  const secondary = config.secondary_color;

  const screenW = Dimensions.get('window').width - spacing.md * 2;
  const sheetW = previewScale ? screenW : A4_SHEET_WIDTH;
  const sheetH = sheetW * A4_RATIO;

  return (
    <ScrollView ref={ref} collapsable={false} contentContainerStyle={styles.scrollOuter}>
      <View style={[styles.sheet, { width: sheetW, height: sheetH }]}>
        <View style={styles.grid}>
          {renderFace(config.face4_content, config, badge, qrValue, primary, secondary)}
          {renderFace(config.face1_content, config, badge, qrValue, primary, secondary)}
          {renderFace(config.face2_content, config, badge, qrValue, primary, secondary)}
          {renderFace(config.face3_content, config, badge, qrValue, primary, secondary)}
        </View>
        <View style={styles.foldV} pointerEvents="none" />
        <View style={styles.foldH} pointerEvents="none" />
      </View>
      <Text style={styles.caption}>Aperçu A4 complet — 4 faces — bifold recto-verso</Text>
      <Text style={styles.configHint}>Configuration chargée depuis l'admin badge-config</Text>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollOuter: { alignItems: 'center', paddingBottom: spacing.md },
  sheet: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  quadrant: {
    width: '50%',
    height: '50%',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  foldV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#bbb',
    borderStyle: 'dashed',
  },
  foldH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#bbb',
    borderStyle: 'dashed',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerLogoText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  headerEdition: { fontFamily: fonts.bodyBold, fontSize: 8 },
  footerBar: { paddingHorizontal: 8, paddingVertical: 5, marginTop: 'auto' },
  footerMain: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 7, textAlign: 'center' },
  footerSub: { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.body, fontSize: 6, textAlign: 'center', marginTop: 1 },
  validityBar: { backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 5 },
  validityFr: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 6, textAlign: 'center', lineHeight: 9 },
  validityEn: { color: 'rgba(255,255,255,0.65)', fontFamily: fonts.body, fontSize: 5.5, textAlign: 'center', marginTop: 2 },
  faceCol: { flex: 1, display: 'flex', flexDirection: 'column' },
  italicHint: {
    fontStyle: 'italic',
    fontSize: 7,
    color: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  infoList: { flex: 1, paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  infoRow: { flexDirection: 'row', gap: 4, alignItems: 'flex-start' },
  infoIcon: { fontSize: 9 },
  infoContent: { flex: 1 },
  infoTitle: { fontFamily: fonts.bodyBold, fontSize: 6, color: '#111827' },
  infoValue: { fontFamily: fonts.body, fontSize: 5.5, color: '#374151', lineHeight: 8 },
  carteCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
  carteBox: { borderWidth: 1.5, borderRadius: 4, padding: 12, width: '88%', alignItems: 'center' },
  carteTitle: { fontFamily: fonts.bodyBold, fontSize: 8, textAlign: 'center', lineHeight: 12, marginBottom: 6 },
  carteSub: { fontFamily: fonts.body, fontSize: 7, color: '#374151', textAlign: 'center', fontStyle: 'italic', lineHeight: 10 },
  partnersTitle: {
    textAlign: 'center',
    fontSize: 6,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 6,
    paddingHorizontal: 6,
  },
  partnersBody: { flex: 1, justifyContent: 'center', paddingHorizontal: 6, gap: 4 },
  logoRow: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  logoCell: { flex: 1, alignItems: 'center', gap: 2 },
  logoImg: { height: 28, width: '100%', maxWidth: 60 },
  logoPlaceholder: {
    height: 28,
    minWidth: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  logoPlaceholderText: { fontSize: 5, color: '#9ca3af', fontFamily: fonts.bodyBold, textAlign: 'center' },
  logoSub: { fontSize: 5, color: '#6b7280', fontFamily: fonts.bodyBold },
  identityBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  avatarEmoji: { fontSize: 18 },
  identityName: { fontFamily: fonts.display, fontSize: 11, textAlign: 'center', lineHeight: 14 },
  identityCompany: { fontFamily: fonts.body, fontSize: 7, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  levelPill: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  levelText: { fontFamily: fonts.bodyBold, fontSize: 6, color: '#fff', textTransform: 'uppercase' },
  qrFrame: { marginTop: 6, padding: 4, backgroundColor: '#fff', borderWidth: 1, borderRadius: 4 },
  badgeCode: { fontFamily: fonts.bodyMedium, fontSize: 6, color: '#9ca3af', marginTop: 4 },
  promoBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  promoBrand: { fontFamily: fonts.display, fontSize: 14, marginBottom: 4 },
  promoTitle: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 8, textAlign: 'center', marginBottom: 2 },
  promoSub: { color: 'rgba(255,255,255,0.65)', fontFamily: fonts.body, fontSize: 6, textAlign: 'center', marginBottom: 8 },
  promoQrRow: { flexDirection: 'row', gap: 12 },
  promoQrBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 4, padding: 3 },
  promoQrLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 5, fontFamily: fonts.bodyBold, marginTop: 2 },
  programBody: { flex: 1, paddingHorizontal: 8, paddingTop: 4 },
  programDayLabel: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  sessionLine: { fontFamily: fonts.body, fontSize: 6, color: '#333', marginBottom: 2, lineHeight: 9 },
  programFallback: { flex: 1, padding: 8, fontSize: 7, color: '#fff' },
  fullImage: { width: '100%', height: '100%' },
  caption: {
    marginTop: spacing.sm,
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  configHint: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 2,
  },
});
