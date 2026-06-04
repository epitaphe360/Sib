import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { QRBadgeView } from '../../../src/components/QRBadgeView';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useRotatingQR } from '../../../src/hooks/useRotatingQR';
import { ensureUserBadge } from '../../../src/services/badge';
import type { UserBadge } from '../../../src/types';
import { colors, spacing } from '../../../src/theme';

export default function BadgeScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [badge, setBadge] = useState<UserBadge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { qrValue, expiresAt, error: qrError, refresh, usingCache } = useRotatingQR(user?.id);

  const loadBadge = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ensureUserBadge(user.id);
      setBadge(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger le badge');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadBadge();
  }, [user, loadBadge]);

  if (authLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <ScreenTitle
          title="Mon badge"
          subtitle="Connectez-vous pour afficher votre badge QR d'accès au salon"
        />
        <PrimaryButton label="Demandez votre badge" onPress={() => router.push('/(auth)/register')} />
        <View style={styles.gap} />
        <PrimaryButton label="Se connecter" onPress={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle title="Mon badge" subtitle="Présentez ce QR code à l'entrée du salon" />
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : error ? (
          <>
            <EmptyState message={error} />
            <PrimaryButton label="Réessayer" onPress={loadBadge} />
          </>
        ) : badge && qrValue ? (
          <>
            {usingCache && (
              <Text style={styles.offline}>{qrError ?? 'Mode hors ligne'}</Text>
            )}
            <QRBadgeView badge={badge} qrValue={qrValue} />
            {expiresAt && (
              <Text style={styles.expiry}>
                QR sécurisé · renouvelé à {expiresAt.toLocaleTimeString('fr-FR')}
              </Text>
            )}
            {qrError && !usingCache && (
              <>
                <EmptyState message={qrError} />
                <PrimaryButton label="Régénérer le QR" onPress={refresh} />
              </>
            )}
          </>
        ) : badge && !qrValue && !qrError ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : (
          <EmptyState message="Badge non disponible" />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  gap: { height: spacing.sm },
  expiry: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
  offline: { textAlign: 'center', color: colors.danger, fontSize: 13, marginBottom: spacing.sm, fontWeight: '600' },
});
