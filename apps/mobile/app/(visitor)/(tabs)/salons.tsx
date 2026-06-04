import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { HeroBanner } from '../../../src/components/HeroBanner';
import { SalonCard } from '../../../src/components/SalonCard';
import { Screen } from '../../../src/components/ui';
import { SALONS } from '../../../src/data/salons';

export default function SalonsScreen() {
  return (
    <Screen style={styles.flex}>
      <HeroBanner
        imageKey="expo"
        title="UrbaEvent"
        subtitle="5 salons · Écosystème urbain & BTP"
        compact
      />
      <FlatList
        data={SALONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SalonCard
            salon={item}
            onPress={() => {
              if (item.active) router.push('/exhibitors');
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingBottom: 0 },
});
