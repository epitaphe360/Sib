import { Alert, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { AppIcon, type AppIconName } from '../AppIcon';
import { PressableScale } from '../PressableScale';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import { navigateSafe } from '../../lib/navigateSafe';
import { colors, fonts, radius, shadows, spacing } from '../../theme';

const COLS = 2;
const SCREEN_H_PAD = spacing.md * 2;

type MenuAction = {
  id: string;
  labelKey: string;
  icon: AppIconName;
  route: string;
  authOnly?: boolean;
};

const SALON_VISITOR_ACTIONS: MenuAction[] = [
  { id: 'presentation', labelKey: 'salon.menu.presentation', icon: 'document-text-outline', route: '/(visitor)/salon-presentation' },
  { id: 'program', labelKey: 'salon.menu.program', icon: 'calendar-outline', route: '/(visitor)/(tabs)/program' },
  { id: 'agenda', labelKey: 'salon.menu.agenda', icon: 'time-outline', route: '/(visitor)/appointments', authOnly: true },
  { id: 'directory', labelKey: 'salon.menu.directory', icon: 'business-outline', route: '/(visitor)/(tabs)/exhibitors' },
  { id: 'map', labelKey: 'salon.menu.map', icon: 'map-outline', route: '/(visitor)/map' },
  { id: 'info', labelKey: 'salon.menu.info', icon: 'information-circle-outline', route: '/(visitor)/salon-info' },
];

export function SalonVisitorMenuGrid() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const gap = spacing.sm;
  const tileWidth = (width - SCREEN_H_PAD - gap * (COLS - 1)) / COLS;

  const handlePress = (action: MenuAction) => {
    if (action.authOnly && !user) {
      Alert.alert(t('login.title'), t('salon.menu.loginRequired'), [
        { text: t('login.submit'), onPress: () => router.push('/(auth)/login' as never) },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
      return;
    }
    try {
      navigateSafe(action.route, 'push');
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <View style={[styles.grid, { gap }]}>
      {SALON_VISITOR_ACTIONS.map((action) => (
        <PressableScale
          key={action.id}
          style={[styles.tile, { width: tileWidth }]}
          onPress={() => handlePress(action)}
          accessibilityRole="button"
          accessibilityLabel={t(action.labelKey)}
        >
          <View style={styles.iconWrap}>
            <AppIcon name={action.icon} size={26} color="#fff" />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {t(action.labelKey)}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 118,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 17,
  },
});
