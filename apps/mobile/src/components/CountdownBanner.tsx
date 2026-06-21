import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SALON_INFO } from '../data/salons';
import { useI18n } from '../i18n/I18nProvider';
import { AppIcon } from './AppIcon';
import { colors, fonts, radius, spacing } from '../theme';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  started: boolean;
}

function getTimeLeft(iso: string): TimeLeft | null {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, started: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, started: false };
}

export function CountdownBanner() {
  const { t } = useI18n();
  const [time, setTime] = useState<TimeLeft | null>(() => getTimeLeft(SALON_INFO.opensAt ?? ''));

  useEffect(() => {
    const tick = () => setTime(getTimeLeft(SALON_INFO.opensAt ?? ''));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (time === null) return null;

  if (time.started) {
    return (
      <View style={styles.wrap}>
        <View style={styles.badge}>
          <AppIcon name="checkmark" size={22} color={colors.primary} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.label}>{t('home.countdown.today')}</Text>
          <Text style={styles.meta}>{SALON_INFO.dates} · {SALON_INFO.city}</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeNum}>{time.days}</Text>
        <Text style={styles.badgeUnit}>j</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>
          {t('home.countdown.days').replace('{{days}}', String(time.days))}
        </Text>
        <Text style={styles.meta}>{SALON_INFO.dates} · {SALON_INFO.city}</Text>
      </View>
      {time.days < 30 && (
        <View style={styles.timeBlock}>
          <Text style={styles.timeNum}>{String(time.hours).padStart(2, '0')}</Text>
          <Text style={styles.timeSep}>:</Text>
          <Text style={styles.timeNum}>{String(time.minutes).padStart(2, '0')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeNum: {
    fontSize: 20,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    lineHeight: 22,
  },
  badgeUnit: {
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    lineHeight: 12,
  },
  textCol: { flex: 1 },
  label: {
    color: '#fff',
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  meta: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 3,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  timeNum: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
  timeSep: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    marginHorizontal: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#B91C1C',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.5,
  },
});
