import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { onSiteRegistration } from '../../../src/api/serviceClient';
import { Input, PrimaryButton, Screen, ScreenTitle, SecondaryButton } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function OnSiteRegistrationScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('MA');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ userId: string; badgeCode: string } | null>(null);

  const reset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCountry('MA');
    setSector('');
    setSuccess(null);
  };

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert(t('auth.register.fillRequired'));
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      const result = await onSiteRegistration({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        country: country.trim(),
        sector: sector.trim(),
        operatorId: user.id,
      });
      setSuccess(result);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Inscription réussie</Text>
          <Text style={styles.successName}>{firstName} {lastName}</Text>
          <View style={styles.badgeCodeBox}>
            <Text style={styles.badgeCodeLabel}>Code badge</Text>
            <Text style={styles.badgeCode}>{success.badgeCode}</Text>
          </View>
          <Text style={styles.successHint}>
            Le participant peut maintenant utiliser son email pour se connecter à l'application.
          </Text>

          <PrimaryButton
            label="Imprimer le badge"
            onPress={() => router.push('/(service-client)/(tabs)/lookup' as never)}
          />
          <View style={{ height: spacing.sm }} />
          <SecondaryButton label="Nouvelle inscription" onPress={reset} />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <ScreenTitle title="Inscription sur place" subtitle="Enregistrement visiteur à l'accueil" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <Input
            label={`${t('auth.register.firstName')} *`}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Input
            label={`${t('auth.register.lastName')} *`}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Input
            label={`${t('auth.email')} *`}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />
          <Input
            label={t('team.phone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations professionnelles</Text>
          <Input
            label={t('auth.register.country')}
            value={country}
            onChangeText={setCountry}
            autoCapitalize="characters"
            placeholder="MA, FR, ES…"
            returnKeyType="next"
          />
          <Input
            label={`${t('auth.register.sector')} *`}
            value={sector}
            onChangeText={setSector}
            autoCapitalize="sentences"
            placeholder="BTP, Immobilier, Urbanisme…"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </View>

        <PrimaryButton
          label={loading ? t('common.loading') : 'Inscrire et générer le badge'}
          onPress={submit}
          loading={loading}
          disabled={!firstName.trim() || !lastName.trim() || !email.trim()}
        />
        <View style={{ height: spacing.sm }} />
        <SecondaryButton label="Annuler" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  successContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: spacing.md },
  successIcon: { fontSize: 64, marginBottom: spacing.md },
  successTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.success, marginBottom: spacing.sm },
  successName: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.text, marginBottom: spacing.lg },
  badgeCodeBox: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  badgeCodeLabel: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  badgeCode: { color: '#fff', fontFamily: fonts.display, fontSize: 28, letterSpacing: 2 },
  successHint: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
});
