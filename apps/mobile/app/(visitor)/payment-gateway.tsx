import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { AppIcon, type AppIconName } from '../../src/components/AppIcon';
import { useAuth } from '../../src/context/AuthContext';
import { SALON_INFO } from '../../src/data/salons';
import {
  activateVipPass,
  capturePaypalOrder,
  createCmiOrder,
  createPaypalOrder,
  verifyCmiPayment,
  PAYMENT_ENABLED,
  type PaymentMethod,
} from '../../src/api/paymentGateway';
import { getPaymentRequest } from '../../src/services/payment';
import { useI18n } from '../../src/i18n/I18nProvider';
import { navigateAfterAuth } from '../../src/lib/navigateAfterAuth';
import { navigateSafe, requireAuth } from '../../src/lib/navigateSafe';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

type MethodCard = {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: AppIconName;
  color: string;
};

const METHODS: MethodCard[] = [
  { id: 'paypal', title: 'PayPal', subtitle: 'Paiement sécurisé international', icon: 'card-outline', color: '#003087' },
  { id: 'cmi', title: 'Carte bancaire (CMI)', subtitle: 'Visa, Mastercard, CIH, Attijariwafa…', icon: 'business-outline', color: '#1A5276' },
  { id: 'bank_transfer', title: 'Virement bancaire', subtitle: 'Délai 2–5 jours ouvrés', icon: 'swap-horizontal-outline', color: '#666' },
];

export default function PaymentGatewayScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(700);
  const [currency, setCurrency] = useState('MAD');

  const load = useCallback(async () => {
    if (!id || !user) return;
    try {
      const req = await getPaymentRequest(id);
      if (req) {
        setAmount(req.amount);
        // currency isn't on base PaymentRequest — keep MAD default
      }
    } catch { /* silently fallback to defaults */ }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  const proceed = async () => {
    if (!requireAuth(user, t)) return;
    if (!selected) {
      Alert.alert(t('payment.gateway.title'), t('payment.gateway.chooseMethod'));
      return;
    }

    if (selected === 'bank_transfer') {
      navigateSafe(`/payment/${id ?? 'new'}`);
      return;
    }

    setLoading(true);
    try {
      let order;
      if (selected === 'paypal') {
        order = await createPaypalOrder({
          userId: user.id,
          amount,
          currency,
          description: `Pass VIP ${SALON_INFO.name} — ${user.name}`,
        });
      } else {
        order = await createCmiOrder({
          userId: user.id,
          amount,
          currency,
          description: `Pass VIP ${SALON_INFO.name}`,
          email: user.email,
          name: user.name,
        });
      }

      // Ouvrir WebView paiement
      const result = await WebBrowser.openAuthSessionAsync(
        order.approvalUrl,
        'urbaevent://payment-callback'
      );

      if (result.type === 'success') {
        let paymentResult;
        if (selected === 'paypal') {
          paymentResult = await capturePaypalOrder(order.orderId);
        } else {
          paymentResult = await verifyCmiPayment(order.orderId);
        }

        if (paymentResult.success) {
          await activateVipPass({
            userId: user.id,
            paymentMethod: selected,
            orderId: order.orderId,
            amount,
            currency,
          });
          await refreshUser();
          Alert.alert(
            t('payment.gateway.successTitle'),
            t('payment.gateway.successBody'),
            [{ text: t('common.ok') ?? 'OK', onPress: () => navigateAfterAuth(user!) }]
          );
        } else {
          Alert.alert(t('payment.gateway.pendingTitle'), t('payment.gateway.pendingBody'));
        }
      } else if (result.type === 'dismiss') {
        Alert.alert(t('payment.gateway.cancelledTitle') ?? 'Paiement annulé', t('payment.gateway.cancelledBody') ?? 'La fenêtre de paiement a été fermée.');
      }
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('payment.gateway.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <EmptyState message={t('payment.loginRequired')} />
        <PrimaryButton label={t('login.submit')} onPress={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenTitle title={t('payment.gateway.title')} subtitle={t('payment.gateway.subtitle')} />

        {!PAYMENT_ENABLED && (
          <View style={styles.comingSoonBanner}>
            <AppIcon name="construct-outline" size={24} color={colors.warning} />
            <View style={styles.comingSoonText}>
              <Text style={styles.comingSoonTitle}>Paiement en ligne — Bientôt disponible</Text>
              <Text style={styles.comingSoonSub}>
                L'intégration PayPal et CMI est prête. Les credentials seront activés avant l'ouverture du salon.{'\n'}
                Utilisez le virement bancaire en attendant.
              </Text>
            </View>
          </View>
        )}

        {/* Récapitulatif */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pass VIP {SALON_INFO.name}</Text>
          <Text style={styles.summaryPrice}>{amount} {currency}</Text>
          <Text style={styles.summaryDesc}>Accès premium · Conférences exclusives · Salon VIP</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('payment.gateway.chooseMethod')}</Text>

        {METHODS.map((m) => (
          <MethodCard
            key={m.id}
            method={m}
            selected={selected === m.id}
            disabled={!PAYMENT_ENABLED && m.id !== 'bank_transfer'}
            onPress={() => setSelected(m.id)}
          />
        ))}

        <View style={styles.securityNote}>
          <AppIcon name="lock-closed-outline" size={14} color={colors.textMuted} />
          <Text style={styles.securityText}>{t('payment.gateway.secureNote')}</Text>
        </View>

        <PrimaryButton
          label={loading ? t('common.loading') : `${t('payment.gateway.pay')} ${amount} ${currency}`}
          onPress={proceed}
          loading={loading}
          disabled={!selected}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton
          label={t('common.cancel')}
          variant="outline"
          onPress={() => router.back()}
        />
      </ScrollView>
    </Screen>
  );
}

function MethodCard({ method, selected, onPress, disabled }: { method: MethodCard; selected: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={{ opacity: disabled ? 0.45 : 1 }}>
      <Card style={selected ? [styles.methodCard, { borderColor: colors.primary, borderWidth: 2 }] : styles.methodCard}>
        <View style={styles.methodCardInner}>
          <View style={styles.methodIconWrap}>
            <AppIcon name={method.icon} size={24} color={method.color} />
          </View>
          <View style={styles.methodContent}>
            <Text style={[styles.methodTitle, { color: method.color }]}>{method.title}</Text>
            <Text style={styles.methodSub}>{method.subtitle}</Text>
            {disabled && <Text style={styles.methodDisabledTag}>Bientôt disponible</Text>}
          </View>
          <Text style={[styles.radio, selected && styles.radioSelected]}>{selected ? '●' : '○'}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  summaryCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  summaryLabel: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  summaryPrice: { color: '#fff', fontFamily: fonts.display, fontSize: 40, marginBottom: spacing.xs },
  summaryDesc: { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  methodCard: { marginBottom: spacing.sm, padding: spacing.md },
  methodCardInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: 0 },
  methodIconWrap: { width: 32, alignItems: 'center' },
  methodContent: { flex: 1 },
  methodTitle: { fontFamily: fonts.bodyBold, fontSize: 15 },
  methodSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, marginTop: 2 },
  radio: { fontSize: 22, color: colors.border },
  radioSelected: { color: colors.primary },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginVertical: spacing.md },
  securityText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  comingSoonBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  comingSoonText: { flex: 1 },
  comingSoonTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.warning, marginBottom: 4 },
  comingSoonSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  methodDisabledTag: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
    fontStyle: 'italic',
  },
});
