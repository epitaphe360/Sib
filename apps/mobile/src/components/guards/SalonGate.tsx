import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSalon } from '../../context/SalonContext';
import { useI18n } from '../../i18n/I18nProvider';
import { colors } from '../../theme';
import { BrandLogo } from '../brand/BrandLogo';
import { IllustratedEmpty, PrimaryButton, Screen } from '../ui';

type Props = {
  children: React.ReactNode;
};

export function SalonGate({ children }: Props) {
  const { activeSalon, loading } = useSalon();
  const { t } = useI18n();

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (!activeSalon) {
    return (
      <Screen style={styles.center}>
        <BrandLogo size="lg" style={styles.logo} />
        <IllustratedEmpty
          icon="grid-outline"
          title={t('salon.gateTitle')}
          message={t('salon.gateMessage')}
        />
        <PrimaryButton
          label={t('salon.gateCta')}
          variant="gold"
          onPress={() => router.replace('/(visitor)/(tabs)' as never)}
        />
      </Screen>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { marginBottom: 16 },
});
