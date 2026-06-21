import React, { useEffect } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';
import { playScanError, playScanSuccess } from '../lib/scanSound';
import { useI18n } from '../i18n/I18nProvider';
import { AppIcon } from './AppIcon';
import { colors, fonts, spacing } from '../theme';

export type ScanFlashStatus = 'granted' | 'denied' | 'warning';

type Props = {
  status: ScanFlashStatus;
  message: string;
  visible: boolean;
  onDismiss: () => void;
};

const COLORS: Record<ScanFlashStatus, string> = {
  granted: '#16a34a',
  denied: '#dc2626',
  warning: '#ea580c',
};

const ICONS = {
  granted: 'checkmark-circle-outline' as const,
  denied: 'close-circle-outline' as const,
  warning: 'alert-circle-outline' as const,
};

export function ScanResultFlash({ status, message, visible, onDismiss }: Props) {
  const { t } = useI18n();
  useEffect(() => {
    if (!visible) return;
    if (status === 'granted') {
      Vibration.vibrate(80);
      playScanSuccess();
    } else if (status === 'denied') {
      Vibration.vibrate([0, 120, 80, 120]);
      playScanError();
    } else {
      Vibration.vibrate([0, 60, 40, 60]);
      playScanError();
    }

    const timer = setTimeout(onDismiss, 2200);
    return () => clearTimeout(timer);
  }, [visible, status, onDismiss]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: COLORS[status] }]}>
      <AppIcon name={ICONS[status]} size={64} color="#fff" />
      <Text style={styles.title}>
        {status === 'granted' ? t('scanner.granted') : status === 'denied' ? t('scanner.denied') : t('common.warning') ?? 'Attention'}
      </Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    zIndex: 100,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bodyBold,
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.95)',
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
