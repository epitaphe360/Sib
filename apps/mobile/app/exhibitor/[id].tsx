import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, EmptyState, Screen } from '../../src/components/ui';
import { APP_IMAGES } from '../../src/data/images';
import { fetchExhibitorById } from '../../src/services/exhibitors';
import type { Exhibitor } from '../../src/types';
import { colors, spacing } from '../../src/theme';

export default function ExhibitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchExhibitorById(id)
      .then(setExhibitor)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (error || !exhibitor) {
    return (
      <Screen>
        <EmptyState message={error ?? 'Exposant introuvable'} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={APP_IMAGES.expo} style={styles.hero} imageStyle={styles.heroImg}>
          <View style={styles.heroOverlay} />
          {exhibitor.logoUrl ? (
            <Image source={{ uri: exhibitor.logoUrl }} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoLetter}>{exhibitor.companyName.charAt(0)}</Text>
            </View>
          )}
        </ImageBackground>

        <Text style={styles.name}>{exhibitor.companyName}</Text>
        <Text style={styles.sector}>{exhibitor.sector}</Text>
        {exhibitor.featured ? <Text style={styles.featured}>Exposant à la une</Text> : null}

        <Card>
          {exhibitor.standNumber ? <InfoRow label="N° Stand" value={exhibitor.standNumber} /> : null}
          {exhibitor.hallNumber ? <InfoRow label="N° Hall" value={exhibitor.hallNumber} /> : null}
          <InfoRow label="Secteur" value={exhibitor.sector} />
        </Card>

        {exhibitor.description ? (
          <Card>
            <Text style={styles.blockTitle}>Présentation</Text>
            <Text style={styles.description}>{exhibitor.description}</Text>
          </Card>
        ) : null}

        {(exhibitor.website || exhibitor.contactEmail || exhibitor.contactPhone) && (
          <Card>
            <Text style={styles.blockTitle}>Contact</Text>
            {exhibitor.website ? (
              <Pressable onPress={() => Linking.openURL(exhibitor.website!)}>
                <Text style={styles.link}>{exhibitor.website}</Text>
              </Pressable>
            ) : null}
            {exhibitor.contactEmail ? <InfoRow label="Email" value={exhibitor.contactEmail} /> : null}
            {exhibitor.contactPhone ? <InfoRow label="Téléphone" value={exhibitor.contactPhone} /> : null}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { height: 160, alignItems: 'center', justifyContent: 'center', borderRadius: 16, overflow: 'hidden', marginBottom: spacing.md },
  heroImg: { borderRadius: 16 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(27,54,93,0.65)' },
  logo: { width: 88, height: 88, backgroundColor: '#fff', borderRadius: 12, zIndex: 1 },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoLetter: { color: '#fff', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  sector: { fontSize: 15, color: colors.primaryLight, marginTop: 6, textAlign: 'center', fontWeight: '600' },
  featured: { textAlign: 'center', color: colors.vip, fontWeight: '700', marginTop: 8, fontSize: 12 },
  blockTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', marginBottom: 8 },
  description: { fontSize: 15, color: colors.text, lineHeight: 22 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase' },
  value: { fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 4 },
  link: { color: colors.primaryLight, fontSize: 15, fontWeight: '600', marginBottom: 8 },
});
