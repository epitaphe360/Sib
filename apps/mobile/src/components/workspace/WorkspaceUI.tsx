import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { fonts, radius, shadows, spacing } from '../../theme';
import { AppIcon, type AppIconName } from '../AppIcon';

export type WorkspaceTone = 'salon' | 'exhibitor' | 'staff' | 'service';

const TONES: Record<WorkspaceTone, { accent: string; soft: string }> = {
  salon: { accent: '#38A7D3', soft: '#E8F6FB' },
  exhibitor: { accent: '#F39200', soft: '#FFF3DE' },
  staff: { accent: '#7C5CFC', soft: '#F0ECFF' },
  service: { accent: '#0891B2', soft: '#E4F7FA' },
};

export function WorkspaceHeader({
  eyebrow,
  title,
  subtitle,
  tone,
  icon,
  status,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tone: WorkspaceTone;
  icon: AppIconName;
  status?: string;
}) {
  const { colors } = useAppTheme();
  const palette = TONES[tone];

  return (
    <View style={[styles.header, { backgroundColor: colors.primaryDark }]}> 
      <View style={[styles.headerGlow, { backgroundColor: palette.accent }]} />
      <View style={styles.headerTop}>
        <View style={[styles.headerIcon, { backgroundColor: palette.accent }]}>
          <AppIcon name={icon} size={20} color="#10233E" />
        </View>
        {status ? (
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: palette.accent }]} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text numberOfLines={2} style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text numberOfLines={2} style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  tone = 'salon',
}: {
  label: string;
  value: string | number;
  icon: AppIconName;
  tone?: WorkspaceTone;
}) {
  const { colors } = useAppTheme();
  const palette = TONES[tone];
  return (
    <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}> 
      <View style={[styles.metricIcon, { backgroundColor: palette.soft }]}> 
        <AppIcon name={icon} size={17} color={palette.accent} />
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text numberOfLines={2} style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export function WorkspaceAction({
  title,
  subtitle,
  icon,
  onPress,
  tone = 'salon',
}: {
  title: string;
  subtitle?: string;
  icon: AppIconName;
  onPress: () => void;
  tone?: WorkspaceTone;
}) {
  const { colors } = useAppTheme();
  const palette = TONES[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: palette.soft }]}> 
        <AppIcon name={icon} size={20} color={palette.accent} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text numberOfLines={2} style={[styles.actionSubtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      <AppIcon name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function WorkspaceSectionTitle({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: 14,
    minHeight: 154,
  },
  headerGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -60,
    top: -70,
    opacity: 0.18,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  headerIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: 'rgba(255,255,255,0.86)', fontFamily: fonts.bodySemiBold, fontSize: 10 },
  eyebrow: { color: 'rgba(255,255,255,0.6)', fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { color: '#fff', fontFamily: fonts.display, fontSize: 25, lineHeight: 31, marginTop: 3 },
  headerSubtitle: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 3 },
  metric: { flex: 1, minWidth: 0, borderRadius: radius.lg, borderWidth: 1, padding: 11, ...shadows.sm },
  metricIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  metricValue: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26 },
  metricLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 14, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: radius.lg, padding: 12, marginBottom: 8 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  actionSubtitle: { fontFamily: fonts.body, fontSize: 11, lineHeight: 15, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, marginTop: 10, marginBottom: 9 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
});
