import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { VIP_PASS } from '../../src/data/bankTransfer';
import { SALON_INFO } from '../../src/data/salons';
import { fetchVipPassPricing } from '../../src/services/visitorLevel';
import { colors, spacing } from '../../src/theme';

const SECTORS = [
  'BTP / Construction',
  'Architecture',
  'Immobilier',
  'Industrie',
  'Institutionnel',
  'Autre',
];

export default function RegisterVipScreen() {
  const { requestVisitorSignup } = useAuth();
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [country, setCountry] = useState('MA');
  const [sector, setSector] = useState(SECTORS[0]);
  const [loading, setLoading] = useState(false);
  const [vipPrice, setVipPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchVipPassPricing()
      .then((p) => setVipPrice(p.price))
      .catch(() => setVipPrice(null));
  }, []);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email.trim()) {
      Alert.alert(t('common.error'), t('auth.register.fillRequired'));
      return;
    }
    setLoading(true);
    try {
      await requestVisitorSignup({
        intent: 'vip',
        email: email.trim(),
        firstName,
        lastName,
        country,
        sector,
        phone,
        company,
        position,
      });
      Alert.alert(t('auth.magic.sentTitle'), t('auth.magic.vipRegisterBody'), [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('auth.magic.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ScreenTitle
            title="Pass Premium VIP"
            subtitle={
              vipPrice != null
                ? `Accès complet ${SALON_INFO.name} — ${vipPrice} ${VIP_PASS.currency}`
                : `Accès complet ${SALON_INFO.name}`
            }
          />
          <Card>
            <Text style={styles.vipHint}>
              Après inscription, vous recevrez les instructions de virement bancaire pour activer votre pass VIP.
            </Text>
          </Card>
          <Input label="Prénom *" value={firstName} onChangeText={setFirstName} />
          <Input label="Nom *" value={lastName} onChangeText={setLastName} />
          <Input
            label="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.vipMagic}>{t('auth.magic.noPassword')}</Text>
          <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Entreprise" value={company} onChangeText={setCompany} />
          <Input label="Fonction" value={position} onChangeText={setPosition} />
          <Input label="Pays (code)" value={country} onChangeText={setCountry} autoCapitalize="characters" />
          <Input label="Secteur *" value={sector} onChangeText={setSector} />
          <PrimaryButton label={t('vip.submit')} onPress={handleRegister} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  vipHint: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  vipMagic: { fontSize: 14, color: colors.primary, marginBottom: spacing.md, fontWeight: '600' },
});
