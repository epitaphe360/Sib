import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { getLatestPaymentRequest } from '../../../src/services/payment';
import { colors, spacing } from '../../../src/theme';

export default function ProfileScreen() {
  const { user, isLoading, isConfigured, signOut } = useAuth();
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.status === 'pending_payment') {
      getLatestPaymentRequest(user.id)
        .then((req) => setPaymentRequestId(req?.id ?? null))
        .catch(() => setPaymentRequestId(null));
    }
  }, [user?.id, user?.status]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Déconnexion impossible');
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenTitle title="Profil" subtitle="Chargement..." />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <ScreenTitle
          title="Profil"
          subtitle="Connectez-vous pour accéder à votre espace visiteur"
        />
        {!isConfigured && (
          <Text style={styles.warn}>
            Configurez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans .env
          </Text>
        )}
        <PrimaryButton label="Se connecter" onPress={() => router.push('/(auth)/login')} />
        <View style={styles.gap} />
        <PrimaryButton label="Créer un compte gratuit" onPress={() => router.push('/(auth)/register')} />
        <View style={styles.gap} />
        <PrimaryButton label="Pass Premium VIP" onPress={() => router.push('/(auth)/register-vip')} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView>
        <ScreenTitle title="Mon profil" subtitle={user.email} />
        <Card>
          <Row label="Nom" value={user.name} />
          <Row label="Type" value={user.type} />
          <Row label="Pass" value={user.visitorLevel ?? '—'} />
          <Row label="Statut" value={user.status ?? 'active'} />
        </Card>
        {user.status === 'pending_payment' && (
          <>
            <Text style={styles.pendingHint}>
              Votre Pass VIP est en attente de validation du virement bancaire.
            </Text>
            <PrimaryButton
              label="Instructions de paiement"
              onPress={() => {
                if (paymentRequestId) {
                  router.push(`/payment/${paymentRequestId}`);
                } else {
                  Alert.alert('Paiement', 'Demande de paiement introuvable. Contactez le support.');
                }
              }}
            />
            <View style={styles.gap} />
          </>
        )}
        <PrimaryButton label="Pass Premium VIP" onPress={() => router.push('/(auth)/register-vip')} />
        <View style={styles.gap} />
        <PrimaryButton label="Mes rendez-vous" onPress={() => router.push('/(visitor)/appointments')} />
        <View style={styles.gap} />
        <PrimaryButton label="Messages" onPress={() => router.push('/(visitor)/messages')} />
        <View style={styles.gap} />
        <PrimaryButton label="Réseautage" onPress={() => router.push('/(visitor)/networking')} />
        <View style={styles.gap} />
        <PrimaryButton label="Paramètres" onPress={() => router.push('/(visitor)/settings')} />
        <View style={styles.gap} />
        <PrimaryButton label="Mon badge QR" onPress={() => router.push('/(visitor)/(tabs)/badge')} />
        <View style={styles.gap} />
        <PrimaryButton label="Se déconnecter" onPress={handleSignOut} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { height: spacing.sm },
  warn: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  pendingHint: {
    color: colors.vip,
    fontSize: 13,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
