import { ScrollView, StyleSheet } from 'react-native';
import { SalonGate } from '../../src/components/guards/SalonGate';
import { SalonMiniHomeSection } from '../../src/components/home/SalonMiniHomeSection';
import { Screen } from '../../src/components/ui';
import { useSalon } from '../../src/context/SalonContext';

export default function SalonPresentationScreen() {
  const { activeSalon } = useSalon();

  return (
    <SalonGate>
      <Screen style={styles.screen}>
        {activeSalon ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <SalonMiniHomeSection salon={activeSalon} />
          </ScrollView>
        ) : null}
      </Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  scroll: { paddingBottom: 24 },
});
