import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { BANK_TRANSFER, generatePaymentReference, VIP_PASS } from '../../src/data/bankTransfer';
import { getPaymentRequest } from '../../src/services/payment';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, spacing } from '../../src/theme';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState('pending');
  const [reference, setReference] = useState('');

  const load = useCallback(async () => {
    if (!id || !user) {
      setLoading(false);
      return;
    }
    try {
      const request = await getPaymentRequest(id);
      if (request) {
        setAmount(request.amount);
        setStatus(request.status);
      }
      setReference(generatePaymentReference(user.id));
    } catch {
      Alert.alert('Erreur', 'Impossible de charger la demande de paiement');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copié', `${label} copié dans le presse-papiers`);
  };

  if (!user) {
    return (
      <Screen>
        <EmptyState message="Connectez-vous pour voir les instructions de paiement" />
        <PrimaryButton label="Se connecter" onPress={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <ScreenTitle title="Paiement VIP" subtitle="Chargement..." />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle
          title={t('payment.title')}
          subtitle={`${amount} ${VIP_PASS.currency} — ${
            status === 'approved'
              ? t('payment.approved')
              : status === 'rejected'
                ? t('payment.rejected')
                : t('payment.pending')
          }`}
        />
        <PrimaryButton
          label={t('payment.refresh')}
          onPress={async () => {
            setLoading(true);
            await load();
            await refreshUser();
            setLoading(false);
          }}
        />
        <View style={styles.gap} />

        <Card>
          <Text style={styles.sectionLabel}>Étapes</Text>
          {[
            `Effectuez un virement de ${amount} ${VIP_PASS.currency}`,
            'Indiquez la référence ci-dessous dans le libellé',
            'Conservez votre justificatif de virement',
            'Activation sous 2 à 5 jours ouvrés après validation',
          ].map((step, i) => (
            <Text key={step} style={styles.step}>
              {i + 1}. {step}
            </Text>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionLabel}>Coordonnées bancaires</Text>
          <CopyRow label="Banque" value={BANK_TRANSFER.bankName} onCopy={copy} />
          <CopyRow label="Titulaire" value={BANK_TRANSFER.accountHolder} onCopy={copy} />
          <CopyRow label="IBAN" value={BANK_TRANSFER.iban} onCopy={copy} />
          <CopyRow label="BIC" value={BANK_TRANSFER.bic} onCopy={copy} />
          <CopyRow label="Référence *" value={reference} onCopy={copy} highlight />
        </Card>

        <PrimaryButton label="Retour à l'accueil" onPress={() => router.replace('/')} />
        <View style={styles.gap} />
        <PrimaryButton label="Mon profil" onPress={() => router.push('/profile')} />
      </ScrollView>
    </Screen>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  highlight,
}: {
  label: string;
  value: string;
  onCopy: (label: string, value: string) => void;
  highlight?: boolean;
}) {
  return (
    <Pressable style={styles.copyRow} onPress={() => onCopy(label, value)}>
      <View style={styles.copyContent}>
        <Text style={styles.copyLabel}>{label}</Text>
        <Text style={[styles.copyValue, highlight && styles.copyHighlight]}>{value}</Text>
      </View>
      <Text style={styles.copyAction}>Copier</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  step: { fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 6 },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  copyContent: { flex: 1 },
  copyLabel: { fontSize: 12, color: colors.textMuted },
  copyValue: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },
  copyHighlight: { color: colors.primary },
  copyAction: { fontSize: 13, color: colors.primaryLight, fontWeight: '600' },
  gap: { height: spacing.sm },
});
