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
import { resolveBankTransfer, resolveVipPass } from '../../src/api/appContent';
import { generatePaymentReference } from '../../src/data/bankTransfer';
import { useAppContent } from '../../src/hooks/useAppContent';
import { getPaymentRequest } from '../../src/services/payment';
import { useI18n } from '../../src/i18n/I18nProvider';
import { navigateSafe } from '../../src/lib/navigateSafe';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const { content } = useAppContent();
  const bank = resolveBankTransfer(content);
  const vipPass = resolveVipPass(content);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState(vipPass.currency);
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
        setCurrency(request.currency);
        setStatus(request.status);
      }
      setReference(generatePaymentReference(user.id));
    } catch {
      Alert.alert(t('common.error'), t('payment.loadError'));
    } finally {
      setLoading(false);
    }
  }, [id, user, t]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    Alert.alert(t('payment.copiedTitle'), t('payment.copiedBody').replace('{{label}}', label));
  };

  if (!user) {
    return (
      <Screen>
        <EmptyState message={t('payment.loginRequired')} />
        <PrimaryButton label={t('login.submit')} onPress={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <ScreenTitle title={t('payment.title')} subtitle={t('common.loading')} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenTitle
          title={t('payment.title')}
          subtitle={`${amount} ${currency} — ${
            status === 'approved'
              ? t('payment.approved')
              : status === 'rejected'
                ? t('payment.rejected')
                : t('payment.pending')
          }`}
        />
        {/* Option paiement en ligne */}
        <PrimaryButton
          label={t('payment.gateway.title')}
          variant="gold"
          onPress={() => router.push({ pathname: '/(visitor)/payment-gateway', params: { id } })}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label={t('payment.refresh')}
          variant="outline"
          onPress={async () => {
            setLoading(true);
            await load();
            await refreshUser();
            setLoading(false);
          }}
        />
        <View style={styles.gap} />

        <Card>
          <Text style={styles.sectionLabel}>{t('payment.stepsTitle')}</Text>
          {[
            t('payment.stepTransfer').replace('{{amount}}', String(amount)).replace('{{currency}}', currency),
            t('payment.stepReference'),
            t('payment.stepReceipt'),
            t('payment.stepActivation'),
          ].map((step, i) => (
            <Text key={step} style={styles.step}>
              {i + 1}. {step}
            </Text>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionLabel}>{t('payment.bankDetailsTitle')}</Text>
          <CopyRow label={t('payment.bankName')} value={bank.bankName} onCopy={copy} t={t} />
          <CopyRow label={t('payment.accountHolder')} value={bank.accountHolder} onCopy={copy} t={t} />
          <CopyRow label={t('payment.iban')} value={bank.iban} onCopy={copy} t={t} />
          <CopyRow label={t('payment.bic')} value={bank.bic} onCopy={copy} t={t} />
          <CopyRow label={t('payment.referenceLabel')} value={reference} onCopy={copy} t={t} highlight />
        </Card>

        <PrimaryButton label={t('common.home')} onPress={() => router.replace('/')} />
        <View style={styles.gap} />
        <PrimaryButton label={t('tabs.profile')} onPress={() => navigateSafe('/(visitor)/(tabs)/profile')} />
      </ScrollView>
    </Screen>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  highlight,
  t,
}: {
  label: string;
  value: string;
  onCopy: (label: string, value: string) => void;
  highlight?: boolean;
  t: (key: string) => string;
}) {
  return (
    <Pressable style={styles.copyRow} onPress={() => onCopy(label, value)}>
      <View style={styles.copyContent}>
        <Text style={styles.copyLabel}>{label}</Text>
        <Text style={[styles.copyValue, highlight && styles.copyHighlight]}>{value}</Text>
      </View>
      <Text style={styles.copyAction}>{t('payment.copy')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  step: { fontSize: 14, fontFamily: fonts.body, color: colors.text, lineHeight: 22, marginBottom: 6 },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  copyContent: { flex: 1 },
  copyLabel: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textMuted },
  copyValue: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.text, marginTop: 2 },
  copyHighlight: { color: colors.primary },
  copyAction: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.primaryLight },
  gap: { height: spacing.sm },
});
