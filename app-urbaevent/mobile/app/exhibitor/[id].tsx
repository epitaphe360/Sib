import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/ui';
import { colors } from '../../src/theme';

/** Redirige vers le mini-site natif */
export default function ExhibitorRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      router.replace(`/minisite/${id}` as never);
    }
  }, [id]);

  return (
    <Screen style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
