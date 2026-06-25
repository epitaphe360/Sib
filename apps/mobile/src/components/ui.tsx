import React, { useRef } from 'react';
import { AppIcon, type AppIconName } from './AppIcon';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { useI18n } from '../i18n/I18nProvider';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { isRTL } = useI18n();
  const textDir = isRTL ? styles.textRtl : undefined;
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.title, textDir]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, textDir]}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  fullWidth = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'gold' | 'danger' | 'outline' | 'ghost';
  fullWidth?: boolean;
  icon?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 50, bounciness: 5 }).start();

  const variantStyle =
    variant === 'gold'
      ? styles.buttonGold
      : variant === 'danger'
        ? styles.buttonDanger
        : variant === 'outline'
          ? styles.buttonOutline
          : variant === 'ghost'
            ? styles.buttonGhost
            : styles.button;

  const textStyle =
    variant === 'outline' || variant === 'ghost'
      ? styles.buttonTextOutline
      : variant === 'gold'
        ? styles.buttonTextGold
        : styles.buttonText;

  return (
    <Pressable
      onPressIn={() => { if (!disabled && !loading) spring(0.96); }}
      onPressOut={() => spring(1)}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          variantStyle,
          !fullWidth && styles.buttonInline,
          (disabled || loading) && styles.buttonDisabled,
          { transform: [{ scale }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : variant === 'gold' ? colors.primary : '#fff'}
            size="small"
          />
        ) : (
          <Text style={textStyle}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: AppIconName;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.buttonPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon ? <AppIcon name={icon} size={18} color={colors.primary} /> : null}
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export function Input({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textLight}
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel={label}
        {...props}
      />
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  elevated,
  variant = 'default',
  style,
}: {
  children: React.ReactNode;
  elevated?: boolean;
  variant?: 'default' | 'navy' | 'gold';
  style?: ViewStyle | ViewStyle[];
}) {
  const variantStyle =
    variant === 'navy'
      ? styles.cardNavy
      : variant === 'gold'
        ? styles.cardGold
        : styles.card;

  return (
    <View
      style={[
        variantStyle,
        elevated && shadows.md,
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      {children}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color = 'primary',
  size = 'md',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: 'primary' | 'gold' | 'success' | 'danger' | 'muted' | 'info';
  size?: 'sm' | 'md';
}) {
  const chipColors = {
    primary: { bg: colors.primary, text: '#fff', inactiveBg: colors.borderLight, inactiveText: colors.text },
    gold: { bg: colors.gold, text: colors.primary, inactiveBg: colors.goldMuted, inactiveText: colors.warning },
    success: { bg: colors.success, text: '#fff', inactiveBg: colors.successBg, inactiveText: colors.success },
    danger: { bg: colors.danger, text: '#fff', inactiveBg: colors.dangerBg, inactiveText: colors.danger },
    muted: { bg: colors.border, text: colors.text, inactiveBg: colors.borderLight, inactiveText: colors.textMuted },
    info: { bg: colors.info, text: '#fff', inactiveBg: colors.infoBg, inactiveText: colors.info },
  };
  const c = chipColors[color];
  const bg = active ? c.bg : c.inactiveBg;
  const fg = active ? c.text : c.inactiveText;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        { backgroundColor: bg },
      ]}
      disabled={!onPress}
    >
      <Text style={[styles.chipText, size === 'sm' && styles.chipTextSm, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    pending: { label: 'En attente', bg: colors.warningBg, fg: colors.warning },
    pending_payment: { label: 'Paiement requis', bg: colors.warningBg, fg: colors.warning },
    confirmed: { label: 'Confirmé', bg: colors.successBg, fg: colors.success },
    accepted: { label: 'Accepté', bg: colors.successBg, fg: colors.success },
    active: { label: 'Actif', bg: colors.successBg, fg: colors.success },
    rejected: { label: 'Refusé', bg: colors.dangerBg, fg: colors.danger },
    cancelled: { label: 'Annulé', bg: colors.border, fg: colors.textMuted },
  };
  const s = map[status] ?? { label: status, bg: colors.border, fg: colors.textMuted };
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

/** Badge de rôle coloré selon le type d'utilisateur */
export function RoleBadge({ role, level }: { role: string; level?: string }) {
  const isVip = level === 'vip' || level === 'premium';
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    visitor: isVip
      ? { label: 'Visiteur VIP', bg: colors.goldMuted, fg: colors.warning }
      : { label: 'Visiteur', bg: '#E0E7FF', fg: '#3730A3' },
    exhibitor: { label: 'Exposant', bg: colors.successBg, fg: colors.success },
    partner: { label: 'Partenaire', bg: '#EDE9FE', fg: '#7C3AED' },
    admin: { label: 'Organisation', bg: colors.dangerBg, fg: colors.danger },
    security: { label: 'Contrôleur', bg: colors.warningBg, fg: colors.warning },
    service_client: { label: 'Service Clientèle', bg: colors.infoBg, fg: colors.info },
  };
  const s = map[role] ?? { label: role, bg: colors.border, fg: colors.textMuted };
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

export function MenuRow({
  icon,
  label,
  subtitle,
  onPress,
  accent,
  trailing,
}: {
  icon: AppIconName;
  label: string;
  subtitle?: string;
  onPress: () => void;
  accent?: string;
  trailing?: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 60, bounciness: 4 }).start();

  return (
    <Pressable
      onPressIn={() => spring(0.97)}
      onPressOut={() => spring(1)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.menuRow, { transform: [{ scale }] }]}>
        <View style={[styles.menuIcon, accent ? { backgroundColor: accent } : null]}>
          <AppIcon name={icon} size={20} color={accent ? '#fff' : colors.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuLabel}>{label}</Text>
          {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
        </View>
        {trailing ?? <AppIcon name="chevron-forward" size={16} color={colors.textLight} />}
      </Animated.View>
    </Pressable>
  );
}

export function IllustratedEmpty({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: AppIconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.illustratedEmpty}>
      <View style={styles.emptyIconWrap}>
        <AppIcon name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

export function EmptyState({ message, title }: { message: string; title?: string }) {
  const { t } = useI18n();
  return (
    <IllustratedEmpty icon="file-tray-outline" title={title ?? t('common.empty')} message={message} />
  );
}

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          style={[styles.segment, value === opt.id && styles.segmentActive]}
          onPress={() => onChange(opt.id)}
        >
          <Text style={[styles.segmentText, value === opt.id && styles.segmentTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Avatar({
  name,
  size = 64,
  showRing = true,
}: {
  name: string;
  size?: number;
  showRing?: boolean;
}) {
  const letter = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showRing ? 2 : 0,
        },
      ]}
    >
      <Text style={[styles.avatarLetter, { fontSize: size * 0.38 }]}>{letter}</Text>
    </View>
  );
}

