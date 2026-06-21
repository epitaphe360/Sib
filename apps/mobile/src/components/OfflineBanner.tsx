import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { colors, fonts, spacing } from '../theme';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const NetInfo = require('@react-native-community/netinfo').default;
      unsub = NetInfo.addEventListener((state: { isConnected: boolean | null; isInternetReachable: boolean | null }) => {
        setIsConnected(state.isConnected !== false && state.isInternetReachable !== false);
      });
      NetInfo.fetch()
        .then((state: { isConnected: boolean | null; isInternetReachable: boolean | null }) => {
          setIsConnected(state.isConnected !== false && state.isInternetReachable !== false);
        })
        .catch(() => setIsConnected(true));
    } catch {
      setIsConnected(true);
    }
    return () => unsub?.();
  }, []);

  return { isConnected, isOffline: !isConnected };
}

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const { t } = useI18n();

  if (!isOffline) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{t('common.offline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textAlign: 'center',
  },
});
