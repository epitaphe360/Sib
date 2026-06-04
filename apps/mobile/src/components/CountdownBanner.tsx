import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SALON_INFO } from '../data/salons';
import { useI18n } from '../i18n/I18nProvider';
import { colors, spacing } from '../theme';

function daysUntil(iso: string): number | null {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function CountdownBanner() {
  const { t } = useI18n();
  const [days, setDays] = useState<number | null>(() =>
    daysUntil(SALON_INFO.opensAt ?? SALON_INFO.dates)
  );

  useEffect(() => {
    const tick = () => setDays(daysUntil(SALON_INFO.opensAt ?? ''));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (days === null) return null;

  const label =
    days === 0
      ? t('home.countdown.today')
      : t('home.countdown.days').replace('{{days}}', String(days));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.meta}>{SALON_INFO.dates} · {SALON_INFO.city}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  label: { color: '#fff', fontWeight: '800', fontSize: 15 },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },
});
