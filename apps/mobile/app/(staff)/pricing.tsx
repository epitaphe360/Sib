import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { fetchVipPrice, updateVipPrice } from '../../src/api/admin';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

export default function StaffPricingScreen() {
  const [price, setPrice] = useState('');
  const [current, setCurrent] = useState(0);

  const load = useCallback(async () => {
    const p = await fetchVipPrice();
    setCurrent(p);
    setPrice(String(p || ''));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const n = Number.parseFloat(price.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    try {
      await updateVipPrice(n);
      setCurrent(n);
      Alert.alert('Enregistré', 'Tarif VIP mis à jour sur le site et l\'app');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Sauvegarde impossible');
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenTitle title="Tarif Pass VIP" subtitle={`Actuel : ${current} EUR`} />
        <Input label="Nouveau prix (EUR)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <PrimaryButton label="Enregistrer" onPress={save} />
        <Text style={styles.hint}>Appliqué aux niveaux premium et vip (visitor_levels).</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: spacing.md, color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
