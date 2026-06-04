import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { scanLeadForExhibitor, scanLeadFromQr } from '../../src/api/scanner';
import { QRScannerView } from '../../src/components/QRScannerView';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

export default function ExhibitorScanScreen() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(true);

  const processCode = async (raw: string) => {
    if (!user || !raw.trim()) return;
    try {
      const trimmed = raw.trim();
      const result = trimmed.includes('.')
        ? await scanLeadFromQr(trimmed, user.id)
        : await scanLeadForExhibitor(trimmed, user.id);
      setLastResult(result.valid ? `Contact enregistré : ${result.userName ?? trimmed}` : result.reason ?? 'Échec');
      if (!result.valid) Alert.alert('Scan', result.reason ?? 'Badge invalide');
      else setCode('');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Scan impossible');
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenTitle title="Scanner contacts" subtitle="Scannez le badge visiteur au stand" />
        {useCamera ? (
          <>
            <QRScannerView onScan={processCode} />
            <PrimaryButton label="Saisie manuelle" onPress={() => setUseCamera(false)} />
          </>
        ) : (
          <>
            <Input label="Code badge / QR" value={code} onChangeText={setCode} autoCapitalize="none" />
            <PrimaryButton label="Enregistrer le contact" onPress={() => processCode(code)} />
            <View style={styles.gap} />
            <PrimaryButton label="Utiliser la caméra" onPress={() => setUseCamera(true)} />
          </>
        )}
        {lastResult && (
          <View style={styles.result}>
            <Text style={styles.resultText}>{lastResult}</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { height: spacing.sm },
  result: { marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 12 },
  resultText: { color: colors.text, fontSize: 14 },
});