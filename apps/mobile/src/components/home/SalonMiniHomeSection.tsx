import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AppIcon } from '../AppIcon';
import { getSalonMiniHome, type SalonPartner } from '../../data/salonPartners';
import { getUrbaSalonTheme } from '../../data/urbaCatalog';
import { useAppContent } from '../../hooks/useAppContent';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import type { Salon } from '../../types';
import { colors, fonts, radius, shadows, spacing } from '../../theme';
import { HomeSection } from './HomeSection';

type Props = {
  salon: Salon;
};

function PartnerTile({ partner, accent }: { partner: SalonPartner; accent: string }) {
  return (
    <View style={styles.partnerTile} accessibilityLabel={partner.name}>
      {partner.logo ? (
        <Image source={partner.logo} style={styles.partnerLogo} resizeMode="contain" />
      ) : (
        <View style={[styles.acronymBox, { borderColor: accent }]}>
          <Text style={[styles.acronymText, { color: accent }]} numberOfLines={2}>
            {partner.acronym}
          </Text>
        </View>
      )}
      <Text style={styles.partnerName} numberOfLines={3}>
        {partner.name}
      </Text>
    </View>
  );
}

export function SalonMiniHomeSection({ salon }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { content } = useAppContent();
  const { width } = useWindowDimensions();
  const theme = getUrbaSalonTheme(salon, content.salonStats);
  const miniHome = getSalonMiniHome(salon);
  const aboutText = miniHome.aboutKey ? t(miniHome.aboutKey) : theme.description;
  const edition = salon.edition?.trim() || theme.edition;
  const visitors = salon.expectedVisitors?.trim() || theme.visitors;
  const bannerWidth = width - spacing.md * 2;
  const bannerHeight = miniHome.partnersBanner ? Math.round(bannerWidth * 0.62) : 0;

  return (
    <View style={styles.wrap}>
      <HomeSection title={t('salon.about')} subtitle={theme.tagline}>
        <View style={styles.aboutCard}>
          {edition ? (
            <View style={[styles.editionPill, { backgroundColor: theme.bgColor }]}>
              <Text style={[styles.editionText, { color: theme.color }]}>{edition}</Text>
            </View>
          ) : null}
          <Text style={styles.aboutText}>{aboutText}</Text>
          <View style={styles.metaRow}>
            {theme.location ? (
              <View style={styles.metaPill}>
                <AppIcon name="location-outline" size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{theme.location}</Text>
              </View>
            ) : null}
            {salon.dates ? (
              <View style={styles.metaPill}>
                <AppIcon name="calendar-outline" size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{salon.dates}</Text>
              </View>
            ) : null}
            {visitors ? (
              <View style={styles.metaPill}>
                <AppIcon name="people-outline" size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{visitors}</Text>
              </View>
            ) : null}
          </View>
          {user && theme.features.length > 0 ? (
            <View style={styles.features}>
              {theme.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <View style={[styles.featureDot, { backgroundColor: theme.color }]} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </HomeSection>

      <HomeSection title={t('salon.partners.title')} subtitle={t('salon.partners.subtitle')}>
        <View style={styles.partnersCard}>
          {miniHome.partnersBanner ? (
            <Image
              source={miniHome.partnersBanner}
              style={{ width: bannerWidth, height: bannerHeight }}
              resizeMode="contain"
              accessibilityLabel={t('salon.partners.title')}
            />
          ) : (
            miniHome.groups.map((group, index) => (
              <View
                key={group.role}
                style={[styles.partnerGroup, index > 0 && styles.partnerGroupBorder]}
              >
                <Text style={styles.groupLabel}>{t(group.labelKey)}</Text>
                <View style={styles.partnerRow}>
                  {group.partners.map((partner) => (
                    <PartnerTile key={partner.id} partner={partner} accent={theme.color} />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </HomeSection>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  editionPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  editionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  aboutText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  features: { gap: 4, marginTop: 2 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  featureText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  partnersCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  partnerGroup: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  partnerGroupBorder: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  groupLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  partnerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  partnerTile: {
    width: 130,
    alignItems: 'center',
    gap: 8,
  },
  partnerLogo: {
    width: 110,
    height: 56,
  },
  acronymBox: {
    width: 72,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#FAFBFC',
  },
  acronymText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  partnerName: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
});
