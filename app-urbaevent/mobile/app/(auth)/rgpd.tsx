import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { saveRgpdConsent } from '../../src/lib/rgpd';
import { useI18n } from '../../src/i18n/I18nProvider';
import { PLATFORM } from '../../src/config/platform';
import { SALON_INFO } from '../../src/data/salons';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function RgpdScreen() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    setLoading(true);
    try {
      await saveRgpdConsent(true);
      router.replace('/(auth)/register');
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const decline = async () => {
    try {
      await saveRgpdConsent(false);
      router.replace('/(auth)/login');
    } catch {
      router.replace('/(auth)/login');
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScreenTitle
          title="Politique de confidentialité"
          subtitle="Protection de vos données personnelles — RGPD"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données collectées</Text>
          <Text style={styles.body}>
            Dans le cadre du Salon International du Bâtiment ({SALON_INFO.name}), nous collectons vos données
            personnelles (nom, email, téléphone, secteur d'activité) pour la gestion de votre inscription,
            badge d'accès, et la communication relative à l'événement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finalité du traitement</Text>
          <Text style={styles.body}>
            Vos données sont utilisées pour :{'\n'}
            • Générer et gérer votre badge d'accès{'\n'}
            • Faciliter les rendez-vous B2B et le networking{'\n'}
            • Envoyer des notifications relatives à l'événement{'\n'}
            • Établir des statistiques de fréquentation anonymisées
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée de conservation</Text>
          <Text style={styles.body}>
            Vos données sont conservées pendant 2 ans après l'événement, puis supprimées ou anonymisées.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos droits</Text>
          <Text style={styles.body}>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression
            et de portabilité de vos données. Pour exercer ces droits, contactez{' '}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL(`mailto:${PLATFORM.privacyEmail}`)}
            >
              {PLATFORM.privacyEmail}
            </Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partage des données</Text>
          <Text style={styles.body}>
            Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec les exposants
            et partenaires du salon uniquement dans le cadre du networking B2B, avec votre consentement explicite.
          </Text>
        </View>

        <Text style={styles.note}>
          En acceptant, vous consentez au traitement de vos données selon les conditions décrites ci-dessus.
          Vous pouvez retirer votre consentement à tout moment depuis votre profil.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t('rgpd.acceptCta')} onPress={accept} loading={loading} />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton label={t('rgpd.declineCta')} variant="outline" onPress={decline} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  link: { color: colors.primary, textDecorationLine: 'underline' },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  footer: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
