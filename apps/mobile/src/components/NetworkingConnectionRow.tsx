import { AppIcon } from './AppIcon';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConnectionRequest } from '../api/networking';
import { openContactProfile } from '../lib/openContactProfile';
import { avatarColor, avatarInitials } from '../lib/avatarColor';
import { colors, fonts, radius, spacing } from '../theme';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: string, incoming: boolean, t: (k: string) => string): string {
  if (status === 'accepted') return t('networking.statusAccepted');
  if (status === 'rejected') return t('networking.statusRejected');
  if (incoming) return t('networking.statusIncoming');
  return t('networking.statusPending');
}

type Props = {
  item: ConnectionRequest;
  currentUserId: string;
  t: (k: string) => string;
  onAccept?: () => void;
  onReject?: () => void;
};

export function NetworkingConnectionRow({ item, currentUserId, t, onAccept, onReject }: Props) {
  const outgoing = item.fromUserId === currentUserId;
  const partnerId = outgoing ? item.toUserId : item.fromUserId;
  const displayName = outgoing ? item.toName ?? t('networking.unknown') : item.fromName ?? t('networking.unknown');
  const email = outgoing ? item.toEmail : item.fromEmail;
  const company = outgoing ? item.toCompany : item.fromCompany;
  const incoming = item.toUserId === currentUserId && item.status === 'pending';
  const bg = avatarColor(partnerId);
  const initials = avatarInitials(displayName);

  const openProfile = () =>
    openContactProfile({
      userId: partnerId,
      scannedAt: item.createdAt,
      salonId: item.salonId,
      salonLabel: item.salonLabel,
      kind: 'networking',
      status: item.status,
    });

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
        onPress={openProfile}
        accessibilityRole="button"
        accessibilityLabel={displayName}
      >
        <View style={[styles.avatar, { backgroundColor: bg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.top}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.time}>{formatWhen(item.createdAt)}</Text>
          </View>
          {company ? <Text style={styles.company} numberOfLines={1}>{company}</Text> : null}
          {email ? <Text style={styles.email} numberOfLines={1}>{email}</Text> : null}
          <View style={styles.eventLine}>
            <AppIcon name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.eventText} numberOfLines={1}>{item.salonLabel}</Text>
          </View>
          <Text style={styles.status}>{statusLabel(item.status, incoming, t)}</Text>
        </View>
        <AppIcon name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      {incoming && onAccept && onReject ? (
        <View style={styles.actions}>
          <Pressable style={styles.accept} onPress={onAccept}>
            <Text style={styles.btn}>{t('networking.accept')}</Text>
          </Pressable>
          <Pressable style={styles.reject} onPress={onReject}>
            <Text style={styles.btn}>{t('networking.reject')}</Text>
          </Pressable>
        </View>
      ) : null}
      <Pressable onPress={openProfile} accessibilityRole="button">
        <Text style={styles.hint}>{t('scanHistory.tapProfile')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.92 },
  main: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 14 },
  body: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  name: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  company: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.primaryDark, marginTop: 2 },
  email: { fontFamily: fonts.body, fontSize: 12, color: colors.primary, marginTop: 2 },
  eventLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  eventText: { flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.primary },
  status: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  accept: { flex: 1, backgroundColor: colors.success, padding: 8, borderRadius: radius.sm, alignItems: 'center' },
  reject: { flex: 1, backgroundColor: colors.danger, padding: 8, borderRadius: radius.sm, alignItems: 'center' },
  btn: { color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 13 },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'right' },
});
