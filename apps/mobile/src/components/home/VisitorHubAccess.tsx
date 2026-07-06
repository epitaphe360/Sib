import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNetworkingPermissions } from '../../hooks/useNetworkingPermissions';
import { useI18n } from '../../i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../../theme';
import { AppIcon, type AppIconName } from '../AppIcon';
import { PressableScale } from '../PressableScale';
import { PrimaryButton } from '../ui';

type HubLink = {
  icon: AppIconName;
  labelKey: string;
  route: string;
  accent?: string;
};

const QUICK_LINKS: HubLink[] = [
  { icon: 'scan-outline', labelKey: 'tabs.scan', route: '/(visitor)/scan-connect', accent: colors.gold },
  { icon: 'time-outline', labelKey: 'scanHistory.title', route: '/(visitor)/scan-history', accent: colors.primary },
  { icon: 'people-outline', labelKey: 'tabs.network', route: '/(visitor)/(tabs)/network-hub', accent: colors.accent },
  { icon: 'grid-outline', labelKey: 'tabs.salons', route: '/(visitor)/(tabs)/salons', accent: colors.primaryDark },
  { icon: 'person-outline', labelKey: 'tabs.profile', route: '/(visitor)/(tabs)/profile', accent: colors.primary },
];

function QuickIcon({ link, t }: { link: HubLink; t: (k: string) => string }) {
  return (
    <PressableScale
      style={styles.quickItem}
      onPress={() => router.push(link.route as never)}
      accessibilityRole="button"
      accessibilityLabel={t(link.labelKey)}
    >
      <View style={[styles.quickIcon, { backgroundColor: link.accent ?? colors.primary }]}>
        <AppIcon name={link.icon} size={20} color="#fff" />
      </View>
      <Text style={styles.quickLabel} numberOfLines={2}>
        {t(link.labelKey)}
      </Text>
    </PressableScale>
  );
}

/** Connexion visiteur + raccourcis depuis l'accueil UrbaEvent (sans entrer dans un salon). */
export function VisitorHubAccess({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { permissions } = useNetworkingPermissions();
  const { t } = useI18n();

  if (user) {
    const links = permissions.canAccessNetworking
      ? QUICK_LINKS
      : QUICK_LINKS.filter((l) => l.route.includes('profile') || l.route.includes('salons'));

    if (compact) {
      return (
        <View style={styles.quickWrap}>
          <View style={styles.quickRow}>
            {links.map((link) => (
              <QuickIcon key={link.route} link={link} t={t} />
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.wrap}>
        <Text style={styles.sectionTitle}>{t('home.urba.visitorHubTitle')}</Text>
        <View style={styles.quickRowExpanded}>
          {links.map((link) => (
            <QuickIcon key={link.route} link={link} t={t} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.guestCard}>
        <View style={styles.guestHeader}>
          <View style={styles.guestIconWrap}>
            <AppIcon name="person-outline" size={26} color="#fff" />
          </View>
          <View style={styles.guestTextCol}>
            <Text style={styles.guestTitle}>{t('home.urba.visitorHubTitle')}</Text>
            <Text style={styles.guestBody}>{t('home.urba.authBody')}</Text>
          </View>
        </View>
        <PrimaryButton
          label={t('home.urba.loginCta')}
          variant="gold"
          onPress={() => router.push('/(auth)/login' as never)}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label={t('home.urba.registerCta')}
          variant="outline"
          onPress={() => router.push('/(auth)/register' as never)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  quickWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: '#1B365D',
    marginBottom: spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  quickRowExpanded: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 56,
    maxWidth: 72,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 12,
  },
  guestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  guestHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  guestIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTextCol: { flex: 1 },
  guestTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  guestBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  gap: { height: spacing.sm },
});
