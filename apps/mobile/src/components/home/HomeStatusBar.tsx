import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppUser } from '../../types';
import { colors, fonts, radius, spacing } from '../../theme';

type Props = {
  online: boolean;
  user: AppUser | null;
};

/** Visibilité de l'état système (Nielsen #1) : connexion + statut compte. */
export function HomeStatusBar({ online, user }: Props) {
  const { t } = useI18n();

  const accountLabel = !user
    ? t('home.status.guest')
    : user.status === 'pending_payment'
      ? t('home.status.pendingPayment')
      : user.visitorLevel === 'vip' || user.visitorLevel === 'premium'
        ? t('home.status.vip')
        : t('home.status.connected');

  const accountTone =
    !user ? 'muted' : user.status === 'pending_payment' ? 'warning' : 'ok';

  return (
    <View style={styles.row} accessibilityRole="summary">
      <StatusChip
        icon={online ? 'pulse-outline' : 'alert-circle-outline'}
        label={online ? t('home.status.online') : t('common.offline')}
        tone={online ? 'ok' : 'warning'}
      />
      <StatusChip
        icon={user ? 'person-outline' : 'log-in-outline'}
        label={accountLabel}
        tone={accountTone}
      />
    </View>
  );
}

function StatusChip({
  icon,
  label,
  tone,
}: {
  icon: 'pulse-outline' | 'alert-circle-outline' | 'person-outline' | 'log-in-outline';
  label: string;
  tone: 'ok' | 'warning' | 'muted';
}) {
  const bg =
    tone === 'ok' ? colors.successBg : tone === 'warning' ? colors.warningBg : colors.borderLight;
  const fg =
    tone === 'ok' ? colors.success : tone === 'warning' ? colors.warning : colors.textMuted;

  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <AppIcon name={icon} size={14} color={fg} />
      <Text style={[styles.chipText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    maxWidth: '48%',
    flexGrow: 1,
  },
  chipText: { fontSize: 12, fontFamily: fonts.bodySemiBold, flexShrink: 1 },
});
