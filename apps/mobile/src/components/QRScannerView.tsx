import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing } from '../theme';

interface QRScannerViewProps {
  onScan: (data: string) => void;
  active?: boolean;
  fullScreen?: boolean;
}

export function QRScannerView({ onScan, active = true, fullScreen = false }: QRScannerViewProps) {
  const { t } = useI18n();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.placeholder, fullScreen && styles.placeholderFull]}>
        <Text style={styles.webIcon}>📷</Text>
        <Text style={styles.text}>{t('scanner.webOnlyManual')}</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.placeholder, fullScreen && styles.placeholderFull]}>
        <Text style={styles.text}>{t('scanner.cameraLoading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.placeholder, fullScreen && styles.placeholderFull]}>
        <Text style={styles.webIcon}>📷</Text>
        <Text style={styles.text}>{t('scanner.cameraPermission')}</Text>
        <Pressable style={styles.btn} onPress={requestPermission} accessibilityRole="button">
          <Text style={styles.btnText}>{t('scanner.cameraAllow')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, fullScreen && styles.wrapFull]}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          active && !scanned
            ? ({ data }) => {
                setScanned(true);
                onScan(data);
                const t = setTimeout(() => setScanned(false), 2000);
                return () => clearTimeout(t);
              }
            : undefined
        }
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={[styles.frame, scanned && styles.frameScanned]}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.hint}>
            {scanned ? t('scanner.scanned') : t('scanner.aimQr')}
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.torchBtn}
        onPress={() => setTorch((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={torch ? t('scanner.torchOff') : t('scanner.torchOn')}
      >
        <Text style={styles.torchIcon}>{torch ? '🔦' : '💡'}</Text>
      </Pressable>
    </View>
  );
}

const FRAME_SIZE = 220;
const CORNER_SIZE = 24;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  wrap: {
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: '#000',
  },
  wrapFull: {
    height: undefined,
    flex: 1,
    marginBottom: 0,
    borderRadius: 0,
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: { flex: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.45)' },
  overlayMiddle: { flexDirection: 'row', width: '100%' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  frameScanned: { opacity: 0.6 },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#4ADE80',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 4,
  },
  hint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  torchBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchIcon: { fontSize: 20 },
  placeholder: {
    height: 280,
    backgroundColor: colors.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  placeholderFull: {
    flex: 1,
    height: undefined,
    marginBottom: 0,
    borderRadius: 0,
  },
  webIcon: { fontSize: 40, marginBottom: spacing.sm },
  text: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm, fontSize: 15 },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