/** Séparateur de section avec titre */
export function SectionDivider({ label }: { label?: string }) {
  if (!label) return <View style={styles.divider} />;
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

/** Bandeau d'information ou d'alerte */
export function InfoBanner({
  message,
  tone = 'info',
  icon,
}: {
  message: string;
  tone?: 'info' | 'warning' | 'success' | 'danger';
  icon?: AppIconName;
}) {
  const toneColors = {
    info: { bg: colors.infoBg, fg: colors.info, border: '#BAE6FD' },
    warning: { bg: colors.warningBg, fg: colors.warning, border: '#FDE68A' },
    success: { bg: colors.successBg, fg: colors.success, border: '#BBF7D0' },
    danger: { bg: colors.dangerBg, fg: colors.danger, border: '#FECACA' },
  };
  const c = toneColors[tone];
  const defaultIcon: AppIconName =
    tone === 'warning'
      ? 'alert-circle-outline'
      : tone === 'danger'
        ? 'close-circle-outline'
        : tone === 'success'
          ? 'checkmark-circle-outline'
          : 'information-circle-outline';

  return (
    <View
      style={[
        styles.infoBanner,
        { backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      <AppIcon name={icon ?? defaultIcon} size={16} color={c.fg} />
      <Text style={[styles.infoBannerText, { color: c.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Screen ───────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  textRtl: { writingDirection: 'rtl', textAlign: 'right' },

  // ─── Title ────────────────────────────────────────────────────────────────
  titleBlock: { marginBottom: spacing.md },
  title: {
    fontSize: 26,
    fontFamily: fonts.display,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 21,
  },

  // ─── Buttons ──────────────────────────────────────────────────────────────
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonGold: {
    backgroundColor: colors.gold,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    minHeight: 52,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonInline: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, minHeight: 44 },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: '#fff', fontSize: 15, fontFamily: fonts.bodySemiBold, letterSpacing: 0.2 },
  buttonTextGold: { color: colors.primary, fontSize: 15, fontFamily: fonts.bodySemiBold, letterSpacing: 0.2 },
  buttonTextOutline: { color: colors.primary, fontSize: 15, fontFamily: fonts.bodySemiBold, letterSpacing: 0.2 },

  // ─── Secondary Button ─────────────────────────────────────────────────────
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  secondaryText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14 },

  // ─── Input ────────────────────────────────────────────────────────────────
  inputWrap: { marginBottom: spacing.md },
  inputLabel: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  inputErrorText: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.danger,
  },

  // ─── Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardNavy: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardGold: {
    backgroundColor: colors.goldMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold,
    marginBottom: spacing.sm,
  },

  // ─── Chip ─────────────────────────────────────────────────────────────────
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  chipSm: { paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 13, fontFamily: fonts.bodySemiBold },
  chipTextSm: { fontSize: 11 },

  // ─── Status badge ─────────────────────────────────────────────────────────
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: { fontSize: 12, fontFamily: fonts.bodySemiBold },

  // ─── Menu row ─────────────────────────────────────────────────────────────
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  menuRowPressed: { backgroundColor: colors.background },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: fonts.bodySemiBold, color: colors.text },
  menuSub: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },

  // ─── Empty state ──────────────────────────────────────────────────────────
  illustratedEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.text },
  emptyMessage: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.md,
  },

  // ─── Segment control ──────────────────────────────────────────────────────
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  segmentText: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.textMuted },
  segmentTextActive: { color: colors.primary, fontFamily: fonts.bodySemiBold },

  // ─── Avatar ───────────────────────────────────────────────────────────────
  avatar: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gold,
  },
  avatarLetter: { color: '#fff', fontFamily: fonts.bodyBold },

  // ─── Section divider ──────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { fontSize: 12, fontFamily: fonts.bodyMedium, color: colors.textMuted },

  // ─── Info banner ──────────────────────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.body,
    lineHeight: 19,
  },
});
