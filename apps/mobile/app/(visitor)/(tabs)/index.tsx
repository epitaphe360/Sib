import { StyleSheet } from 'react-native';
import { UrbaEventHomeContent } from '../../../src/components/home/UrbaEventHomeContent';
import { SalonInteriorContent } from '../../../src/components/home/SalonInteriorContent';
import { useSalon } from '../../../src/context/SalonContext';
import { Screen } from '../../../src/components/ui';

export default function HomeScreen() {
  const { activeSalon } = useSalon();

  return (
    <Screen style={styles.screen}>
      {activeSalon ? <SalonInteriorContent /> : <UrbaEventHomeContent />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    backgroundColor: '#F9F9FF',
  },
});
