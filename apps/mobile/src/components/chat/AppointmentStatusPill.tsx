import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../../theme';

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  pending: { bg: colors.warningBg, fg: colors.warning },
  confirmed: { bg: colors.successBg, fg: colors.success },
  rejected: { bg: colors.dangerBg, fg: colors.danger },
  cancelled: { bg: colors.border, fg: colors.textMuted },
};

export function AppointmentStatusPill({ label, status }: { label: string; status: string }) {
  const style = STATUS_STYLE[status] ?? { bg: colors.border, fg: colors.textMuted };
  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: 6,
  },
  text: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
});
