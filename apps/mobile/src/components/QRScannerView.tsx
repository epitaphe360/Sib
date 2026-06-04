import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing } from '../theme';

interface QRScannerViewProps {
  onScan: (data: string) => void;
  active?: boolean;
}

export function QRScannerView({ onScan, active = true }: QRScannerViewProps) {
  const { t } = useI18n();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.text}>{t('scanner.webOnlyManual')}</Text>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.placeholder}><Text style={styles.text}>{t('scanner.cameraLoading')}</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.text}>{t('scanner.cameraPermission')}</Text>
        <Pressable style={styles.btn} onPress={requestPermission} accessibilityRole="button">
          <Text style={styles.btnText}>{t('scanner.cameraAllow')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          active && !scanned
            ? ({ data }) => {
                setScanned(true);
                onScan(data);
                setTimeout(() => setScanned(false), 2000);
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 260, borderRadius: 12, overflow: 'hidden', marginBottom: spacing.md },
  camera: { flex: 1 },
  placeholder: { height: 160, backgroundColor: colors.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: spacing.md, marginBottom: spacing.md },
  text: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm },
  btn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
