import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AppIcon, type AppIconName } from './AppIcon';
import { PressableScale } from './PressableScale';
import { useNetworkingPermissions } from '../hooks/useNetworkingPermissions';
import { useI18n } from '../i18n/I18nProvider';
import { navigateSafe } from '../lib/navigateSafe';
import { colors, fonts, radius, shadows, spacing } from '../theme';

const COLS = 3;
const SCREEN_H_PAD = spacing.md * 2;

type Action = {
  id: string;
  labelKey: string;
  icon: AppIconName;
  route: string;
  accent?: string;
  authOnly?: boolean;
  vipOnly?: boolean;
};

const ACTIONS: Action[] = [
  { id: 'login', labelKey: 'home.quick.login', icon: 'log-in-outline', route: '/(auth)/login', accent: colors.primary },
  { id: 'register', labelKey: 'home.registerCta', icon: 'ticket-outline', route: '/(auth)/register', accent: colors.accent },
  { id: 'badge', labelKey: 'home.quick.badge', icon: 'qr-code-outline', route: '/(visitor)/(tabs)/badge' },
  { id: 'program', labelKey: 'home.quick.program', icon: 'calendar-outline', route: '/(visitor)/(tabs)/explore' },
  { id: 'appointments', labelKey: 'home.quick.rdv', icon: 'time-outline', route: '/(visitor)/appointments', authOnly: true },
  { id: 'vip', labelKey: 'home.quick.vip', icon: 'star-outline', route: '/(auth)/register-vip' },
  { id: 'salons', labelKey: 'home.quick.salons', icon: 'grid-outline', route: '/(visitor)/(tabs)' },
  { id: 'explore', labelKey: 'home.quick.explore', icon: 'compass-outline', route: '/(visitor)/(tabs)/explore' },
  { id: 'map', labelKey: 'home.quick.map', icon: 'map-outline', route: '/(visitor)/map' },
  { id: 'news', labelKey: 'home.quick.news', icon: 'newspaper-outline', route: '/(visitor)/news' },
  { id: 'network', labelKey: 'home.quick.network', icon: 'people-outline', route: '/(visitor)/(tabs)/network-hub', authOnly: true, vipOnly: true },
  { id: 'scan', labelKey: 'home.quick.scan', icon: 'scan-outline', route: '/(visitor)/scan-connect', authOnly: true },
];

const HUB_ACTION_IDS = new Set(['login', 'register', 'vip']);

export function QuickActionGrid({
  hideLogin,
  mode = 'hub',
}: {
  hideLogin?: boolean;
  mode?: 'hub' | 'full';
}) {
  const { t } = useI18n();
  const { permissions } = useNetworkingPermissions();
  const { width } = useWindowDimensions();
  const gap = spacing.sm;
  const tileWidth = useMemo(
    () => (width - SCREEN_H_PAD - gap * (COLS - 1)) / COLS,
    [width, gap],
  );

  const isLoggedIn = Boolean(hideLogin);

  const items = ACTIONS.filter((a) => {
    if (mode === 'hub' && !HUB_ACTION_IDS.has(a.id)) return false;
    if (a.id === 'register' && isLoggedIn) return false;
    if (a.vipOnly && isLoggedIn && !permissions.canSendMessages) return false;
    return true;
  });

  const go = (route: string) => {
    try {
      navigateSafe(route, 'push');
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  const handlePress = (action: Action) => {
    if (action.id === 'login') {
      go(isLoggedIn ? '/(visitor)/(tabs)/profile' : '/(auth)/login');
      return;
    }
    if (action.authOnly && !isLoggedIn) {
      go('/(auth)/login');
      return;
    }
    if (action.id === 'badge' && !isLoggedIn) {
      go('/(auth)/register');
      return;
    }
    go(action.route);
  };

  const labelFor = (action: Action) => {
    if (action.id === 'login' && isLoggedIn) return t('tabs.profile');
    return t(action.labelKey);
  };

  return (
    <View style={[styles.grid, { gap }]}>
      {items.map((action) => (
        <PressableScale
          key={action.id}
          style={[styles.tile, { width: tileWidth }]}
          onPress={() => handlePress(action)}
          accessibilityRole="button"
          accessibilityLabel={labelFor(action)}
        >
          <View
            style={[
              styles.iconWrap,
              action.accent
                ? { backgroundColor: action.accent }
                : { backgroundColor: colors.accentMuted },
            ]}
          >
            <AppIcon
              name={action.id === 'login' && isLoggedIn ? 'person-outline' : action.icon}
              size={22}
              color={action.accent ? '#fff' : colors.primary}
            />
          </View>
          <Text style={styles.label} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
            {labelFor(action)}
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
    marginBottom: spacing.md,
  },
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14,
    width: '100%',
  },
});
