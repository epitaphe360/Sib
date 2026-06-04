import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeroBanner } from '../../../src/components/HeroBanner';
import { QuickActionGrid } from '../../../src/components/QuickActionGrid';
import { Card, PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { APP_IMAGES } from '../../../src/data/images';
import { SALON_INFO } from '../../../src/data/salons';
import { colors, spacing } from '../../../src/theme';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroBanner
          title={SALON_INFO.name}
          subtitle={`${SALON_INFO.dates} · ${SALON_INFO.city}\n${SALON_INFO.hours}`}
        />

        <Card>
          <Text style={styles.venue}>{SALON_INFO.venue}</Text>
          <Text style={styles.note}>{SALON_INFO.startDayNote}</Text>
          <View style={styles.statsRow}>
            <Stat label="Exposants" value={SALON_INFO.stats.exhibitors} />
            <Stat label="Visiteurs" value={SALON_INFO.stats.visitors} />
            <Stat label="Pays" value={SALON_INFO.stats.countries} />
          </View>
        </Card>

        <Image source={APP_IMAGES.banner} style={styles.banner} resizeMode="cover" />

        <Text style={styles.sectionTitle}>Accès rapide</Text>
        <QuickActionGrid hideLogin={!!user} />

        <PrimaryButton
          label={user ? 'Voir mon badge QR' : 'Demandez votre badge gratuit'}
          onPress={() => router.push(user ? '/(visitor)/(tabs)/badge' : '/(auth)/register')}
        />

        <View style={styles.highlight}>
          <Image source={APP_IMAGES.networking} style={styles.highlightImg} resizeMode="cover" />
          <View style={styles.highlightOverlay} />
          <View style={styles.highlightContent}>
            <Text style={styles.highlightTitle}>Networking B2B & B2C</Text>
            <Text style={styles.highlightText}>
              Rencontrez les acteurs du BTP, de l'immobilier et de l'urbanisme au Parc Mohammed VI.
            </Text>
            <PrimaryButton label="Annuaire exposants" onPress={() => router.push('/(visitor)/(tabs)/exhibitors')} />
          </View>
        </View>

        {!user && (
          <Text style={styles.loginHint}>
            Déjà inscrit ?{' '}
            <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
              Se connecter
            </Text>
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  venue: { fontSize: 16, fontWeight: '600', color: colors.text },
  note: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  banner: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  highlight: {
    marginTop: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 220,
    marginBottom: spacing.md,
  },
  highlightImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 54, 93, 0.78)',
  },
  highlightContent: { padding: spacing.md, zIndex: 1, marginTop: 60 },
  highlightTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  highlightText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  loginHint: { textAlign: 'center', marginTop: spacing.md, color: colors.textMuted, marginBottom: spacing.lg },
  link: { color: colors.primaryLight, fontWeight: '600' },
});
