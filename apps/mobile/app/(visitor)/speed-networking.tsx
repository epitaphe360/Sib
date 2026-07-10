import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchSpeedSessions, joinSpeedSession, type SpeedSession } from '../../src/api/speedNetworking';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../src/i18n/I18nProvider';
import { localeCode } from '../../src/lib/locale';
import { getPermissionErrorMessage } from '../../src/lib/networkingPermissions';
import { requireAuth } from '../../src/lib/navigateSafe';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function SpeedNetworkingScreen() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const lc = localeCode(locale);
  const { permissions } = useNetworkingPermissions();
  const canAccessSpeed = permissions.canSendMessages || permissions.canAccessPremiumFeatures;
  const [sessions, setSessions] = useState<SpeedSession[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setSessions(await fetchSpeedSessions());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : t('common.error'));
    }
  }, [t]);

  useEffect(() => {
    if (canAccessSpeed) load();
  }, [load, canAccessSpeed]);

  const join = async (sessionId: string) => {
    if (!requireAuth(user, t)) return;
    if (!canAccessSpeed) {
      Alert.alert(t('networking.title'), getPermissionErrorMessage(user?.type ?? 'visitor', user?.visitorLevel, 'message', t));
      return;
    }
    try {
      await joinSpeedSession(sessionId, user!.id);
      Alert.alert(t('speed.joinedTitle'), t('speed.joinedBody'));
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  if (!canAccessSpeed) {
    return (
      <Screen style={styles.flex}>
        <ScreenTitle title={t('speed.title')} subtitle={t('speed.subtitle')} />
        <EmptyState message={t('networking.blocked')} />
        <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} variant="gold" />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('speed.title')} subtitle={t('speed.subtitle')} />
      {loadError ? <EmptyState message={loadError} /> : null}
      <FlatList
        style={styles.flex}
        data={sessions}
        keyExtractor={(s) => s.id}
        ListEmptyComponent={<EmptyState message={t('speed.empty')} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.currentParticipants}/{item.maxParticipants} · {item.status}
            </Text>
            {item.startTime ? (
              <Text style={styles.time}>{new Date(item.startTime).toLocaleString(lc)}</Text>
            ) : null}
            <PrimaryButton label={t('speed.join')} onPress={() => join(item.id)} variant="gold" />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  title: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.primary },
});
